
- 🌟 **Intro**  

1.   ⚡️ Different between V2 and V3  
2.   ⚡️ Concentrated Liquidity  
3.   ⚡️ Liquidity Price Graph  
4.   ⚡️ V3 Contracts  

---

- 🌐 **Spot Price**  

1.   ⚡️ Price and Tick  

---

- 📐 **Math**  

1.   ⚡️ Curve Equation  
2.   ⚡️ Price Delta  
3.   ⚡️ Liquidity Delta  

---

- 🎚️ **Tick**  

1.   ⚡️ Tick Bitmap  
2.   ⚡️ Flip a Tick  
3.   ⚡️ Get Next Tick  

---

- 💰 **Fee Algorithm**  

1.   ⚡️ Fee Equation  
2.   ⚡️ Fee Growth  
3.   ⚡️ Fee Growth Outside  
4.   ⚡️ Position Fee  
5.   ⚡️ Fee Code Summary  

---

- 🔄 **Swap**  

1.   ⚡️ Liquidity Net  
2.   ⚡️ Swap Code Summary  
3.   ⚡️ Swap Contract Calls  
4.   ⚡️ Difference between Exact Input and Output  

---

- 🏭 **Factory**  

---

- 📊 **Liquidity**  

1.   ⚡️ Tick Spacing  
2.   ⚡️ NonfungiblePositionManager  
3.   ⚡️ Adding Liquidity  
4.   ⚡️ Removing Liquidity  

---

- ⚖️ **Flash & Arbitrage**  

---

- ⏳ **TWAP Price Oracle**  

1.   ⚡️ Math TWAP  
2.   ⚡️ Code TWAP  

---

- 🎯 **Just In Time Liquidity**  

---

---

[uniswap-v3.md](https://github.com/Cyfrin/advanced-defi-2024/blob/2c02a22513529666ac8f8545ac981fbae4107bc6/uniswap-v3.md)

[clamm](https://github.com/t4sk/clamm/tree/main)

## 🌟 Intro

### ⚡️ different between V2 V3

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bxj7wkft21y4xyjtzvn5.png)

### ⚡️ concentrated liquidity

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ueosuu21uabvrwx5j0qo.png)

concentrated liquidity is to add liquidity for a certain **price ranges**.
- The concentrated liquidity provision is similar to the "pending order", when the market price enters the user-set range, the liquidity will be automatically swapped. 
- This mechanism allows LP to use capital more efficiently while "trading passively".

**position** = liquidity concentrated in a price range

### ⚡️ liquidity price graph

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hthlx8dgcx5urd0xb1p4.png)

This graph represents the liquidity at each price, and at each price, liquidity is calculated by stacking up all of the position that overlaps with the price.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5o7ftlhhs6sj4ejcntmc.png)

To the left of the current price, all of the liquidity  is in Token Y(USDC), And to the right of the current price,liquidity  is all in token X.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/z1klp2bfmkyx6584pinw.png)

If the price range you set does not include the current price, you can only add one token.

### ⚡️ V3 Contracts

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a3kj5dt584825evvk9aq.png)


Now this Swap Router02 Contract has been upgraded to another
contract inside the repository Uniswap Router. This Uniswap Router Contract is a more comprehensive contract that will allow you to swap between Uniswap V2, V3, and some NFTs.

When call the function in V3pool, the caller must also be a smart contract.

## 🌐 Spot Price

Because there may be multiple positions in different price ranges, you cannot just simply take the amount of token Y and the amount of token X in the contract to figure out what the spot price is.

in uniswap V3 opposite of V2, it no longer keeps track of the amount of reserves, Instead, it keeps track of the current price, and from the current price, if we know the liquidity and the price ranges, then we can calculate the amount of tokens that must be locked in those price range.

- bool zeroForOne = tokenIn < tokenOut
- zeroForOne:  0 -> 1 => sqrt price decrease
- !zeroForOne: 1 -> 0 => sqrt price increase 

### ⚡️ price and tick

The way that the **price** is stored inside Uniswap V3 is by this formula:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cc7h2lz9plhle7a9wiii.png)

Use one of sartPricex96 and tick can calculate the spot price.

```java
IUniswapV3Pool.Slot0 memory slot0 = pool.slot0();
// 1 / P = X / Y = USDC / WETH
//               = price of WETH in terms of USDC

// P has 1e18 / 1e6 = 1e12 decimals
// 1 / P has 1e6 / 1e18 = 1e-12 decimals

// sqrtPriceX96 * sqrtPriceX96 might overflow
// So use FullMath.mulDiv to do uint256 * uint256 / uint256 without overflow

// price = sqrt(P) * Q96 * sqrt(P) * Q96 / Q96
price = FullMath.mulDiv(slot0.sqrtPriceX96, slot0.sqrtPriceX96, Q96);
// 1 / price = 1 / (P * Q96)
price = 1e12 * 1e18 * Q96 / price;
```

## 📐 Math

### ⚡️ curve equation

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t8eu3l8mzmlourg18i29.png)

 **equation** for x and y from liquidity and price.

[curve of real reserves](https://github.com/Cyfrin/advanced-defi-2024/blob/2c02a22513529666ac8f8545ac981fbae4107bc6/excalidraw/amm/uniswap-v3/uniswap-v3-curve-real-reserves.png)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/brssghy54nnsrp6ro102.png)

**Q1:** [what is the +/- dx or dy after price change?](https://github.com/Cyfrin/advanced-defi-2024/blob/main/excalidraw/amm/uniswap-v3/uniswap-v3-xy-amounts.png)

```java
    /// @return amount0 Amount of currency0 required to cover a position of size liquidity between the two passed prices
    function getAmount0Delta(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint128 liquidity,
        bool roundUp
    ) internal pure returns (uint256 amount0)

    /// @return amount1 Amount of currency1 required to cover a position of size liquidity between the two passed prices
    function getAmount1Delta(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint128 liquidity,
        bool roundUp
    ) internal pure returns (uint256 amount1)
```

### ⚡️ Price Delta

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vq62zglbq7t4nsznxy26.png)

**Q2:** [what is the price change after +/- dx or dy?]
(https://github.com/Cyfrin/advanced-defi-2024/blob/2c02a22513529666ac8f8545ac981fbae4107bc6/excalidraw/amm/uniswap-v3/uniswap-v3-delta-price.png)

```java
    /// @notice Gets the next sqrt price given an input amount of currency0 or currency1
    /// @dev Throws if price or liquidity are 0, or if the next price is out of bounds
    /// @param sqrtPX96 The starting price, i.e., before accounting for the input amount
    /// @param liquidity The amount of usable liquidity
    /// @param amountIn How much of currency0, or currency1, is being swapped in
    /// @param zeroForOne Whether the amount in is currency0 or currency1
    /// @return sqrtQX96 The price after adding the input amount to currency0 or currency1
    function getNextSqrtPriceFromInput(
        uint160 sqrtPX96,
        uint128 liquidity,
        uint256 amountIn,
        bool zeroForOne
    ) internal pure returns (uint160 sqrtQX96)

    function getNextSqrtPriceFromOutput(
        uint160 sqrtPX96,
        uint128 liquidity,
        uint256 amountOut,
        bool zeroForOne
    ) internal pure returns (uint160 sqrtQX96)
```

### ⚡️ Liquidity Delta

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2wqu3i1v2vipo66mbmey.png)

**Q3:** what is the liquidity after +/- dx or dy?

## 🎚️ Tick

when you do a trade how does uniswap find the next position?

it finds the next position is by recording the position stick lower and tick upper in a mapping called tick bitmap.

### ⚡️ tick bitmap

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ypbdwh3xd69vpjcnlxrf.png)

tick bitmap is a mapping(From int16 to uint256) that stores the ticks that define the liquidity position.

**tick**

a tick basically is an int24 that splits into int16(key) and uint8(value).

**How to get tick from bitmap**

access the key fill up the first 16 bits access the index and then fill up the last 8 Bits.

### ⚡️ flip a tick

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/chx9zbii229ba2w9nj1z.png)

### ⚡️ get Next tick

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pcapw33zvh4d0mdmdx6t.png)

## 💰 Fee Algorithm

### ⚡️ Fee Equation

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kmgv4dg2r66vtjtjdymt.png)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5ek0k5a9ztcsx0d4soo1.png)

```java
// NOTE:
if (state.liquidity > 0) {
    // fee growth += fee amount * (1 << 128) / liquidity
    state.feeGrowthGlobalX128 += FullMath.mulDiv(step.feeAmount, FixedPoint128.Q128, state.liquidity);
}
```

[calc-fee from liquidity and time](https://github.com/t4sk/clamm/blob/main/doc/clamm-11-calc-fee.png)

### ⚡️ Fee Growth

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xvttkporm0q27pai7py9.png)

**Fee Growth inside**

 find the fee growth between I_lower and I_upper.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/n4ly8o2m55pooixkk8rc.png)

**Fee Growth Below**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fwj7k4bqzi03hhmetjx2.png)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oti6wuoizdudhq4ywzas.png)

**Fee Growth Above**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/go76bjh19oq4jq9q56zj.png)

in function Tick.getFeeGrowthInside:
```java
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
```

### ⚡️ Fee Growth Outside

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f6bfivd28rmg0687ylws.png)

It only change(flip) at the moment when i_c cross over the tick i.
It always records f on the other side of i.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xi40tvcts6wtaevvsyll.png)

**initialize** in function Tick.update:
```java
if (liquidityGrossBefore == 0) {
    // NOTE: initialize feeGrowthOutside
    // TODO: why initialize below tick?
    if (tick <= tickCurrent) {
        info.feeGrowthOutside0X128 = feeGrowthGlobal0X128;
        info.feeGrowthOutside1X128 = feeGrowthGlobal1X128;
    }
    info.initialized = true;
}
```

**update** in function Tick.cross:
```java
info.feeGrowthOutside0X128 = feeGrowthGlobal0X128 - info.feeGrowthOutside0X128;
info.feeGrowthOutside1X128 = feeGrowthGlobal1X128 - info.feeGrowthOutside1X128;
liquidityNet = info.liquidityNet;
```
### ⚡️ Position fee

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/56gih780mgqgpiyzcqct.png)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/587daxpldm0jkdu5ygmw.png)

This is how to calc fee inside position over a period of time.

in function Tick.getFeeGrowthInside:
```java
//NOTE: Fee inside position (fee growth inside)
feeGrowthInside0X128 = feeGrowthGlobal0X128 - feeGrowthBelow0X128 - feeGrowthAbove0X128;
feeGrowthInside1X128 = feeGrowthGlobal1X128 - feeGrowthBelow1X128 - feeGrowthAbove1X128;
```

**both of them are Uninitialized**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/q18m9qlc6f2cq32bxxjy.png)

when f_out_lower/upper at t_i(time i) has not cross i_lower/upper, we **initialize** it.
 
when f_out_lower/upper at t_i(time i) crossed i_lower/upper, we **update** it.

**Fee Growth when one of them is initialized**

[calculate F0-F2 when i_lower initialized and i_upper not initialized]
(https://github.com/t4sk/clamm/blob/main/doc/clamm-18-fee-growth-init-2.png)

**Fee Growth when both of them are initialized**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zs8hmz1nt7i2dqobw8q7.png)

### ⚡️ Fee code sum up

**Position.feeGrowthInside:**

calculate: `_updatePosition` -> `Tick.getFeeGrowthInside` 

```java
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
2. update Tick.feeGrowthOutside0X128: `swap` -> `cross` 
3. calculate feeGrowthInside: `_updatePosition` -> `Tick.getFeeGrowthInside` 
4. grow feeGrowthGlobal: `swap` 
```java
if (state.liquidity > 0) {
    // fee growth += fee amount * (1 << 128) / liquidity
    state.feeGrowthGlobalX128 += FullMath.mulDiv(step.feeAmount, FixedPoint128.Q128, state.liquidity);
}
```

## 🔄 Swap

### ⚡️ liquidity net

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4oyga16v17wx4wdiskr9.png)

The pink number is the liquidity net.

To this current liquidity 13, we add [(+1)*(-10)] -> [direction*liquidity net] So the active liquidity when the current tick crosses over this tick(-10), must be equal to three.

This was an example of how liquidity nets that are stored at the ticks keep track of the current liquidity. Every time the current tick crosses over one of these ticks, it will either add or minus some liquidity net to update the current liquidity.

```java
// NOTE: liquidityNet (left +, right -)
if (zeroForOne) {
    liquidityNet = -liquidityNet;
}
// How will liquidity change after crossing the current liquidityNet
state.liquidity = liquidityNet < 0
    ? state.liquidity - uint128(-liquidityNet)
    : state.liquidity + uint128(liquidityNet);
```

### ⚡️ Swap code sum up

[uniswap-v3-swap-flow chart](https://github.com/Cyfrin/advanced-defi-2024/blob/main/excalidraw/amm/uniswap-v3/uniswap-v3-swap-algo.png)

### ⚡️ Swap contract calls

Know the recipient and payer of the process of Exact input and output, the flow of tokens in the intermediate process.

Call the uniswapV3pool will recive token, then in the callback will pay the token.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7rs5ybz4qy2fcgyuqo51.png)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qa90iv1cxye5w14d9c4m.png)

### ⚡️ the different between Exact input and output

The order of path encoded of exact output is reverse compared to exact input (params.tokenIn, params.fee, params.tokenOut).

When the function exact input is called, it will make a while loop call the internal function `exactOutputInternal`.

the SwapRouter02 will receive token, then SwapRouter02 will pay for the callback.

```java
// function exactInput:
address payer = hasAlreadyPaid ? address(this) : msg.sender;

while (true) {
    bool hasMultiplePools = params.path.hasMultiplePools();

    // the outputs of prior swaps become the inputs to subsequent ones
    params.amountIn = exactInputInternal(
        params.amountIn,
        hasMultiplePools ? address(this) : params.recipient, // for intermediate swaps, this contract custodies
        0,
        SwapCallbackData({
            path: params.path.getFirstPool(), // only the first pool in the path is necessary
            payer: payer
        })
    );

    // decide whether to continue or terminate
    if (hasMultiplePools) {
        payer = address(this);
        // [A, fee, B, fee, C, fee, D] -> [B, fee, C, fee, D] -> [C, fee, D]
        params.path = params.path.skipToken();
    } else {
        // [C, fee, D]
        amountOut = params.amountIn;
        break;
    }
}
```

When the function exact output is called, it will make a recursion at uniswapV3SwapCallback to recursive call into the internal function `exactOutputInternal`.

the SwapRouter02 will set the recipient to the UniswapV3Pool from the previous recursive. In the next level of recursion, the next UniswapV3Pool will pay it.

```java
// function uniswapV3SwapCallback:
if (isExactInput) {
    pay(tokenIn, data.payer, msg.sender, amountToPay);
} else {
    // if is ExactOutput making a recursive call.
    if (data.path.hasMultiplePools()) {
        //@ztmy remove the first token from the path.
        data.path = data.path.skipToken();
        //@ztmy NOTE: making a recursive call.
        // Here message sender to this callback is the pool itself.
        exactOutputInternal(amountToPay, msg.sender, 0, data);
    } else {
        amountInCached = amountToPay;
        // note that because exact output swaps are executed in reverse order, tokenOut is actually tokenIn
        pay(tokenOut, data.payer, msg.sender, amountToPay);
    }
}
```

## 🏭 Factory

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6v4ykpocv9akyn8d3h4n.png)

all UniswapV3Pool contracts can be determined by these three inputs.

## 📊 Liquidity

### ⚡️ Tick Spacing

Different tick spacing is allowed to adapt to different market requirements.Lower tick space means liquidity can be concentrated higher, at the cost of using more gas during the swap (more times to move the tick at a price range).

- USDC/DAI, tickSpacing = 1
- WETH/DAI, tickSpacing = 60

### ⚡️ NonfungiblePositionManager

- `mint` -> `addLiquidity` -> `pool.mint`

- `increaseLiquidity` -> `addLiquidity` -> `pool.mint`

- `decreaseLiquidity` -> `pool.burn`

- `collect` -> `pool.burn`(Calling burn only updates tokensOwed) -> `pool.collect`

### ⚡️ add liquidity

- to call function `mint` to add liquidity in NonfungiblePositionManager.sol.

- it mint NFT based on a tokenId as the index to mapping the position.

```java
// function mint:
_mint(params.recipient, (tokenId = _nextId++));

_positions[tokenId] = Position({
    nonce: 0,
    operator: address(0),
    poolId: poolId,
    tickLower: params.tickLower,
    tickUpper: params.tickUpper,
    liquidity: liquidity,
    feeGrowthInside0LastX128: feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: feeGrowthInside1LastX128,
    tokensOwed0: 0,
    tokensOwed1: 0
});
```
### ⚡️ remove liquidity

- When the user calls the function `decreaseLiquidity`, it calls the function `burn` on Unisob B3 full contract, but no callback function to transferr token over to the user.

- To actually transfer the tokens, the user will have to call another function `collect`.

## ⚖️ Flash & Arbitrage

[uniswap-v3-flash](https://solidity-by-example.org/defi/uniswap-v3-flash/)

`UniswapV3FlashSwap.sol` -> use function Flash to do a flash loan
```java
// @ztmy in this contract, we borrow dai and repey, don't do arbitrage
function flash(uint256 amount0, uint256 amount1) external {
    bytes memory data = abi.encode(
        FlashCallbackData({
            amount0: amount0,
            amount1: amount1,
            // know who called into the function called Flash
            caller: msg.sender
        })
    );

    //---------------------- UNISWAP_V3 [borrow DAI] ------------------------
    IUniswapV3Pool(pool).flash(address(this), amount0, amount1, data);
}
```

`UniswapV3FlashSwapArbitrage.sol` -> use function swap to do a flash loan
```java
// 1. Flash swap on pool0 (receive WETH)
// 2. Swap on pool1 (WETH -> DAI)
// 3. Repay pool0 with DAI
//---------------------- [borrow WETH from pool0] ------------------------
// here we call swap function which can do a flash loan same as function flash
// different between swap and flash when do a flash loan:
// 1. Different parameter list
// 2. swap call uniswapV3SwapCallback with amount0, which is (amount0 + fee0)

IUniswapV3Pool(pool0).swap({
    recipient: address(this),
    zeroForOne: zeroForOne,
    amountSpecified: int256(amountIn),
    sqrtPriceLimitX96: sqrtPriceLimitX96,
    data: data
});
```

## ⏳ TWAP Price Oracle

### ⚡️ Math TWAP

In V2, TWAP is taken by `arithmetic mean` of the prices.
In V3, TWAP is taken by `geometric mean` of the prices.

**tick Cumulative -> time weighted average tick -> TWAP**

tickCumulative_t+1 = tickCumulative_t + (tick_c × t_delta)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fnww6hl35zhxqfizzuba.png)

**in Uniswap V2, TWAP of token × and Y are not reciprocal:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/789dus0cyol1rqfy4301.png)

- when the spot price suddenly drops(left), TWAP calculated in V3 converges to the spot price than V2.

- when the spot price suddenly spikes up(right), TWAP calculated in V2 reacts quicker than V3.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w7hmlo5jbo33z8e8s8ti.png)

### ⚡️ Code Walkthrough Twap

`Oracle.sol` -> `transform`: calculate tickCumulative.

`observations.write` -> `transform`

- A new observation'struct is saved whenever the liquidity or price changes by calling a function called `write`.
- `write` is called at `_modifyPosition` and `swap` in pool contract.

`observe`

`IUniswapV3Pool(pool).observe` -> `observations.observe` -> `observeSingle` -> `transform`, `getSurroundingObservations`

```java
// @ztmy call to get the tick cumulative.
// For the input you re passing an array of seconds, seconds ago from now.
function observe(uint32[] calldata secondsAgos)
    external
    view
    override
    noDelegateCall
    returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)
{
    return observations.observe(
        _blockTimestamp(),
            secondsAgos, 
            slot0.tick, 
            slot0.observationIndex, 
            liquidity, 
            slot0.observationCardinality
    );
}
```

`OracleLibrary.sol` -> `consult`
```java
//@ztmy this function will do is return the average tick over some time duration.
function consult(address pool, uint32 secondsAgo)
    internal
    view
    returns (int24 arithmeticMeanTick, uint128 harmonicMeanLiquidity)
```

``getQuoteAtTick``
```java
// tick: TWAT (time weighed average tick)
function getQuoteAtTick(int24 tick, uint128 baseAmount, address baseToken, address quoteToken)
    internal
    pure
    returns (uint256 quoteAmount)
{
    // Calculate sqrtRatioX96
    uint160 sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);

    // Calculate quoteAmount with better precision if it doesn't overflow when multiplied by itself
    if (sqrtRatioX96 <= type(uint128).max) {
        uint256 ratioX192 = uint256(sqrtRatioX96) * sqrtRatioX96;
    
        quoteAmount = baseToken < quoteToken
            // @ztmy
            // P = ratioX192 = (3000 USDC / 1 ETH), baseAmount = 1
            // P * baseAmount = (3000 USDC / 1 ETH) * 1 = 3000 USDC
            ? FullMath.mulDiv(ratioX192, baseAmount, 1 << 192)

            // P = 1 / ratioX192, baseAmount = 6000 USDC
            // baseAmount / ratioX192 = 6000 USDC * (1 ETH / 3000 USDC) = 2 ETH
            : FullMath.mulDiv(1 << 192, baseAmount, ratioX192);
    } else {
        uint256 ratioX128 = FullMath.mulDiv(sqrtRatioX96, sqrtRatioX96, 1 << 64);
        quoteAmount = baseToken < quoteToken
            ? FullMath.mulDiv(ratioX128, baseAmount, 1 << 128)
            : FullMath.mulDiv(1 << 128, baseAmount, ratioX128);
    }
}

```

## 🎯 Just In Time Liquidity

[What Is Just In Time Liquidity?](https://github.com/Cyfrin/advanced-defi-2024/blob/main/excalidraw/amm/uniswap-v3/uniswap-v3-jit.png)

Justin sees that Bob has submitted a transaction to do a trade, then front runs the transaction to add liquidity so that he can earn a lot of fees.

