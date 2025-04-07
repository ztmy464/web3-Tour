// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.19;
// Uni v3 core uses sol < 0.8 to suppress underflow / overflow

import "./SafeCast.sol";
import "./TickMath.sol";

library Tick {
    using SafeCast for int256;

    struct Info {
        // the total liquidity inside this stick
        uint128 liquidityGross;
        // Amount of liquidity to add / sub when tick is crossed
        // +  when tick crosses from left to right
        // -  when tick crosses from right to left
        int128 liquidityNet;
        uint256 feeGrowthOutside0X128;
        uint256 feeGrowthOutside1X128;
        // whether this tick is initialized or not
        bool initialized;
    }

    function tickSpacingToMaxLiquidityPerTick(int24 tickSpacing) internal pure returns (uint128) {
        // Round down to a multiple of tick spacing
        int24 minTick = (TickMath.MIN_TICK / tickSpacing) * tickSpacing;
        int24 maxTick = (TickMath.MAX_TICK / tickSpacing) * tickSpacing;
        // Round up num ticks
        uint24 numTicks = uint24((maxTick - minTick) / tickSpacing) + 1;
        // Max liquidity = max(uint128) = 2**128 - 1
        // Max liquidity / num of ticks

        // Ensure that the sum of all ticks does not exceed the uint128 limit
        // Calculate the maximum fluidity that each tick can accommodate
        return type(uint128).max / numTicks;
    }

    // @ztmy NOTE: Fee Growth
    function getFeeGrowthInside(
        mapping(int24 => Info) storage self,
        int24 tickLower,
        int24 tickUpper,
        int24 tickCurrent,
        uint256 feeGrowthGlobal0X128,
        uint256 feeGrowthGlobal1X128
    ) internal view returns (uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128) {
        Info storage lower = self[tickLower];
        Info storage upper = self[tickUpper];

        unchecked {
            //NOTE: Calculate fee growth below
            uint256 feeGrowthBelow0X128;
            uint256 feeGrowthBelow1X128;
            if (tickLower <= tickCurrent) {
                feeGrowthBelow0X128 = lower.feeGrowthOutside0X128;
                feeGrowthBelow1X128 = lower.feeGrowthOutside1X128;
            } else {
                feeGrowthBelow0X128 = feeGrowthGlobal0X128 - lower.feeGrowthOutside0X128;
                feeGrowthBelow1X128 = feeGrowthGlobal1X128 - lower.feeGrowthOutside1X128;
            }

            //NOTE: Calculate fee growth above
            uint256 feeGrowthAbove0X128;
            uint256 feeGrowthAbove1X128;
            if (tickCurrent < tickUpper) {
                feeGrowthAbove0X128 = upper.feeGrowthOutside0X128;
                feeGrowthAbove1X128 = upper.feeGrowthOutside1X128;
            } else {
                feeGrowthAbove0X128 = feeGrowthGlobal0X128 - upper.feeGrowthOutside0X128;
                feeGrowthAbove1X128 = feeGrowthGlobal1X128 - upper.feeGrowthOutside1X128;
            }
            //NOTE: Fee inside position (fee growth inside)
            feeGrowthInside0X128 = feeGrowthGlobal0X128 - feeGrowthBelow0X128 - feeGrowthAbove0X128;
            feeGrowthInside1X128 = feeGrowthGlobal1X128 - feeGrowthBelow1X128 - feeGrowthAbove1X128;
        }
    }

    /* 
    bool upper: 
    whether the tick is a upper tick or a lower tick
    true if updating position's upper tick

    returns (bool flipped)    
    flip means that this will be true when the liquidity gets activated or deactivated, otherwise it will return false 

    these are the two cases when this Boolean flipped will return true:
    if liquidity is equal to zero and after we call the function update liquidity becomes
    greater than zero, then flipped will be equal to ture

    another case where the fluid will be true, is if liquidity is greater than zero 
    and after calling the function update liquidity is equal to zero 
    */
    function update(
        mapping(int24 => Info) storage self,
        int24 tick,
        int24 tickCurrent,
        int128 liquidityDelta,
        uint256 feeGrowthGlobal0X128,
        uint256 feeGrowthGlobal1X128,
        bool upper,
        uint128 maxLiquidity
    ) internal returns (bool flipped) {
        Info storage info = self[tick];
        // ---------------------- update liquidityGross ----------------------
        uint128 liquidityGrossBefore = info.liquidityGross;
        uint128 liquidityGrossAfter = liquidityDelta < 0
            ? liquidityGrossBefore - uint128(-liquidityDelta)
            : liquidityGrossBefore + uint128(liquidityDelta);

        require(liquidityGrossAfter <= maxLiquidity, "liquidity > max");

        // ---------------------- chack tick flip --------------------------

        // flipped = (liquidityGrossBefore == 0 && liquidityGrossAfter > 0)
        //     || (liquidityGrossBefore > 0 && liquidityGrossAfter == 0);
        // here is a concise way to express this
        flipped = (liquidityGrossBefore == 0) != (liquidityGrossAfter == 0);

        // ---------------------- initialize feeGrowthOutside --------------------------
        if (liquidityGrossBefore == 0) {
            // NOTE: initialize feeGrowthOutside
            if (tick <= tickCurrent) {
                info.feeGrowthOutside0X128 = feeGrowthGlobal0X128;
                info.feeGrowthOutside1X128 = feeGrowthGlobal1X128;
            }
            info.initialized = true;
        }

        info.liquidityGross = liquidityGrossAfter;

        // ---------------------- update liquidityNet ----------------------
        // NOTE:
        // liquidity net
        // If upper == true, the current tick is the upper tick
        // + liquidityDelta  - liquidityDelta
        // lower                upper
        //   |                   |
        //   +                   -
        //   ----> one for zero +
        //   <---- zero for one -
        info.liquidityNet = upper ? info.liquidityNet - liquidityDelta : info.liquidityNet + liquidityDelta;
    }

    function clear(mapping(int24 => Info) storage self, int24 tick) internal {
        delete self[tick];
    }

    // when we do a swap and a tick is crossed we'll call this function
    // return liquidityNet and update feeGrowthOutside
    function cross(
        mapping(int24 => Info) storage self,
        int24 tick,
        uint256 feeGrowthGlobal0X128,
        uint256 feeGrowthGlobal1X128
    ) internal returns (int128 liquidityNet) {
        Info storage info = self[tick];
        unchecked {
            // NOTE: update feeGrowthOutside
            info.feeGrowthOutside0X128 = feeGrowthGlobal0X128 - info.feeGrowthOutside0X128;
            info.feeGrowthOutside1X128 = feeGrowthGlobal1X128 - info.feeGrowthOutside1X128;
            liquidityNet = info.liquidityNet;
        }
    }
}
