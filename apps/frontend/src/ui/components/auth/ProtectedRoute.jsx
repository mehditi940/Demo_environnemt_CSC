import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../../../business/authManager";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        console.log("Gebruiker opgehaald:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Fout bij ophalen gebruiker:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>; // Wacht tot de user is geladen

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />; // Terug naar login als user niet mag
  }

  return element;
};

export default ProtectedRoute;
