import React from "react";
import "../styles/components/FloatingMenu.css";

const FloatingMenu = ({ items }) => {
  return (
    <div className="floating-menu">
      {items.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </div>
  );
};

export default FloatingMenu;
