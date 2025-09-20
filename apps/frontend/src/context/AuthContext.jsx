// AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { handleLogin, getUser, logoutUser } from "../business/authManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (email, password) => {
    const result = await handleLogin(email, password);

    if (result.success) {
      
      const userResponse = await getUser();

      if (userResponse.success) {
        setCurrentUser(userResponse.data); 
        return { success: true, data: userResponse.data };
      } else {
        return { success: false, message: "Gebruiker ophalen mislukt" };
      }
    } else {
      return { success: false, message: result.message };
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
 
        const result = await getUser();
        if (result.success) {
          setCurrentUser(result);
          console.log(result)
      }
    };
    checkUserSession();
  }, []);
  
  

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
