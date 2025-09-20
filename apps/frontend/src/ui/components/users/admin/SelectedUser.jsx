import React, { useState } from 'react';
import UserUpdatePopup from './UserUpdatePopup';
import { useNotification } from '../../../../context/NotificationContext'
import { handleDeletePatient } from '../../../../business/controller/PatientController';
import PatientUpdatePopup from './UserUpdatePopup';
import { handleUpdateUser } from '../../../../business/controller/userController';

const SelectedUser = ({ user, onPatientDeleted }) => {
  const [updateStatus, setUpdateStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showBevestigingPopup, setShowBevestigingPopup] = useState(false);
  const { showNotification } = useNotification();

  if (!user) {
    return <div>Selecteer een gebruiker om de details te zien.</div>;
  }

  const confirmSubmit = async () => {
     try {

      // Gebruik handleUpdateUser om de deleted status aan te passen
      const result = await handleUpdateUser(user.id, {
        deleted: "true",
        updatedAt: new Date().toISOString()
      });

      if (result.success) {
        if (onPatientDeleted) {
          onPatientDeleted(user.id);
        }
        setShowBevestigingPopup(false);
        showNotification("Gebruiker is gedeactiveerd!");
      } else {
        showNotification(result.message);
      }
    } catch(error) {
      showNotification(error.message);
    }
  };

  return (
    <div className='selected-room-card'>
      <h2>{user.nummer}</h2>
      <p><strong>Naam:</strong> {user?.firstName}  {user?.lastName}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Geüpdatet op:</strong> {user.updatedAt}</p>

      <button onClick={() => setShowPopup(true)}>Gebruikergegevens updaten</button>
      <button onClick={() => setShowBevestigingPopup(true)} className='delete-room-btn'>
        Gebruiker verwijderen
      </button>

      {updateStatus && <p>{updateStatus}</p>}
      
      {showBevestigingPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Weet je zeker dat je <strong>{user.email}</strong> wil deactiveren?</p>
            <div className="modal-actions">
              <button className="confirm-button-delete" onClick={confirmSubmit}>
                Deactiveren
              </button>
              <button className="cancel-button" onClick={() => setShowBevestigingPopup(false)}>
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPopup && 
        <UserUpdatePopup 
          user={user} 
          onClose={() => setShowPopup(false)} 
        />}  
    </div>
  );
};

export default SelectedUser;