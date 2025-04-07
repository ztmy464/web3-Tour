## This Series of Learning Plans

First and foremost, I want to say thanks to Patrick Collins for this fantastic course: [Learn Solidity Smart Contract Development](https://youtu.be/-1GB6m39-rM?si=shn6Cf4sbw6fUkEV).  
This learning plan is based on the outline of his course.

### 1 Solidity - Remix
1. ★ | 2 | Remix - Simple Storage  
2. ★ | 3 | Storage Factory  
3. ★ | 4 | Fund Me  
4. ★ | 5 | AI Prompting  

### 2 Solidity - Foundry
1. ★ | 6 | Foundry Simple Storage  
2. ★ | 7 | Foundry Fund Me  
3. ★ | 8 | HTML Fund Me  
4. ★ | 9 | Foundry Smart Contract Lottery  

### 3 Solidity - Advanced Foundry
1. ★ | 10 | ERC20s  
2. ★ | 11 | NFTs  
3. ★ | 12 | DeFi Stablecoin  
4. ★ | 13 | Merkle Trees and Signatures  
5. ★ | 14 | Upgradable Smart Contracts  
6. ★ | 15 | Account Abstraction  
7. ★ | 16 | DAOs  
8. ★ | 17 | Security Introduction  

---

## Daily Updates Include:
- New knowledge encountered in today's study -→ ✅ harvest
- My practice (if I had done it)             -→ ✅ practice
- Today's learning summary and feelings      -→ ✅ sum & F

---

## lesson 2–3
### 12 Feb:
✅ harvest:

✔️.*public*
```c++
Person[] public listOfPeople;
```
"public" keyword can create a getter function automatically.

✔️.*mapping*
```c++
mapping(string => uint256) public nameToFavoriteNumber;
nameToFavoriteNumber[_name] = _favoriteNumber;
```
mapping is like a dictionary in python.

✔️.*Factory contract*
```c++
    function createSimpleStorageContract() public {
        SimpleStorage simpleStorageContractVariable = new SimpleStorage();
        // SimpleStorage simpleStorage = new SimpleStorage();
        listOfSimpleStorageContracts.push(simpleStorageContractVariable);
    }
```
use a Factory contract to create and mange the SimpleStorage contract

✔️.*inherit*
```c++
contract AddFiveStorage is SimpleStorage {
    function store(uint256 _favoriteNumber) public override {
        myFavoriteNumber = _favoriteNumber + 5;
    }

contract SimpleStorage:
function store(uint256 _favoriteNumber) public virtual {
    myFavoriteNumber = _favoriteNumber;
}
```
- virtual: Function in the parent contract. If you want the subcontract to be overwritten, you need to add the virtual keyword.
- override:  The subcontract overwrites the function in the parent contract and requires the override keyword.

✔️. *data storage*
There are three types of Solidity data storage locations: storage, memory, and calldata:
- storage (contract state variable) : The default state variable in the contract is storage, stored on the chain.
- memory: Parameters and temporary variables in a function are usually stored in memory and are not chained. In particular, if the returned data type is variable in length, memory modification must be added, such as: string, bytes, array, and custom structures.
- calldata: Similar to memory, it is stored in memory and is not linked. Unlike memory, the calldata variable is immutable.

✅ sum & F:
  Actually, I learned solidity basics and install foundry about half a year ago when I was in university, but now I have almost forgotten everything. Now I am graduating and settling down to restart. Today is the first day, and I will persist in studying every day. 

  Welcome everyone to follow my journey and learn with me!

  If you're also interested in Web3 technology, feel free to reach out—we can exchange ideas and grow together!
  
---

## lesson 4-5
### 13 Feb:
✅ harvest:

✔️.*oracle*
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4kpn54mnaxjhssc5c5o6.png)
  chain link nodes each reaches out and gets the information about an asset and then signs the data with their own private key in a single transaction then one node will deliver all the data with all the different signatures to a reference contract.
```c++
function getPrice() internal view returns (uint256) {
        // Sepolia ETH / USD Address
        // https://docs.chain.link/data-feeds/price-feeds/addresses
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(answer * 10000000000);
    }
```
retrieves the latest price of Ethereum (ETH) in USD from a Chainlink price feed and returns the value.

✔️.*library*
```c++
// before use library:
getConversionRate(msg.value)

// create a library:
library PriceConverter {}

// use library for uint256:
using PriceConverter for uint256;
msg.value.getConversionRate();
```
for uint256 This part says we're going to extend the functions in PriceConverter to uint256.
so a uint256 variable can call a PriceConverter function as an object, just like a uint256 method itself. There is no need to explicitly pass parameters.

✔️._constant & immutable_
```c++
uint256 public constant MINIMUM_USD = 50 * 1e18110 ** 18;
//21,415 gas -constant
//23,515 gas -non-constant
//21,415 * 141000000000 = $9.058545
//23,515 * 141000000000 = $9.946845

address public /* immutable */ i_owner;
```
if you don't use the constant keyword in Solidity, the variable will use storage by default, gas is high not only when deployed, but also when the variable is fetched.

- constant: Applies to values that are determined at compile time.
- immutable: applies to variables that are determined at deployment time, but do not change thereafter.

✔️._modifier & custom errors_
```c++
// custom errors
error NotOwner();
// modifier 
    modifier onlyOwner() {
        // require(msg.sender == owner, "not owner");
        // call the error code as opposed to calling the entire string
        if (msg.sender != i_owner) {revert NotOwner(); }
        _;
    }
// use modifier to withdraw
function withdraw() public onlyOwner{}
```

- "_;" at the end means execute modifier first, then the part of the function that use this modifier.
- every characters in this error log needs to get stored individually.so call the error code as opposed to calling the entire string can save gas, since we don't have to store and emit this long string.
- revert is the same as require.

✔️._SendETH_
```c++
// // transfer
// payable(msg.sender).transfer(address(this).balance);

// // send
// bool sendSuccess = payable(msg.sender).send(address(this).balance);
// require(sendSuccess, "Send failed");

// call
(bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
require(callSuccess, "Call failed");
```
- There is no gas limit for call, which is the most flexible and recommended way;
- The gas limit of transfer is 2300 gas, transaction will be reverted if it fails;
- The gas limit of send is 2300, the transaction will not be reverted if it fails.

✔️._receive & fallback_
```c++
    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()
```

✔️✔️✔️._ERC-2335_
```bash
# create defaultKey
cast wallet import defaultKey --interactive
# see defaultKey
cast wallet list
# here you can find this defaultKey file
cd .foundry/keystores/
# use the defaultKey
forge script script/DeployFundMe.s.sol:DeployFundMe –-account defaultKey --sender 0xf39fd6e51aad88f6f4cебab8827279cfffb92266
# delete bash history 
history -c
rm .bash_history
```
Private key update, use cast provide by foundry.