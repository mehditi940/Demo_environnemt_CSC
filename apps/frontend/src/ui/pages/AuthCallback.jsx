import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeLogin } from "../../service/oidcClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await completeLogin();
        // Redirect naar admin dashboard na succesvolle login
        navigate("/admin/dashboard", { replace: true });
      } catch (e) {
        console.error("OIDC callback error", e);
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  return <div>Bezig met inloggen...</div>;
};

export default AuthCallback;
