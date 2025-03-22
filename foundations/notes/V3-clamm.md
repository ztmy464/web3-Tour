# CLAMM - Concentrated liquidity AMM

-   ### Constructor
    -   [x] `constructor`
        -   [x] Price, tick and tick spacing
        -   [x] `tickSpacingToMaxLiquidityPerTick`
-   ### Initialize
    -   [x] `initialize`
        -   [x] `slot0`
        -   [x] `sqrtPriceX96`
        -   [x] `getTickAtSqrtRatio`  
        calculate tick from _sqrtPriceX96_
-   ### Mint
    -   [x] `mint`
        -   [x] `_modifyPosition`
            -   [x] `_updatePosition`
                -   [✔] `position.get`
                -   [x] `positon.update`
                -   [x] `ticks.update`, `ticks.clear`  
                what is flip, what's it for  
                liquidityNet  
                    -   [x] `Tick.Info`
                    -   [x] Liquidity, price and token reserves
                    -   [x] Liquidity net
            -   [✔] `getAmount0Delta` and `getAmount1Delta`
                -   [x] Curve of real reserves
                -   [x] amount1 = f(tickUpper, tickLower, liquidityDelta)

-   ### Burn
    TODO: fix burn 0
    -   [ ] `burn`
 `_modifyPosition`,_tokensOwed_  

-   ### Collect
    -   [ ] `collect`
-   ### Swap
    -   [ ] `swap`
        -   [ ] one tick
            -   [ ] `computeSwapStep`  
            1. Calculate max amount in or out and next sqrtRatio  
            2. Calculate amount in and out between sqrtRatio current and next
            
                -   [ ] `sqrtRatioNextX96 = SqrtPriceMath.getNextSqrtPriceFromInput`
        -   [ ] multi ticks
            -   [ ] `nextInitializedTickWithInOneWord`
                -   [ ] TickBitMap, `tickBitMap.flipTick`
            -   [ ] `ticks.cross`
                -   [ ] `liquidityNet`
-   ### Fees
    -   [ ] `feeGrowthGlobal`
    -   [ ] `tick.cross`
    -   [ ] `getFeeGrowthInside` (burn + collect to earn fees)
-   ### Test

-   sqrtPriceX96
-   get tick from sqrt price x 96
-   get price from sqrt price x 96
-   tick bitmap
-   getSqrtRatioAtTick
-   getTickAtSqrtRatio
-   getAmount0Delta, getAmount1Delta
-   liquidity delta
-   tick, liquidity, price directions and token 0 token 1
-   getNextSqrtPriceFromAmount0RoundingUp
-   getNextSqrtPriceFromAmount1RoundingDown
-   why `fee = amountIN * fee / (1 - fee)`
-   nextInitializedTickWithinOneWord
-   liquidityNet
-   fee growth (per liquidity)
-   how does burn update tokensOwed

### Links

https://uniswapv3book.com/

https://blog.uniswap.org/uniswap-v3-math-primer

https://blog.uniswap.org/uniswap-v3-math-primer-2

https://trapdoortech.medium.com/uniswap-deep-dive-into-v3-technical-white-paper-2fe2b5c90d2



Tick.feeGrowthOutside0X128
Position.feeGrowthInside0LastX128
clamm.feeGrowthGlobal0X128

**Position.feeGrowthInside:**

calculate: `_updatePosition` -> `Tick.getFeeGrowthInside` 

```
// get fee growth inside
(uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128) =
    ticks.getFeeGrowthInside(tickLower, tickUpper, tick, _feeGrowthGlobal0X128, _feeGrowthGlobal1X128);
// pass fee growth inside then calc tokensOwed
position.update(liquidityDelta, feeGrowthInside0X128, feeGrowthInside1X128);

```

**Tick.feeGrowthOutside:**

initialize: `_updatePosition` -> `Tick.update`  
update: `swap` -> `Tick.cross` 


**clamm.feeGrowthGlobal:** Use for what? Where?

1. initialize feeGrowthOutside: `_updatePosition` -> `Tick.update` 
2. calculate feeGrowthInside: `_updatePosition` -> `Tick.getFeeGrowthInside` 

3. grow feeGrowthGlobal: `swap` 
```
if (state.liquidity > 0) {
    // fee growth += fee amount * (1 << 128) / liquidity
    state.feeGrowthGlobalX128 += FullMath.mulDiv(step.feeAmount, FixedPoint128.Q128, state.liquidity);
}
```
4. update Tick.feeGrowthOutside0X128: `swap` -> `cross` 