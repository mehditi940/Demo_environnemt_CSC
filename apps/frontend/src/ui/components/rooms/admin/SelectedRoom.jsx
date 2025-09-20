import React, { useEffect, useState } from 'react';
import { getUserById } from '../../../../business/authManager';
import RoomUpdatePopup from './RoomUpdatePopup';
import { handleDeleteRoom } from '../../../../business/controller/RoomController';
import { useNotification } from '../../../../context/NotificationContext'
const SelectedRoom = ({ room, onRoomDeleted }) => {
  const [user, setUser] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showBevestigingPopup, setShowBevestigingPopup] = useState(false);
  const { showNotification } = useNotification()
  useEffect(() => {
    if (room) {
      const getUser = async () => {
        const response = await getUserById(room.createdBy);
        console.log(room.createdBy);
        
        setUser(response);
      };
      getUser();
    }
  }, [room]);

  if (!room) {
    return <div>Selecteer een kamer om de details te zien.</div>;
  }

  const confirmSubmit = async () => {
    try{
       await handleDeleteRoom(room.id);
             if (onRoomDeleted) {
        onRoomDeleted(room.id); // Parent laten weten dat kamer is verwijderd
      }
       setShowBevestigingPopup(false)
      showNotification("Kamer is verwijderd!")
    }catch(error){
      showNotification(error.message)
    }

  }

  return (
    <div className='selected-room-card'>
      <h2>{room.name}</h2>
      <p><strong>Patiënt:</strong> {room?.patient?.nummer}</p>
      {/* <p><strong>Gemaakt door:</strong> {user ? user.firstName + " " +  user.lastName : room.createdBy}</p> */}
      <p><strong>Geüpdatet op:</strong> {room.updatedAt}</p>
<p><strong>Models:</strong></p>
<div className="models-list">
  {room?.models?.length > 0 
    ? room.models.map(element => ( 
        <span key={element.id}>{element.name}</span>
      )) 
    : <span>Geen models</span>}
</div>
      <button onClick={() => setShowPopup(true)}>Kamer updaten</button>
            <button onClick={() => setShowBevestigingPopup(true)} className='delete-room-btn'>Kamer verwijderen</button>

      {updateStatus && <p>{updateStatus}</p>}
{showBevestigingPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
          <p>Weet je zeker dat je <strong>{room.name}</strong> wil verwijdern?</p>

            <div className="modal-actions">
              <button className="confirm-button-delete" onClick={confirmSubmit}>
                Verwijderen
              </button>
              <button className="cancel-button" onClick={() => setShowBevestigingPopup(false)}>
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
      {showPopup && 
        <RoomUpdatePopup 
          room={room} 
          onClose={() => setShowPopup(false)} 
        />}  
    </div>
  );
};

export default SelectedRoom;
