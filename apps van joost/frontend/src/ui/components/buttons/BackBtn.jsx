import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/components/buttons/BackBtn.css";

const BackBtn = () => {
  return (
    <button className="backBtn btn" onClick={() => window.history.back()}>
      <i className="bi bi-arrow-left me-2"></i> Terug
    </button>
  );
};

export default BackBtn;
