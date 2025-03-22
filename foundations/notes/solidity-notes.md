如果一个变量 没有在参数列表或函数内部声明就被使用，那么它通常是 合约的状态变量

拿到storage先存为memory
    function update(
        Info storage self,
    ) internal {
        Info memory _self = self;
        }