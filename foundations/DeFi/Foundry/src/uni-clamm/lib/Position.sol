// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.19;

import "./FullMath.sol";
import "./FixedPoint128.sol";

library Position {
    struct Info {
        // the amount of liquidity owned by this position
        uint128 liquidity;
        // fee growth per unit of liquidity as of the last update to liquidity or fees owed
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        // tokensOwed:
        // token share gained due to removal of liquidity (burn)
        // Wait for LP to call collect() to extract
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    function get(
        mapping(bytes32 => Info) storage self,
        address owner,
        int24 tickLower,
        int24 tickUpper
    ) internal view returns (Info storage position) {
        position =
            self[keccak256(abi.encodePacked(owner, tickLower, tickUpper))];
    }

    function update(
        Info storage self,
        int128 liquidityDelta,
        uint256 feeGrowthInside0X128,
        uint256 feeGrowthInside1X128
    ) internal {
        Info memory _self = self;

        if (liquidityDelta == 0) {
            // disallow pokes for 0 liquidity positions
            require(_self.liquidity > 0);
        }

        // -------------------------- Calculate fees --------------------------
        // NOTE: (feeGrowth * S_liquidity)
        uint128 tokensOwed0 = uint128(
            FullMath.mulDiv(
                feeGrowthInside0X128 - _self.feeGrowthInside0LastX128,
                _self.liquidity,
                // why we're dividing by Q128 is because liquidity is multiply by Q128
                FixedPoint128.Q128
            )
        );

        uint128 tokensOwed1 = uint128(
            FullMath.mulDiv(
                feeGrowthInside1X128 - _self.feeGrowthInside1LastX128,
                _self.liquidity,
                FixedPoint128.Q128
            )
        );
        // -------------------------- update position ----------------------------
        if (liquidityDelta != 0) {
            self.liquidity = liquidityDelta < 0
                ? _self.liquidity - uint128(-liquidityDelta)
                : _self.liquidity + uint128(liquidityDelta);
        }
        self.feeGrowthInside0LastX128 = feeGrowthInside0X128;
        self.feeGrowthInside1LastX128 = feeGrowthInside1X128;
        // ------------------------ add fees to tokensOwed --------------------------
        // calc tokensOwed
        if (tokensOwed0 > 0 || tokensOwed1 > 0) {
            self.tokensOwed0 += tokensOwed0;
            self.tokensOwed1 += tokensOwed1;
        }
    }
}
