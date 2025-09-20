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
    return <div>Selecteer een kamer om de details te zien.</div>;
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
      <h2>{patient.nummer}</h2>
      <p><strong>Patiënt:</strong> {patient?.firstName}  {patient?.lastName}</p>
      <p><strong>Geüpdatet op:</strong> {patient.updatedAt}</p>

      <button onClick={() => setShowPopup(true)}>Patiëntgegevens updaten</button>
            <button onClick={() => setShowBevestigingPopup(true)} className='delete-room-btn'>Patiënt verwijderen</button>

      {updateStatus && <p>{updateStatus}</p>}
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
