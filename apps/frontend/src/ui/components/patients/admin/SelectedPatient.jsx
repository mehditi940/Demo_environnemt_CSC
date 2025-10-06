import React, { useEffect, useState } from 'react';

import { useNotification } from '../../../../context/NotificationContext'
import { handleDeletePatient } from '../../../../business/controller/PatientController';
import PatientUpdatePopup from './PatientUpdatePopup';
const SelectedPatient = ({ patient, onPatientDeleted }) => {
  const [updateStatus, setUpdateStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showBevestigingPopup, setShowBevestigingPopup] = useState(false);
  const { showNotification } = useNotification()


  if (!patient) {
    return <div>Selecteer een patiënt om de details te zien.</div>;
  }

  const confirmSubmit = async () => {
    try{
       await handleDeletePatient(patient.id);
             if (onPatientDeleted) {
        onPatientDeleted(patient.id); // Parent laten weten dat kamer is verwijderd
      }
       setShowBevestigingPopup(false)
      showNotification("Patiënt is verwijderd!")
    }catch(error){
      showNotification(error.message)
    }

  }

  return (
    <div className='selected-room-card'>
      <div className="room-header">
        <h2 className="room-title">{patient.nummer}</h2>
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
            <div className="detail-value">{patient?.firstName} {patient?.lastName}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Laatst bijgewerkt</span>
            </div>
            <div className="detail-value">{new Date(patient.updatedAt).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
        </div>
      </div>

      <div className="room-actions">
        <button className="btn btn-secondary" onClick={() => setShowPopup(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 11L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Patiënt bewerken</span>
        </button>
        <button className="btn btn-danger" onClick={() => setShowBevestigingPopup(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Patiënt verwijderen</span>
        </button>
      </div>

      {updateStatus && <div className="update-status">{updateStatus}</div>}
      {showBevestigingPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Weet je zeker dat je <strong>{patient.nummer}</strong> wil verwijdern?</p>
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
        <PatientUpdatePopup 
          patient={patient} 
          onClose={() => setShowPopup(false)} 
        />}
    </div>
  );
};

export default SelectedPatient;
