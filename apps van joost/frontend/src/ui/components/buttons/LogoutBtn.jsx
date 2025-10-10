import React from "react";
import "../../styles/components/buttons/LogoutBtn.css";
import { logoutUser } from "../../../business/authManager";
import { useNavigate } from "react-router-dom";


const LogoutBtn = () => {
  const navigate = useNavigate();
  function handleLogout(){
    logoutUser();
    navigate('/login')
  }
  return (
    <button className="logoutBtn" onClick={handleLogout}>
      Uitloggen
    </button>
  );
};

export default LogoutBtn;
