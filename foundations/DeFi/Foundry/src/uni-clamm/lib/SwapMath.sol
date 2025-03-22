// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./FullMath.sol";
import "./SqrtPriceMath.sol";

library SwapMath {
    // calc from sqrtRatioCurrentX96 to sqrtRatioTargetX96
    function computeSwapStep(
        uint160 sqrtRatioCurrentX96,
        uint160 sqrtRatioTargetX96,
        uint128 liquidity,
        // Remaining trading volume
        int256 amountRemaining,
        // 1 bip = 1/100 x 1% = 1/1e4
        // 1e6 = 100%, 1/100 of a bip
        uint24 feePips
    )
        internal
        pure
        returns (
            uint160 sqrtRatioNextX96,
            uint256 amountIn,
            uint256 amountOut,
            uint256 feeAmount
        )
    {
        // token 1 | token 0
        //  current tick
        //  <--- 0 for 1
        //       1 for 0 --->
        bool zeroForOne = sqrtRatioCurrentX96 >= sqrtRatioTargetX96;
        // it is exactOut(not exactIn) then we specify the exact amount of token out that we want from this trade
        bool exactIn = amountRemaining >= 0;

//---------------------------- Calculate max amount in or out and next sqrtRatio ------------------

        if (exactIn) {
            // Amount remaining - fee
            uint256 amountRemainingLessFee =
                FullMath.mulDiv(uint256(amountRemaining), 1e6 - feePips, 1e6);
            // --------------------------  Calculate max amount in(round up) --------------------------

            // about round down/up:
            // amountIn needs to be rounded up: make sure there are enough tokens entered
            // amountOut needs to be rounded down: prevents the pool from giving more tokens to users

            amountIn = zeroForOne
                ? SqrtPriceMath.getAmount0Delta(
                    sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, true
                ) // true: Round up
                : SqrtPriceMath.getAmount1Delta(
                    sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, true
                );

            // --------------------------  Calculate next sqrtRatio --------------------------
            if (amountRemainingLessFee >= amountIn) {
                // there are enough tokens entered to let the price move to sqrtRatioTargetX96
                sqrtRatioNextX96 = sqrtRatioTargetX96;
            } else {
                // The tokens entered are not enough for the price to reach sqrtRatioTargetX96, 
                // calc a Intermediate price: sqrtRatioNextX96

                // 0 for 1 = target < next <= current
                // 1 for 0 = current <= next < target
                sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromInput(
                    sqrtRatioCurrentX96,
                    liquidity,
                    amountRemainingLessFee,
                    zeroForOne
                );
            }
        } else {
            // --------------------------  Calculate max amount out(round down) --------------------------
            amountOut = zeroForOne
                ? SqrtPriceMath.getAmount1Delta(
                    sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, false
                )
                : SqrtPriceMath.getAmount0Delta(
                    sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, false
                );
            // --------------------------  Calculate next sqrtRRatio --------------------------
            if (uint256(-amountRemaining) >= amountOut) {
                sqrtRatioNextX96 = sqrtRatioTargetX96;
            } else {
                // 0 for 1 = target < next <= current
                // 1 for 0 = current <= next < target
                sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromOutput(
                    sqrtRatioCurrentX96,
                    liquidity,
                    uint256(-amountRemaining),
                    zeroForOne
                );
            }
        }

QUEST: 
/*
!max && exactIn，  为什么要计算 amountIn，sqrtRatioNextX96 已经提前停止，而且sqrtRatioNextX96 的值是通过
                sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromInput(
                    sqrtRatioCurrentX96,
                    liquidity,
                    amountRemainingLessFee,
                    zeroForOne
                );
计算得出，那么价格移动到sqrtRatioNextX96 所需的amountIn不就是amountRemainingLessFee吗
*/


//------------------------ Calculate amount in and out between sqrtRatio current and next ------------------

        bool max = sqrtRatioTargetX96 == sqrtRatioNextX96;
        // max and exactIn   --> in  = amountIn
        //                       out = need to calculate
        // max and !exactIn  --> in  = need to calculate
        //                       out = amountOut
        // !max and exactIn  --> in  = need to calculate
        //                       out = need to calculate
        // !max and !exactIn --> in  = need to calculate
        //                       out = need to calculate
        if (zeroForOne) {
            amountIn = max && exactIn
                ? amountIn
                // Next <= current, round up amount in
                : SqrtPriceMath.getAmount0Delta(
                    sqrtRatioNextX96, sqrtRatioCurrentX96, liquidity, true
                );
            amountOut = max && !exactIn
                ? amountOut
                // Next <= current, round down amount out
                : SqrtPriceMath.getAmount1Delta(
                    sqrtRatioNextX96, sqrtRatioCurrentX96, liquidity, false
                );
        } else {
            amountIn = max && exactIn
                ? amountIn
                // Current <= next, round up amount in
                : SqrtPriceMath.getAmount1Delta(
                    sqrtRatioCurrentX96, sqrtRatioNextX96, liquidity, true
                );
            amountOut = max && !exactIn
                ? amountOut
                // Current <= next, round down amount out
                : SqrtPriceMath.getAmount0Delta(
                    sqrtRatioCurrentX96, sqrtRatioNextX96, liquidity, false
                );
        }

        // Cap the output amount to not exceed the remaining output amount
        if (!exactIn && amountOut > uint256(-amountRemaining)) {
            amountOut = uint256(-amountRemaining);
        }

//---------------------------------- Calculate fee --------------------------------------------
// https://github.com/Cyfrin/advanced-defi-2024/blob/main/excalidraw/amm/uniswap-v3/uniswap-v3-swap-fee.png

        if (exactIn && sqrtRatioNextX96 != sqrtRatioTargetX96) {
            // Take the remainder of the maximum input as fee
            feeAmount = uint256(amountRemaining) - amountIn;
        } else {
            // Not exact in or sqrt ratio next = target
            // - Not exact input
            // - Exact input and sqrt ratio next = target

            // a = amountIn
            // f = feePips
            // x = Amount in needed to put amountIn + fee
            // fee = x*f

            // Solve for x
            // x = a + fee = a + x*f
            // x*(1 - f) = a
            // x = a / (1 - f)

            // Calculate fee
            // fee = x*f = a / (1 - f) * f

            // fee = a * f / (1 - f)
            feeAmount =
                FullMath.mulDivRoundingUp(amountIn, feePips, 1e6 - feePips);
        }
    }
}
