import { useContext, useState } from "react";
import { UserContext, User as UserType } from "./UserContextProvider";

export const User = () => {
  // ------------------------ useState ------------------------
  //@ztmy useContext,isShowInfo,userBio
  const { users, addUser, updateUser, deleteUser } = useContext(UserContext);
  const [isShowInfo, setShowInfo] = useState<boolean>(false);
  const [userBio, setUserBio] = useState<string>("");
  
  // Form states for creating/updating users
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [isMarried, setIsMarried] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // -------------------- handle function --------------------
  const toggleInfo = () => {
    setShowInfo((prev) => !prev);
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLInputElement>, userId: string) => {
    setUserBio(event.target.value);
    setSelectedUserId(userId);
  };

  const handleSaveBio = (userId: string) => {
    updateUser(userId, { bio: userBio });
    setUserBio("");
    setSelectedUserId(null);
  };

  const handleAddUser = () => {
    if (!name || !age) {
      alert("Please fill in name and age fields");
      return;
    }
    
    addUser({
      name,
      age: parseInt(age),
      isMarried
    });
    
    // Reset form
    setName("");
    setAge("");
    setIsMarried(false);
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  // ------------------------ render ------------------------
  return (
    <div>
      <h2>User Management</h2>
      
      {/* ------------------------ add user form ------------------------ */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Add New User</h3>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="checkbox"
              checked={isMarried}
              onChange={(e) => setIsMarried(e.target.checked)}
            /> Married
          </label>
        </div>
        
        <button
          onClick={handleAddUser}
          style={{ 
            padding: "8px 15px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Add User
        </button>
      </div>
      
      {/* ------------------------ toggle info ------------------------ */}
      <button onClick={toggleInfo}>
        {isShowInfo ? "Hide User List" : "Show User List"}
      </button>
      
      {isShowInfo && users && (
        <div style={{ marginTop: "20px" }}>
          <h3>User List</h3>
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            users.map((user) => (
              <div 
                key={user.id} 
                style={{ 
                  border: "1px solid #ddd", 
                  padding: "15px", 
                  marginBottom: "10px", 
                  borderRadius: "5px" 
                }}
              >
                <h4>{user.name}</h4>
                <p>Age: {user.age}</p>
                <p>Status: {user.isMarried ? "Married" : "Single"}</p>
                <p>Bio: {user.bio || "No bio available"}</p>
                
                <div style={{ marginTop: "10px" }}>
                  <input
                    value={selectedUserId === user.id ? userBio : user.bio || ""}
                    onChange={(e) => handleBioChange(e, user.id)}
                    placeholder="Update bio"
                    style={{ marginRight: "10px", padding: "5px" }}
                  />
                  <button 
                    onClick={() => handleSaveBio(user.id)}
                    style={{ 
                      padding: "5px 10px", 
                      backgroundColor: "#2196F3", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px",
                      marginRight: "10px",
                      cursor: "pointer"
                    }}
                  >
                    Update Bio
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ 
                      padding: "5px 10px", 
                      backgroundColor: "#f44336", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};