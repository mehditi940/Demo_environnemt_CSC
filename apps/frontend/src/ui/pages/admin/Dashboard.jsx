import React from 'react';
import '../../styles/pages/admin/Dashboard.css'
import { useNavigate } from 'react-router-dom';
import LogoutBtn from '../../components/buttons/LogoutBtn';
import BackBtn from '../../components/buttons/BackBtn';
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';
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

    // Wachtwoord veranderen verplaatst naar profielpagina



    return(   
            <main role="main" aria-labelledby="dashboard-heading" className="dashboard-main">
                <div className='main-container'>
                    {notification && (
                        <MessageAlert
                            message={notification.message}
                            type={notification.type}/>
                    )}
                    <h1 id="dashboard-heading" className="dashboard-title">Admin Paneel</h1>
                    <div className='btnsContainer'>
                        <button className='primaryBtn' onClick={handleToRooms}>Kamers</button>
                        <button className='primaryBtn' onClick={handleToNieuwPatient}>Patiënten</button>
                        <button className='primaryBtn' onClick={handleToNieuwAccount}>Gebruikers</button>
                        {/* Verplaatst naar profielpagina */}
                    </div>
                </div>
            </main>
    )
}

export default Dashboard;