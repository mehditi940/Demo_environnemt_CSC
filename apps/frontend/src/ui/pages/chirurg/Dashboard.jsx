import React, { useEffect, useState } from "react";
import "../../styles/pages/chirurg/Dashboard.css";
import { useNavigate } from "react-router-dom";
import QrCode from "../../components/QrCode";
import QRCode from "qrcode";
import LogoutBtn from "../../components/buttons/LogoutBtn";
import { handleGetRooms } from "../../../business/controller/RoomController";
import Select from "react-select";
import { motion } from "framer-motion";
import SelectedRoom from "../../components/rooms/admin/SelectedRoom";
import SelectedRoomChirurg from "../../components/rooms/chirurg/SelectedRoomChirurg";
import dummyAPI from "../../../service/apiHandler";

const ChirurgDashboard = () => {
  const [qr, setQr] = useState(false);
  const [src, setSrc] = useState("/logo.png");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const getAllRooms = async () => {
      const results = await handleGetRooms();
      setRooms(results.data);
    };
    getAllRooms();
  }, []);

  const generateQrCode = async () => {
    const data = await dummyAPI.connection.create_connection(selectedRoom.id);

    QRCode.toDataURL(data.qrCodeString).then(setSrc);
    setQr(true);
  };

  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: room.name,
    data: room,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <>
        <div className={`main-container ${src ? "qr-active" : ""}`}>
          <h1>Rooms</h1>

          <div className="optionsContainer">
            {/* Geen rooms melding */}
            {rooms.length === 0 ? (
              <p style={{ color: "red" }}>Geen rooms beschikbaar.</p>
            ) : (
              <>
                <Select
                  options={roomOptions}
                  value={
                    selectedRoom
                      ? roomOptions.find((opt) => opt.value === selectedRoom.id)
                      : null
                  }
                  onChange={(selectedOption) =>
                    setSelectedRoom(selectedOption.data)
                  }
                  placeholder="Zoek een room..."
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />

                <button className="accentBtn" disabled={!selectedRoom}>
                  Bevestigen
                </button>
              </>
            )}
          </div>

          <button className="primaryBtnChirurg" onClick={generateQrCode}>
            QR code genereren
          </button>

          {qr && <QrCode src={src} roomId={selectedRoom.id} />}

          {/* Room details */}
          <SelectedRoomChirurg room={selectedRoom} />
        </div>
        <LogoutBtn />
      </>
    </motion.div>
  );
};

export default ChirurgDashboard;
