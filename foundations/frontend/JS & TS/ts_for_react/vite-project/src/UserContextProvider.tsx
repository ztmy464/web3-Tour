import { createContext, useEffect, useState } from "react";

// Define a TypeScript interface for a User object
export interface User {
  id: string;
  name: string;
  age: number;
  isMarried: boolean;
  bio?: string;
}

// Define a TypeScript interface for the context
interface UserContextType {
  users: User[] | null;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

// Initial values for the context
const contextInitialValues: UserContextType = {
  users: null,
  addUser: () => null,
  updateUser: () => null,
  deleteUser: () => null,
};

// Create the context with initial values
export const UserContext = createContext<UserContextType>(contextInitialValues);

// Define props type for the provider component
interface Props {
  children: React.ReactNode;
}

// Create a UserProvider component that will provide the context to its children
export const UserProvider = (props: Props) => {
  // Define state to hold users
  const [users, setUsers] = useState<User[] | null>(null);

  // useEffect to initialize users state when component mounts
  useEffect(() => {
    setUsers([
      { id: "1", name: "Pedro", age: 22, isMarried: false },
      {
        id: "2",
        name: "Maria",
        age: 28,
        isMarried: true,
        bio: "Software Engineer",
      },
    ]);
  }, []);

  const newLocal = (user: Omit<User, "id">) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
    };

    setUsers((prevUsers) => (prevUsers ? [...prevUsers, newUser] : [newUser]));
  };
  // Define functions to manipulate the users state
  const addUser = newLocal;

  const updateUser = (id: string, updates: Partial<User>) => {
    // setUsers的回调函数prevUsers =>{} 的参数 prevUsers 表示更新前的用户列表
    setUsers(
      (prevUsers) =>
        // map的回调函数user =>{} 的参数 user 表示更新前的用户列表中的每个用户

        prevUsers?.map((user) =>
          user.id === id ? { ...user, ...updates } : user
        ) || null
    );
  };

  const deleteUser = (id: string) => {
    setUsers(
      (prevUsers) => prevUsers?.filter((user) => user.id !== id) || null
    );
  };

  return (
    // Provide the UserContext to child components
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {props.children}
    </UserContext.Provider>
  );
};
