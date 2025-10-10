import React, { useState, useContext } from "react"; // useEffect kan blijven, useState is nodig
import { handleCreateRoom } from "../../../business/controller/RoomController";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/components/forms/NewRoomForm.css";
import FormWrapper from "./common/FormWrapper";
import InputField from "./common/InputField";
import PasswordField from "./common/PasswordField";
import SurgeonSelect from "./newRooms/SurgeonSelect";
import PatientSelect from "./newRooms/PatientSelect";
import ModelUpload from "./newRooms/ModelUpload";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../context/NotificationContext";
import { AuthContext } from "../../../context/AuthContext";
import { getRedirectPathForRole } from "../../../constants/routes";
const NewRoomForm = () => {
    const [roomName, setRoomName] = useState("");
    const [models, setModels] = useState([{ id: Date.now(), file: null }]);
    const [selectedSurgeons, setSelectedSurgeons] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [roomType, setRoomType] = useState("patient");
    const [showConfirm, setShowConfirm] = useState(false);  // nieuw: popup zichtbaar
    const { showNotification } = useNotification();
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Get the appropriate redirect path based on user role
    const getRedirectPath = () => {
        return getRedirectPathForRole(currentUser?.role);
    };

    // prepareFormData removed (unused)

    // Bij eerste submit: toon popup, stuur nog niet direct weg
    const handleSubmit = (event) => {
        event.preventDefault();
        setShowConfirm(true);
    };

    // Bij bevestigen: formData maken, verzenden en navigeren
      const confirmSubmit = async () => {
        const files = models.map(m => m.file).filter(Boolean);

        try {
            const response = await handleCreateRoom(roomName, files, selectedPatient, selectedSurgeons);

            if (!response.success) {
                showNotification(response.message || "Aanmaken kamer mislukt", "error");
                return;
            }

            showNotification(`Room: ${roomName} is aangemaakt`, "success");
            navigate(getRedirectPath());
        } catch (error) {
            showNotification("Er is iets misgegaan: " + error.message, "error");
        } finally {
            setShowConfirm(false);
        }
    };



    // Annuleer popup
    const cancelSubmit = () => {
        setShowConfirm(false);
    };

    return (
        <div className="new-room-container">
            <FormWrapper onSubmit={handleSubmit}>
              <InputField
                label="Kamer naam"
                name="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Voer de kamernaam in"
                required
              />

              <div className="uf-grid-2">
                <div className="uf-field">
                  <SurgeonSelect selectedSurgeon={selectedSurgeons} setSelectedSurgeon={setSelectedSurgeons} />
                </div>
                <div className="uf-field">
                  <PatientSelect selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
                </div>
              </div>

              <div className="uf-grid-2">
                <div className="uf-field">
                  <label className="uf-label">Type</label>
                  <select className="uf-input" value={roomType} onChange={(e) => setRoomType(e.target.value)} required>
                    <option value="patient">Patiënt</option>
                    <option value="surgeon">Chirurg</option>
                    <option value="demo">Demo</option>
                  </select>
                </div>
                <div className="uf-field">
                  <ModelUpload models={models} setModels={setModels} />
                </div>
              </div>

              {/* upload status removed (unused) */}

              <div className="uf-actions">
                <button type="submit" className="uf-button uf-button-primary">Toevoegen</button>
              </div>
            </FormWrapper>

            {/* Popup toevoegen */}
            {showConfirm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3 className="modal-title">Weet je zeker dat je deze kamer wilt aanmaken?</h3>
                        <p className="modal-sub">Je kunt dit later altijd weer aanpassen.</p>
                        <div className="modal-actions modal-actions--right">
                            <button onClick={cancelSubmit} className="cancel-button">Annuleren</button>
                            <button onClick={confirmSubmit} className="confirm-button">Bevestigen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewRoomForm;
