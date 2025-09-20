import React, { useState } from 'react';
import '../../../styles/components/rooms/RoomUpdatePopup.css';
import { handleUpdateRoom } from '../../../../business/controller/RoomController';
import { useNotification } from '../../../../context/NotificationContext'
import PatientSelect from '../../forms/newRooms/PatientSelect';

const RoomUpdatePopup = ({ room, onClose }) => {

    const [newName, setNewName] = useState(room.name);
    const [models, setModels] = useState([...room.models] || []);
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
    return (
      <div className="popup-overlay">
        <div className="popup-card">
          <button className="close-btn" onClick={() => onClose(false)}>X</button>
          <h2>Kamer aanpassen</h2>
  
          <label>Naam:</label>
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={errorMessage ? "input-error" : ""}
          />

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className='update-patient-container'>
{patientUpdaten ? (

    <>
    <PatientSelect selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
<button onClick={() => setPatientUpdaten(!patientUpdaten)}>Bevestigen</button>
  </>
) : (
  <>
    <label>Patiënt: {room?.patient?.nummer}</label>
<button onClick={() => setPatientUpdaten(!patientUpdaten)}>Updaten</button>
  </>
)}


                    

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
  
       <label>Modellen:</label>
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
            <label>Nieuwe bestanden:</label>
            <input 
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
  
          <button className="save-btn" onClick={handleSave}>Opslaan</button>
        </div>
      </div>
    );
  };

  
export default RoomUpdatePopup;
