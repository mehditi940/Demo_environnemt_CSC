import React, { useEffect, useState } from "react";
import { getAllPatients } from "../../../../business/authManager";

const PatientSelect = ({ selectedPatient, setSelectedPatient }) => {
    const [patients, setPatients] = useState([]);
    const [query, setQuery] = useState("");

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

    const filtered = patients.filter((p) => {
        const text = `${p.firstName ?? ''} ${p.lastName ?? ''} ${p.nummer ?? ''}`.toLowerCase();
        return text.includes(query.toLowerCase());
    });

    return (
        <div className="patient-select uf-field">
            <label className="uf-label">Patiënt</label>
            <div className="uf-input-search-wrap">
                <svg className="uf-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                    type="search"
                    placeholder="Zoek een patiënt..."
                    className="uf-input uf-input-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Zoek een patiënt"
                />
            </div>
            {filtered.length === 0 ? (
                <div className="uf-input uf-empty-center">Geen patiënten gevonden</div>
            ) : (
                <select
                    className="uf-input"
                    style={{ minHeight: '200px' }}
                    size={8}
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                >
                    {filtered.map((p) => (
                        <option key={p.id} value={p.id}>
                            {(p.firstName || '') + ' ' + (p.lastName || '')} • {p.nummer}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default PatientSelect;
