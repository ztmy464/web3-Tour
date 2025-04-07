
// ---------------------- interface ----------------------
interface UserInterface {
    id: number;
    readonly startDate: Date;
    name: string;
    age?: number;
    greet(message: string): void;
  }
  
  const User: UserInterface = {
    id: 2,
    startDate: new Date(),
    name: "Pedro",
    greet(message) {
      console.log(message);
    },
  };
  
  User.greet("Hello");
  
// ---------------------- Unions ----------------------
type IDFieldType = string | number; 
const printID = (id: IDFieldType) => {
    console. log("ID: "+ id);
}; 
    
printID(2784737894727);

// ---------------------- Intersections ----------------------
// Define the BusinessPartner interface
interface BusinessPartner {
    name: string;
    creditScore: number;
  }
  
  // Define the UserIdentity interface
  interface UserIdentity {
    id: number;
    email: string;
  }
  
  // Use intersection type to combine BusinessPartner and UserIdentity into Employee
  type Employee = BusinessPartner & UserIdentity;
  
  // Define the signContract function, which takes an Employee type as a parameter
  const signContract = (employee: Employee): void => {
    console.log(
      "Contract signed by " + employee.name + " with email: " + employee.email
    );
  };
  
  // Call the signContract function
  signContract({
    name: "Pedro",
    creditScore: 800,
    id: 34,
    email: "pedro@gmail.com",
  });

// ---------------------- Enums ----------------------
enum LoginError {
    Unauthorized = "unauthorized",
    NoUser = "nouser",
}

const printErrorMsg = (error: LoginError) => {
    if (error === LoginError.Unauthorized) {
        console.log("User not authorized");
    } else if (error === LoginError.NoUser) {
        console.log("No user was found with that username.");
    }
};

printErrorMsg(LoginError.NoUser);

// ---------------------- Generics ----------------------
// Define a generic class StorageContainer with a type parameter T
class StorageContainer<T> {
    private contents: T[];
  
    constructor() {
      this.contents = [];
    }
  
    // Method to add an item of type T to the container
    addItem(item: T): void {
      this.contents.push(item);
    }
  
    // Method to retrieve an item from the container by index
    getItem(idx: number): T | undefined {
      return this.contents[idx];
    }
  }
  
  // Create a StorageContainer for strings
  const usernames = new StorageContainer<string>();
  usernames.addItem("pedrotech");
  usernames.addItem("echobr");
  console.log(usernames.getItem(0));
  
  // Create a StorageContainer for numbers
  const friendsCount = new StorageContainer<number>();
  friendsCount.addItem(23);
  friendsCount.addItem(678);
  console.log(friendsCount.getItem(0));
  