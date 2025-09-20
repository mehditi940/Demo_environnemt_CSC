import React from "react";
import { FaPencilAlt, FaMousePointer, FaUndo, FaLock, FaLockOpen } from "react-icons/fa";

const ToolMenu = ({ onMouse, onPencil, onReset, onLock, isLocked }) => {
  return (
    <div className="side-floating-menu">
      <button onClick={onMouse} title="Mouse (navigate)">
        <FaMousePointer />
      </button>
      <button onClick={onPencil} title="Draw">
        <FaPencilAlt />
      </button>
      <button onClick={onReset} title="Reset">
        <FaUndo />
      </button>
      <button onClick={onLock} title={isLocked ? "Unlock" : "Lock"}>
        {isLocked ? <FaLock /> : <FaLockOpen />}
      </button>
    </div>
  );
};

export default ToolMenu;
