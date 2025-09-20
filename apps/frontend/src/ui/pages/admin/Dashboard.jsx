import React from 'react';
import '../../styles/pages/admin/Dashboard.css'
import { useNavigate } from 'react-router-dom';
import LogoutBtn from '../../components/buttons/LogoutBtn';
import BackBtn from '../../components/buttons/BackBtn';
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';
import { motion } from 'framer-motion';
const Dashboard = () => {

    const {notification} = useNotification();
    const navigate = useNavigate();

    function handleToRooms(){
        navigate('/admin/rooms')
    }

    function handleToNieuwPatient(){
        navigate('/admin/patients')
    }

    function handleToNieuwAccount(){
        navigate('/admin/users')
    }

    function handleToWachtwoordVeranderen(){
        navigate('/admin/nieuw-wachtwoord')
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
            <BackBtn/>
            {notification && (
                <MessageAlert
                    message={notification.message}
                    type={notification.type}/>
            )}
        <img className="dashboard-logo" src='/logo.png' alt='UMC Utrecht logo'></img>
        <div className='btnsContainer'>
            <button className='accentBtn' onClick={handleToRooms}>Rooms</button>
            <button className='primaryBtn' onClick={handleToNieuwPatient}>Patienten</button>
            <button className='primaryBtn' onClick={handleToNieuwAccount}>Gebruikers</button>
            <button className='primaryBtn' onClick={handleToWachtwoordVeranderen}>Wachtwoord veranderen</button>
        </div>
        </div>
        <LogoutBtn/>
        </>
        </motion.div>
    )
}

export default Dashboard;