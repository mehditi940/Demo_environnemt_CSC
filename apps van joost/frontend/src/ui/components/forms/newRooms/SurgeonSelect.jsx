import React, {useEffect, useState, useContext}from "react";
import { handleGetUsers } from "../../../../business/controller/userController";
import { AuthContext } from "../../../../context/AuthContext";

const SurgeonSelect = ({ selectedSurgeon, setSelectedSurgeon }) => {
    const [surgeons, setSurgeons] = useState([]);
    const [query, setQuery] = useState("");
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const results = await handleGetUsers();
                
                if (results.success && results.data && Array.isArray(results.data)) {
                    const surgeons = results.data.filter((user) => user.role === 'surgeon');
                    setSurgeons(surgeons);
                } else {
                    console.error("Invalid response format:", results);
                    setSurgeons([]);
                }
            } catch (error) {
                console.error("Fout bij het ophalen van gebruikers:", error);
                setSurgeons([]);
            }
        };
        getUsers();
    }, [currentUser]);
    const filtered = surgeons.filter((s) => {
        const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.toLowerCase();
        return full.includes(query.toLowerCase());
    });

    return (
        <div className="surgeon-select uf-field">
            <label className="uf-label">Chirurg</label>
            <div className="uf-input-search-wrap">
                <svg className="uf-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                    type="search"
                    placeholder="Zoek een chirurg..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="uf-input uf-input-search"
                    aria-label="Zoek een chirurg"
                />
            </div>
            {filtered.length === 0 ? (
                <div className="uf-input uf-empty-center">Geen chirurgen gevonden</div>
            ) : (
                <select
                    multiple
                    value={selectedSurgeon}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                        setSelectedSurgeon(selected);
                    }}
                    required
                    className="uf-input"
                    style={{ minHeight: '200px' }}
                >
                    {filtered.map((surgeon) => (
                        <option key={surgeon.id} value={surgeon.id}>
                            {surgeon.firstName} {surgeon.lastName}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
    
};

export default SurgeonSelect;