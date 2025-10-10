import React from "react";
import "../styles/components/QrCode.css";
import { useNavigate } from "react-router-dom";

const QrCode = ({ src, roomId }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="qr-container">
        <div className="overlay-qr"></div>
        <img className="qrImg" src={src} alt="QR code van de room"></img>

        <button
          className="accentBtn-qr"
          onClick={() => {
            navigate(`/chirurg/view/${roomId}`, { state: { roomId } });
          }}
        >
          Naar view pagina
        </button>
      </div>
    </>
  );
};

export default QrCode;
