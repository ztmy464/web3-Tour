import "./App.css";
import { User } from "./User";
import { UserProvider } from "./UserContextProvider";

// https://youtu.be/665UnOGx3Pg
function App() {
  return (
    <UserProvider>
      <User/>
    </UserProvider>
  );
}

export default App;
