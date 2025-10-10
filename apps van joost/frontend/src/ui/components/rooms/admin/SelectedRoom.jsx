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
      <div className="room-header">
        <h2 className="room-title">{room.name}</h2>
      </div>

      <div className="room-details">
        <div className="detail-section">
          <div className="detail-item">
            <div className="detail-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Patiënt</span>
            </div>
            <div className="detail-value">{room?.patient?.nummer || 'Niet toegewezen'}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Laatst bijgewerkt</span>
            </div>
            <div className="detail-value">{new Date(room.updatedAt).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
        </div>

        <div className="models-section">
          <div className="section-header">
            <h3 className="section-title">3D Models</h3>
            <span className="model-count">{room?.models?.length || 0} model{room?.models?.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="models-list">
            {room?.models?.length > 0 
              ? room.models.map(element => ( 
                  <div key={element.id} className="model-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 16V8C21 7.44772 20.5523 7 20 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H20C20.5523 17 21 16.5523 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{element.name}</span>
                  </div>
                )) 
              : <div className="no-models">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8C21 7.44772 20.5523 7 20 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H20C20.5523 17 21 16.5523 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Geen 3D models toegevoegd</span>
                </div>}
          </div>
        </div>
      </div>

      <div className="room-actions">
        <button className="btn btn-secondary" onClick={() => setShowPopup(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 11L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Kamer bewerken</span>
        </button>
        <button className="btn btn-danger" onClick={() => setShowBevestigingPopup(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Kamer verwijderen</span>
        </button>
      </div>

      {updateStatus && <div className="update-status">{updateStatus}</div>}
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
