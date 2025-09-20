import React, { useEffect, useState } from 'react';
import '../../styles/pages/admin/Rooms.css'
import { useNavigate } from 'react-router-dom';
import BackBtn from '../../components/buttons/BackBtn';
import Select from 'react-select';
import { motion } from 'framer-motion'
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';
import { handleGetPatients } from '../../../business/controller/PatientController';
import SelectedPatient from '../../components/patients/admin/SelectedPatient';


const Patients = () => {
        const {notification} = useNotification();
const [patients, setPatients] = useState([]);
const [selectedPatient, setSelectedPatient] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getAllPatients = async () => {
            const allPatients = await handleGetPatients();
            
            setPatients(allPatients.data);
        }
        getAllPatients();

    }
    
    , []);

    const roomOptions = patients.map(patient => ({
        value: patient.id,
        label: patient.nummer,
        data: patient
    }));

    function handleCreatePatient(){
        navigate('/admin/patients/nieuw-patient')
    }


      const handlePatientDeleted = (deletedPatientId) => {
    setPatients(prev => prev.filter(r => r.id !== deletedPatientId));
    setSelectedPatient(null); // deselecteer de kamer zodat SelectedRoom verdwijnt
  }

    return(
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <>
        <div className='main-container'>
            <h1>Patiënten</h1>
        <div className='optionsContainer'>
        <Select
                                options={roomOptions}
                                value={selectedPatient ? roomOptions.find(opt => opt.value === selectedPatient.id) : null}
                                onChange={(selectedOption) => setSelectedPatient(selectedOption.data)}
                                placeholder="Zoek een patient..."
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />

                <span>Of</span>
        <button className='primaryBtn' onClick={handleCreatePatient}>Nieuwe patient toevoegen</button>
        </div>
    <SelectedPatient patient={selectedPatient} onPatientDelete={handlePatientDeleted} />
        <BackBtn/>
        </div>
                    {notification && (
                <MessageAlert
                    message={notification.message}
                    type={notification.type}/>
            )}
        </>
        {notification && (      <MessageAlert
                    message={notification.message}
                    type={notification.type}/>)}
            
                </motion.div>

    )
}

export default Patients;