import React, { useEffect, useState } from "react";
import { getAllPatients } from "../../../../business/authManager";
import Select from 'react-select';

const PatientSelect = ({ selectedPatient, setSelectedPatient }) => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const results = await getAllPatients();
                console.log(results.data)
                setPatients(results.data);
            } catch (error) {
                console.error("Fout bij het ophalen van patiënten:", error);
            }
        };
        fetchPatients();
    }, []);
    useEffect(() => {

    })

    const patientOptions = patients.map(patient => ({
        value: patient.id,
        label: patient.nummer,
        data: patient
    }));

    return (
        <div className="form-group">
            <label>Kies een patiënt</label>


            <Select
                                options={patientOptions}
                                value={selectedPatient ? patientOptions.find(opt => opt.value === selectedPatient.id) : null}
                                onChange={(selectedOption) => setSelectedPatient(selectedOption.data.id)}
                                placeholder="Zoek een patient..."
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />

        </div>
    );
};

export default PatientSelect;
