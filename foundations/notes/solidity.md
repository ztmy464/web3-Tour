## 1

如果一个变量 没有在参数列表或函数内部声明就被使用，那么它通常是 合约的状态变量

## 2

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
为什么 observe() 里没有显式 return tickCumulatives, secondsPerLiquidityCumulativeX128s？
1️⃣ observations.observe() 返回的值类型 完全匹配 observe() 的返回值类型。
2️⃣ Solidity 允许 直接返回函数调用的返回值，不需要额外定义变量。

