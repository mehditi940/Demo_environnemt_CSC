import React, { useState } from 'react';
import '../../../styles/components/rooms/RoomUpdatePopup.css';
import { handleUpdateRoom } from '../../../../business/controller/RoomController';
import { useNotification } from '../../../../context/NotificationContext'
import PatientSelect from '../../forms/newRooms/PatientSelect';
import { handleUpdatePatient } from '../../../../business/controller/PatientController';

const PatientUpdatePopup = ({ patient, onClose }) => {

    const [newNumber, setNewNumber] = useState(patient.nummer);
    const [fName, setFName] = useState(patient.firstName);
    const [lName, setLName] = useState(patient.lastName)
    const { showNotification } = useNotification()
const [errorMessage, setErrorMessage] = useState("");

    
 
  
    const handleSave = async () => {
  if (!newNumber.trim()) {
    setErrorMessage("nummer mag niet leeg zijn.");
    return;
  }

  setErrorMessage("");




  const updateData = {
    nummer: newNumber,
    firstName: fName,
    lastName: lName,
    updatedAt: new Date().toISOString(),
  };
  const result = await handleUpdatePatient(patient.id, updateData);

  if (result.success) {
    showNotification("Kamergegevens zijn aangepast!");
    onClose(true, result.data);
  } else {
    setErrorMessage(result.message);
    showNotification("Fout bij het opslaan van de kamer.");
  }
};
    return (
      <div className="popup-overlay">
        <div className="popup-card">
          <button className="close-btn" onClick={() => onClose(false)}>X</button>
          <h2>Patiëntgegevens aanpassen</h2>
  
       <label>Voornaam:</label>
    <input 
            type="text" 
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            className={errorMessage ? "input-error" : ""}
          />
         <label>Achternaam:</label>
    <input 
            type="text" 
            value={lName}
            onChange={(e) => setLName(e.target.value)}
            className={errorMessage ? "input-error" : ""}
          />
  
          <div className='update-patient-container'>


                    

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
  

        
  
          <button className="save-btn" onClick={handleSave}>Opslaan</button>
        </div>
      </div>
    );
  };

  
export default PatientUpdatePopup;
