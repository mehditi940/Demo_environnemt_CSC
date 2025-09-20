import React, { useState } from "react";
import { useSocket } from "../../service/socketHandler";
import { motion } from 'framer-motion'

const Homepage = () => {
  const [token, setToken] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const socketHandler = useSocket(roomId, token);

  socketHandler.recieve.userJoined = (data) => {
    console.log("User joined:", data);
  };

  socketHandler.recieve.userLeft = (data) => {
    console.log("User left:", data);
  };

  socketHandler.recieve.reset = (data) => {
    console.log("Reset command received:", data);
  };

  return (
                <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
    <>
      <h1>Socket.io Authentication Example</h1>
      <div
        style={{
          marginTop: "20vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2>Enter your roomId:</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Enter your roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ padding: "10px", width: "200px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h2>Enter your token:</h2>
            <div style={{ display: "flex", gap: "1rem" }}>
              <input
                type="text"
                placeholder="Enter your token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ padding: "10px", width: "200px" }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              if (token) {
                socketHandler.start();
              } else {
                alert("Please enter a token to connect.");
              }
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Join
          </button>
          <button
            onClick={() => {
              console.log("Sending reset command...");
              socketHandler.send.reset();
            }}
          >
            Reset command
          </button>
        </div>
      </div>
    </>
    </motion.div>
  );
};

export default Homepage;
