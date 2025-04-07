"use strict";
const User = {
    id: 2,
    name: "Pedro",
    greet(message) {
        console.log(message);
    },
};
User.greet("Hello");
const printID = (id) => {
    console.log("ID: " + id);
};
printID(2784737894727);
// Define the signContract function, which takes an Employee type as a parameter
const signContract = (employee) => {
    console.log("Contract signed by " + employee.name + " with email: " + employee.email);
};
// Call the signContract function
signContract({
    name: "Pedro",
    creditScore: 800,
    id: 34,
    email: "pedro@gmail.com",
});
var LoginError;
(function (LoginError) {
    LoginError["Unauthorized"] = "unauthorized";
    LoginError["NoUser"] = "nouser";
})(LoginError || (LoginError = {}));
const printErrorMsg = (error) => {
    if (error === LoginError.Unauthorized) {
        console.log("User not authorized");
    }
    else if (error === LoginError.NoUser) {
        console.log("No user was found with that username.");
    }
};
printErrorMsg(LoginError.NoUser);
