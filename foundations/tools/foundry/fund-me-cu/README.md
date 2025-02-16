# FundMe 智能合约项目

这是一个基于 Foundry 构建的众筹智能合约项目。该合约允许用户向合约发送 ETH，并且只有合约所有者可以提取这些资金。
we learned how to refactor our codebase so we can make it more modular.
we're passing a price feed in, so that we can deploy this fundme contract to any chain we want.
we've added an interactions script which has two different contracts fund fundme and withdraw fundme which we can use to withdraw and fund our most recently deployed contract.
we learned more about working with mocks in testing, running integration test, forking testing.
we learned about gas we learned about storage and we built our first GitHub repo and we pushed it up.



## 功能特点

- 支持用户存入 ETH（最低金额要求为 5 USD）
- 使用 Chainlink 预言机进行 ETH/USD 价格转换
- 支持多个网络（Sepolia 测试网和本地 Anvil 网络）
- 包含全面的测试用例
- 实现了资金提取功能（仅合约所有者可操作）

## 开发环境要求

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Solidity ^0.8.18

## 项目结构

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
