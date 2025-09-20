import React, {useEffect, useState}from "react";
import { getAllUsers } from "../../../../business/authManager";
import { handleGetUsers } from "../../../../business/controller/userController";

const SurgeonSelect = ({ selectedSurgeon, setSelectedSurgeon }) => {
    const [surgeons, setSurgeons] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const results = await handleGetUsers();
                const admins = results.data.filter((user) => user.role === 'admin');
                setSurgeons(admins);
            } catch (error) {
                console.error("Fout bij het ophalen van gebruikers:", error);
            }
        };
        getUsers();
    }, []);
    return (
        <div className="form-group">
            <label>Kies een chirurg</label>
            <select
                multiple
                value={selectedSurgeon}
                onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                    setSelectedSurgeon(selected);
                }}
                required
            >
                <option disabled value="">-- Selecteer een chirurg --</option>
                {surgeons.map((surgeon) => (
                    <option key={surgeon.id} value={surgeon.id}>
                        {surgeon.email}
                    </option>
                ))}
            </select>
        </div>
    );
    
};

export default SurgeonSelect;