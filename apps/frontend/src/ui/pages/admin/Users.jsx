import React, { useEffect, useState } from 'react';
import '../../styles/pages/admin/Rooms.css'
import { useNavigate } from 'react-router-dom';
import BackBtn from '../../components/buttons/BackBtn';
import Select from 'react-select';
import { motion } from 'framer-motion'
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';
import { handleGetPatients } from '../../../business/controller/PatientController';
import SelectedUser from '../../components/users/admin/SelectedUser';
import { handleGetUsers } from '../../../business/controller/userController';
import { all } from 'three/src/nodes/TSL.js';


const Users = () => {
        const {notification} = useNotification();
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getAllPatients = async () => {
            const allUsers = await handleGetUsers();
            console.log(allUsers.data)
            
            setUsers(allUsers.data);
        }
        getAllPatients();

    }
    
    , []);

    const roomOptions = users.map(user => ({
        value: user.id,
        label: user.email,
        data: user
    }));

    function handleCreatePatient(){
        navigate('/admin/users/nieuw-account')
    }


      const handleUserDeleted = (deletedUserId) => {
    setUsers(prev => prev.filter(r => r.id !== deletedUserId));
    setSelectedUser(null); // deselecteer de kamer zodat SelectedRoom verdwijnt
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
            <h1>Gebruikers</h1>
        <div className='optionsContainer'>
        <Select
                                options={roomOptions}
                                value={selectedUser ? roomOptions.find(opt => opt.value === selectedUser.id) : null}
                                onChange={(selectedOption) => setSelectedUser(selectedOption.data)}
                                placeholder="Zoek een gebruiker..."
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />

                <span>Of</span>
        <button className='primaryBtn' onClick={handleCreatePatient}>Nieuwe account aanmaken</button>
        </div>
    <SelectedUser user={selectedUser} onPatientDelete={handleUserDeleted} />
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

export default Users;