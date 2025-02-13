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