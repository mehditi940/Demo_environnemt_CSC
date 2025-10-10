import React, { useState } from 'react';
import '../../../styles/components/rooms/RoomUpdatePopup.css';
import { handleUpdateRoom, handleDeleteRoom } from '../../../../business/controller/RoomController';
import { useNotification } from '../../../../context/NotificationContext'
import PatientSelect from '../../forms/newRooms/PatientSelect';

const RoomUpdatePopup = ({ room, onClose }) => {

    const [newName, setNewName] = useState(room.name);
    const [models, setModels] = useState(Array.isArray(room.models) ? [...room.models] : []);
    const [filesToUpload, setFilesToUpload] = useState([]);
    const { showNotification } = useNotification()
    const [patientUpdaten, setPatientUpdaten] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
    const [selectedPatient, setSelectedPatient] = useState('');

    const handleRemoveModel = (id) => {
      setModels(models.filter(model => model.id !== id));
    };
    
    const handleFileChange = (e) => {
      setFilesToUpload([...e.target.files]);
    };
  
    const handleSave = async () => {
  if (!newName.trim()) {
    setErrorMessage("Naam mag niet leeg zijn.");
    return;
  }

  setErrorMessage("");


  const originalModelIds = room.models.map(m => m.id);
  const currentModelIds = models.map(m => m.id);
  const modelsToRemove = originalModelIds.filter(id => !currentModelIds.includes(id));

  const updateData = {
    name: newName,
    modelsToRemove,
    updatedAt: new Date().toISOString(),
    patient: selectedPatient|| room.patient.id
  };
console.log("Update data being sent:", updateData);
  const result = await handleUpdateRoom(room.id, updateData, filesToUpload);
  console.log(result)

  if (result.success) {
    showNotification("Kamergegevens zijn aangepast!");
    onClose(true, result.data);
  } else {
    setErrorMessage(result.message);
    showNotification("Fout bij het opslaan van de kamer.");
  }
};
    const confirmDelete = async () => {
      try{
        await handleDeleteRoom(room.id);
        showNotification('Kamer is verwijderd!');
        onClose(true, { deleted: true, id: room.id });
      }catch(e){
        showNotification(e.message);
      }
    }

    return (
      <div className="popup-overlay">
        <div className="popup-card">
          <button className="close-btn" aria-label="Sluiten" onClick={() => onClose(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h2 id="room-edit-heading">Kamer aanpassen</h2>
  
          <label htmlFor="room-name-input">Naam:</label>
          <input 
            id="room-name-input"
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={errorMessage ? "input-error" : ""}
          />

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className='update-patient-container'>
{patientUpdaten ? (

  <>
    <div style={{flex:1}}>
      <PatientSelect selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
    </div>
    <button className="small-action-btn" onClick={() => setPatientUpdaten(!patientUpdaten)}>Bevestigen</button>
  </>
) : (
  <>
    <label id="room-patient-label" style={{flex:1}}>Patiënt: {room?.patient?.nummer}</label>
<button className="small-action-btn" onClick={() => setPatientUpdaten(!patientUpdaten)}>Updaten</button>
  </>
)}


                    

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
  
       <label id="room-models-label">Modellen:</label>
<div className="model-list">
  {models.map(model => (
    <div key={model.id} className="model-item">
      <span>{model.name}</span>
      <button onClick={() => handleRemoveModel(model.id)}>Verwijder</button>
    </div>
  ))}
  {models.length === 0 && <p style={{ fontSize: '14px', color: '#666' }}>Geen modellen toegevoegd.</p>}
</div>

  
          <div className="file-upload">
            <label htmlFor="room-new-files">Nieuwe bestanden:</label>
            <input 
              id="room-new-files"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            {filesToUpload.length > 0 && (
              <div>
                {filesToUpload.map((file, index) => (
                  <div key={index}>{file.name}</div>
                ))}
              </div>
            )}
          </div>
  
          <div className="popup-actions popup-actions--right">
            <button className="delete-btn" onClick={confirmDelete}>Verwijderen</button>
            <button className="save-btn" onClick={handleSave}>Opslaan</button>
          </div>
        </div>
      </div>
    );
  };

  
export default RoomUpdatePopup;
