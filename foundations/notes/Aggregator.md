# process

1. **获取结构化链上数据**
   - **DEX Subgraphs** ：
     - Graph 节点监听链上事件，查询索引好的、结构化的、历史/聚合数据
   - **Multicall**
     - 智能合约模式, 依赖 RPC 节点，读取实时链上状态，不能获取历史数据


2. **construct the graph**
   - **获取报价(转换数据)**
     - `viem` 
     - DEX SDKs :
       - [uniswap sdk](https://docs.uniswap.org/sdk/core/overview)


3. **Smart order routing (SOR)**
   - 参考：
     - `Deeplink Labs: Eta X V1`
     - `DODO Research`
   - **难点**：
     - 订单拆分
     - 多跳路由（需考虑 Gas 优化、Slippage）
     
     - Maximum return
     - Lowest gas cost return

   - 

4. **模拟交易**

----

# progress bar  

Obtain on-chain data？ → The Graph notes  
↓  
Which data should be obtained？##  
↓  
Optimal path discovery?  → materials #   
|  
How to construct the graph (vertex & edges)？  
|  
How to traversing the graph (pathfinding algorithms)?  
DFS、Floyd-Warshall &  Bellman-Ford、heuristic

---

## Which data should be obtained？

swap A to B :

1.  **Discover Relevant Pools:** Find the Uniswap V3 liquidity pools that facilitate swaps between the two tokens the user wants to trade. Remember Uniswap V3 has multiple pools for the same pair, differing by fee tier (e.g., 0.05%, 0.3%, 1%).
2.  **Get Current Pool State for Pricing:** For each relevant pool, fetch the necessary real-time (or near real-time) data to calculate the current exchange rate, estimate the output amount, and determine price impact/slippage.


**I. Essential Data Needed:**

1.  **Pools (`Pool` Entity):** 
    * `id`: The contract address of the pool (essential for identifying the pool).
    * `token0`: Information about the first token in the pair.
        * `id`: Token contract address.
        * `symbol`: Token symbol (e.g., "WETH").
        * `decimals`: Token decimals (crucial for converting amounts).
    * `token1`: Information about the second token in the pair (same fields as `token0`).
    * `feeTier`: The fee percentage for this pool (e.g., "500" for 0.05%, "3000" for 0.3%, "10000" for 1%). Used to identify different pools for the same pair.
    * `liquidity`: The *current* total active liquidity in the pool. This is fundamental for V3 price calculations. Represented as a large integer.
    * `sqrtPrice`: The *current* price of token0 in terms of token1, expressed as a square root (√P) in Q64.96 fixed-point format. Crucial for pricing.
    * `tick`: The *current* price tick the pool is operating at. Also essential for V3 calculations.
    * `totalValueLockedUSD` (Optional but Recommended): Total value locked in the pool in USD. Useful for filtering out insignificant pools or displaying pool stats.
    * `volumeUSD` (Optional): Recent trading volume. Also useful for filtering or stats.

2.  **Tokens (`Token` Entity):** 
    * `id`: Token contract address.
    * `symbol`: Symbol.
    * `name`: Full name.
    * `decimals`: Decimals.

**II. How to Build Queries:**

The most common task is finding relevant pools for a given token pair (e.g., Token A and Token B).

**Strategy:** Query pools that contain *at least one* of the tokens, then filter in your backend. Querying for exact pairs directly using `where: {token0: A, token1: B}` can be cumbersome because you also need the `where: {token0: B, token1: A}` case. A more practical approach:

1.  Query all pools where `token0` is Token A.
2.  Query all pools where `token1` is Token A.
3.  **filter** out pools with very low liquidity (`totalValueLockedUSD` or `liquidity`).


**III. Backend Logic After Querying:**
1.  Combine these results in backend.
2.  Filter the combined list to keep only those pools where the *other* token is Token B.
3.  Use the `liquidity`, `sqrtPrice`, `tick`, `feeTier`, and token `decimals` from these pools in your aggregator's pricing/routing algorithm (likely using a Uniswap V3 SDK or library for the complex math).

---

## How to construct the graph?

This kind of problem falls under the category of "Dynamic Graph or State-aware Shortest Path" in graph theory.



---

# materials

## 1inch related contents

🧩 [Chainstack and 1inch](https://chainstack.com/1inch-on-chainstack-journey-to-defi-excellence/?utm_source=chatgpt.com)

```Deployment of 28 subgraphs on Dedicated Subgraphs dedicated indexer```

1inch 选择使用 Dedicated Subgraph, 技术上和 The Graph 的 Subgraph 是一样的机制, 但不是托管在 The Graph 官方的 Hosted Service 或 Decentralized Network，而是由 Chainstack 等节点服务商托管的“专属服务”。

💡 [可以用Chainstack 部署你自己的 Dedicated Subgraph](https://chainstack.com/dedicated-subgraphs/)

---

🧩 [The 1inch RabbitHole - Stay protected from sandwich attacks](https://1inch.io/rabbithole/)

---

🧩 [Introducing 1inch v2 ](https://blog.1inch.io/introducing-1inch-v2-defis-fastest-and-most-advanced-aggregation-protocol/#tl-dr)

```1inch can pack, unpack and migrate collateral tokens from Aave and Compound as part of the swap path.```

[Pathfinder .png]
```
Splitting a swap across multiple supported liquidity protocols

The utilization of different ‘market depths’ within the same protocol

using 'market depths' as bridges 
// Route through one or more intermediate tokens
// WETH → USDC/USDT → WBTC 
// Here, the USDC and USDT are utilized as the "market depth" that serves as a "bridge".
```


Maximum return and lowest gas return

[Maximum Lowest gas cost return.png]

1inch v2 supports all major protocols:

Uniswap V1, Uniswap V2, WETH, Balancer, Curve, Chai, Sushiswap, Kyber, Oasis, Mooniswap, Compound, Aave, Yearn, Bancor, PMM, C.R.E.A.M. Swap, Swerve, BlackholeSwap, Value Liquid, DODO, Shell.

---

🧩 [1inch Swap API v6, Pathfinder](https://portal.1inch.dev/documentation/contracts/aggregation-protocol/aggregation-introduction?utm_source=chatgpt.com)

### **Fusion Mode**:

is an **intent-based swap** mechanism:

- Instead of executing the swap directly on-chain,  
- The user signs and broadcasts an **intent** like “I want to swap X,”  
- This creates an **off-chain order** containing a limit price and a minimum acceptable return,  
- Then, a third party on-chain — known as a **Resolver** — fills the order and completes the swap.

✅ No gas fees for the user 
🛡️ MEV-resistant (prevents front-running)


🔄 Dutch Auction:

- The exchange rate **decreases block by block over time**,  
- Until it reaches the **minimum return** set by the user.  
- **Resolvers** choose **the optimal moment to fill** the order — ideally when it's most profitable for them — anywhere along the price curve.

### **AggregationRouterV6**:

Execute the simulation path on the chain.

---

## "SOR" related contents

### Deeplink Labs on medium
 
🧩 [Pathfinding Algorithms for DEX Aggregation and Smart Order Routing](https://medium.com/deeplink-labs/pathfinding-algorithms-for-dex-aggregation-and-smart-order-routing-9e9feaf6b796)

```
Representing Smart Order Routing for DEX Aggregation as a Pathfinding Problem

it may be the case that the construction of the graph and its edges is a more complicated task than traversing the graph once created. Selecting valid pools, deciding whether to split orders along with the size and number of those splits, assigning weights
```

💡 Selecting valid pools(The vertex set) -> assigning weights(construct the graph edges) ->  traversing the graph


🧩 [Eta X V1](https://medium.com/deeplink-labs/eta-x-v1-2-speed-scale-and-efficiency-4b21b4dee1b#e4f5)

 finding near-optimal paths through large graphs:

 - Floyd-Warshall &  Bellman-Ford algorithm

 - heuristic algorithms

🧩 [Eta X V2](https://medium.com/deeplink-labs/eta-x-v1-2-speed-scale-and-efficiency-4b21b4dee1b#e4f5)


keep a running cache of all liquidity pools contained within each supported DEX in the backend.

🧩 [Eta X V3](https://medium.com/deeplink-labs/eta-x-v1-3-expanded-dex-support-and-larger-trades-with-order-splitting-91ac0fe2cd70)

Order Splitting

---

### DODO

🧩 [DODO Research: Reveal the Secrets of the Aggregator — Problem Analysis and Model Building](https://blog.dodoex.io/dodo-research-reveal-the-secrets-of-the-aggregator-problem-analysis-and-model-building-ba0ead85948c)

```
1.1 Linear routing
if a user needs to trade ETH to USDC, the optimal path found by A linear routing is to trade ETH to USDT, then it goes to USDC, not [A-C-B] or [A-D-B] (that is, the asset A is not split into two parts and selects different paths). The chosen path only goes through two pools. These two pools may come from different protocols. For example, the protocol to trade ETH to USDT is from the Uniswap V3 pool, and the USDT-USDC protocol is from the Curve V1 pool. DEX such as Uniswap V2 and PancakeSwap also use this routing model.


At first glance, it seems to be a straightforward problem about the shortest path, and there are many mature algorithms for reference. But unlike the ordinary shortest path problems, in the process of looking for the next edge, under the weight of an edge is associated with the path in front of the sequence of the node. Therefore, in the optimum path of nodes joining the queue, each node has a state that needs to be maintained in real-time. It makes the subsequent sequence nodes of recorded path length match the state of the preceding sequence nodes. And in this problem, the final “minimum weight” is calculated not by summing the weights of all edges on the path but by calculating only the entry weight of the toToken node. This characteristic makes the traditional shortest path algorithm not wholly applicable.

When there are few nodes, it is more intuitive to search with the Depth First Search (DFS) algorithm directly, that is, to traverse every path and get the final toToken price, to select the optimal path for users to exchange. The Uniswap V2 route uses this method to find the optimal path. The first version of the Uniswap V3 route uses this method as well.
```


This kind of problem falls under the category of "Dynamic Graph or State-aware Shortest Path" in graph theory.

---

### 0x

🧩 [0x Smart Order Routing](https://0x.org/post/0x-smart-order-routing)

💡 The idea of splitting orders:

Some exchanges offer better rates but at high slippage while others offer worse rates for lower slippage. Below are real-world quotes taken from 2 DEXes to illustrate this common scenario.
[fill size.png]
[fill size 2.png]

---

🧩 [blog.astroport.fi:From Point A to Point Z](https://blog.astroport.fi/post/from-point-a-to-point-z-how-swap-paths-are-determined-on-astroport)

```
During the DFS traversal, the algorithm also checks for duplicate routes by generating a hash for each route and storing it in a set. This allows the algorithm to keep track of unique routes and avoid storing duplicate paths, further enhancing efficiency.
```

---

🧩 [Smart Order Routing: The Secret Sauce of Efficient DEX Aggregators](https://www.fastercapital.com/content/Smart-Order-Routing--Smart-Order-Routing--The-Secret-Sauce-of-Efficient-DEX-Aggregators.html#The-Role-of-SOR-in-Enhancing-Liquidity)

💡 This is the best article that explains the relevant concepts:

What is SOR functions within DEX aggregators

how SOR enhances liquidity

some case studies that showcase SOR in action(what defi action can do with SOR):  
Arbitrage、High-Volume Trade、Gas Fee Optimization

