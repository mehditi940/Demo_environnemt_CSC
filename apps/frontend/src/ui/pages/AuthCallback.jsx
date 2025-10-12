import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { completeLogin } from "../../service/oidcClient";
import { AuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) {
      return;
    }
    processedRef.current = true;

    (async () => {
      try {
        await completeLogin();
        await refreshUser();
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      } catch (error) {
        console.error("OIDC callback error", error);
        navigate(ROUTES.LOGIN, { replace: true });
      }
    })();
  }, [navigate, refreshUser]);

  return <div>Bezig met inloggen...</div>;
};

export default AuthCallback;
