import React, { useEffect, useState } from 'react';
import '../../styles/pages/admin/Rooms.css'
import { useNavigate } from 'react-router-dom';
import BackBtn from '../../components/buttons/BackBtn';
import UniversalTable from '../../components/table/UniversalTable';
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';
import { handleGetPatients } from '../../../business/controller/PatientController';
import SelectedPatient from '../../components/patients/admin/SelectedPatient';


const Patients = () => {
        const {notification} = useNotification();
const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getAllPatients = async () => {
            const allPatients = await handleGetPatients();
            
            setPatients(allPatients.data);
        }
        getAllPatients();

    }
    
    , []);

    // Sidebar select removed; only table view remains

    function handleCreatePatient(){
        navigate('/admin/patients/nieuw-patient')
    }


  // Inline delete can be handled later in table actions if needed

    return(
            <main role="main" aria-labelledby="patients-heading" className="rooms-main">
                    <div className='main-container'>
                        <BackBtn/>
                        {notification && (
                            <MessageAlert
                                message={notification.message}
                                type={notification.type}/>
                        )}

                        <div className="rooms-header">
                            <h1 id="patients-heading" className="rooms-title">Patiënten</h1>
                        </div>

                        <div className='rooms-layout fullwidth'>
                            <div className='rooms-sidebar'>
                                <div className='room-table-card'>
                                    <div className="table-toolbar">
                                        <span className='ut-text-link ut-text-link--lg' role='button' tabIndex={0} onClick={handleCreatePatient} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') handleCreatePatient(); }}>
                                            + Nieuwe patiënt
                                        </span>
                                    </div>
                                    <UniversalTable
                                        columns={[
                                            { key: 'nummer', header: 'Patiënt nr', sortable: true, align: 'left' },
                                            { key: 'firstname', header: 'Voornaam', sortable: true, align: 'left', compact: true },
                                            { key: 'lastname', header: 'Achternaam', sortable: true, align: 'left', compact: true },
                                            { key: 'createdAt', header: 'Aangemaakt', sortable: true, align: 'left', compact: true, render: (p) => new Date(p.createdAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                            { key: 'updatedAt', header: 'Laatst bijgewerkt', sortable: true, align: 'left', compact: true, render: (p) => new Date(p.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                        ]}
                                        data={patients}
                                        emptyMessage={'Geen patiënten gevonden'}
                                        initialSort={{ key: 'updatedAt', direction: 'desc' }}
                                        defaultPageSize={10}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
            </main>
    )
}

export default Patients;