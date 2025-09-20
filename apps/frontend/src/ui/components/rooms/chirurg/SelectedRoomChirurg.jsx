import React, { useEffect, useState } from "react";
import { getUserById } from "../../../../business/authManager";
const SelectedRoomChirurg = ({ room }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (room) {
      const getUser = async () => {
        const response = await getUserById(room.createdBy);
        setUser(response);
      };
      getUser();
    }
  }, [room]);

  if (!room) {
    return <div>Selecteer een kamer om de details te zien.</div>;
  }

  return (
    <div className="selected-room-card">
      <h2>{room.name}</h2>
      <p>
        <strong>Patiënt:</strong> {room?.patient?.nummer}
      </p>
      {/* <p><strong>Gemaakt door:</strong> {user ? user.firstName + " " +  user.lastName : room.createdBy}</p> */}
      <p>
        <strong>Geüpdatet op:</strong> {room.updatedAt}
      </p>
      <p>
        <strong>Models:</strong>
      </p>
      <div className="models-list">
        {room?.models?.length > 0 ? (
          room.models.map((element) => (
            <span key={element.id}>{element.name}</span>
          ))
        ) : (
          <span>Geen models</span>
        )}
      </div>
    </div>
  );
};

export default SelectedRoomChirurg;
