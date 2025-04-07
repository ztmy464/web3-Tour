//-------------- anonymous function --------------

<button onClick={() => {
    console.log("hello world");
}}>
</button>

//-------------- ternary operator --------------
let age = 16;
let name = age > 10 ? "Pedro" : "Jack";

const Component = () => {
    return age > 10 ? <div>Pedro</div> : <div>Jack</div>;
};

let color = "red";
let isCorrect = ture;
// If the first operand is truthy (true), the second operand is returned as the result of the expression.
color = isCorrect && "green";
console.log(color); // Outputs: "green"


//---------------------------- object ----------------------------

//-------------- destructuring objects --------------
const person ={
    name,
    age,
    isMarried: false,
}; 
const {name1, age1, isMarried1} = person;

//-------------- spread operator --------------
const person2 = {...person, name: "Jack"};

let names = ["Pedro", "Jessica", "Carol", "Pedro", "Pedro"];
const names2= [...names, "Joel"];

//--------------  map --------------
names.map((name) => {
    return <h1> { name} </h1>
});

//--------------  filter --------------
let filteredNames = names.filter((name) => name !== "Pedro");

console.log(filteredNames);

//--------------  ${animalName} and ? --------------
const fetchData = async (animalName) => {
    const data = await fetch(`imaginaryapi. com/search?q=${animalName}`);
    //  (?.) ensures that if data.person is undefined or null, it won't throw an error but instead return undefined
    const name = data.person?.name;
};  