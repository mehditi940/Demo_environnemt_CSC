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

  // Bepaal effectieve rollen op basis van backend role en ADFS uiRole
  const effectiveRoles = new Set();
  if (user?.role) effectiveRoles.add(user.role);
  if (user?.uiRole) effectiveRoles.add(user.uiRole);
  // Map ADFS uiRole 'chirurg' naar route-rol 'surgeon'
  if (user?.uiRole === "chirurg") effectiveRoles.add("surgeon");
  // Behandel super-admin en system als admin voor route-toegang
  if (user?.role === "super-admin" || user?.role === "system") effectiveRoles.add("admin");

  const isAllowed = user && allowedRoles.some((r) => effectiveRoles.has(r));
  if (!isAllowed) {
    return <Navigate to="/login" replace />; // Terug naar login als user niet mag
  }

  return element;
};

export default ProtectedRoute;
