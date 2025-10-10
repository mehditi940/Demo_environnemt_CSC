import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import FormWrapper from "./common/FormWrapper";
import { loginWithAdfs } from "../../../service/oidcClient";

const LoginForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const rolePaths = {
      admin: ROUTES.ADMIN.DASHBOARD,
      surgeon: ROUTES.SURGEON.DASHBOARD,
      user: ROUTES.SURGEON.DASHBOARD,
      default: ROUTES.ADMIN.DASHBOARD,
    };

    navigate(rolePaths[currentUser.role] || rolePaths.default);
  }, [currentUser, navigate]);

  const handleAdfsLogin = (event) => {
    event.preventDefault();
    loginWithAdfs();
  };

  return (
    <FormWrapper
      title="Inloggen"
      description="Klik op de knop hieronder om door te gaan."
      onSubmit={handleAdfsLogin}
    >
      <div className="uf-actions">
        <button
          type="button"
          className="uf-button uf-button-primary"
          onClick={loginWithAdfs}
        >
          Inloggen
        </button>
      </div>
    </FormWrapper>
  );
};

export default LoginForm;
