import React, { useState } from 'react';
import '../../../styles/components/rooms/RoomUpdatePopup.css';
import { useNotification } from '../../../../context/NotificationContext'
import PatientSelect from '../../forms/newRooms/PatientSelect';
import { handleUpdateUser } from '../../../../business/controller/userController';

const UserUpdatePopup = ({ user, onClose }) => {

    const [email, setEmail] = useState(user.email);
    const [fName, setFName] = useState(user.firstName);
    const [lName, setLName] = useState(user.lastName)
    const { showNotification } = useNotification()
const [errorMessage, setErrorMessage] = useState("");

    
 
  
    const handleSave = async () => {
  if (!email.trim()) {
    setErrorMessage("nummer mag niet leeg zijn.");
    return;
  }

  setErrorMessage("");




  const updateData = {
    firstName: fName,
    lastName: lName,
    email: email,
    updatedAt: new Date().toISOString(),
  };
  const result = await handleUpdateUser(user.id, updateData);

  if (result.success) {
    showNotification("Gebruikersgegevens zijn aangepast!");
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
          <h2>Gebruikersgegevens aanpassen</h2>
  
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

                   <label>Email:</label>
    <input 
            type="text" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

  
export default UserUpdatePopup;
