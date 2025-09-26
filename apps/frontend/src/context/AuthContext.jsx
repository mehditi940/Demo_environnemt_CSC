// AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { getUser, logoutUser } from "../business/authManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // AD-only: login gaat via OIDC redirect knop, hier geen lokale login meer

  useEffect(() => {
    const checkUserSession = async () => {
 
        const result = await getUser();
        if (result.success) {
          setCurrentUser(result.data);
        }
    };
    checkUserSession();
  }, []);
  
  

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
