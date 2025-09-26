import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/forms/LoginForm.css';
import { loginWithAdfs } from '../../../service/oidcClient';
import { AuthContext } from '../../../context/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      const rolePaths = {
        'super-admin': '/admin/dashboard',
        'admin': '/chirurg/dashboard',
        'default': '/chirurg/dashboard'
      };
      navigate(rolePaths[currentUser.role] || rolePaths.default);
    }
  }, [currentUser, navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <button
          type="button"
          className="login-button"
          onClick={() => loginWithAdfs()}
        >
          Inloggen met AD (ADFS)
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
