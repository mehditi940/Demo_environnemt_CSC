// AuthContext.js
import React, { createContext, useCallback, useEffect, useState } from "react";
import { getUser, logoutUser } from "../business/authManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const refreshUser = useCallback(async () => {
    try {
      const result = await getUser();
      if (result.success) {
        setCurrentUser(result.data);
        return result.data;
      }
      setCurrentUser(null);
    } catch (error) {
      console.error("Error checking user session:", error);
      setCurrentUser(null);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
