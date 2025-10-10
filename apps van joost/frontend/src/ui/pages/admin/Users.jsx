import React, { useEffect, useState } from 'react';
import '../../styles/pages/admin/Rooms.css'
import { useNavigate } from 'react-router-dom';
import BackBtn from '../../components/buttons/BackBtn';
import UniversalTable from '../../components/table/UniversalTable';
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';
import SelectedUser from '../../components/users/admin/SelectedUser';
import { handleGetUsers } from '../../../business/controller/userController';


const Users = () => {
        const {notification} = useNotification();
const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const loadUsers = async () => {
        const allUsers = await handleGetUsers();
        console.log(allUsers.data)
        
        setUsers(allUsers.data);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Refresh users when the page regains focus (e.g., when returning from new user creation)
    useEffect(() => {
        const handleFocus = () => {
            loadUsers();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Remove sidebar selection; table-only view

    function handleCreatePatient(){
        navigate('/admin/users/nieuw-account')
    }


  // Removed old sidebar handlers (delete/add); list refreshes via focus listener

    return(
            <main role="main" aria-labelledby="users-heading" className="rooms-main">
                    <div className='main-container'>
                        <BackBtn/>
                        {notification && (
                            <MessageAlert
                                message={notification.message}
                                type={notification.type}/>
                        )}

                        <div className="rooms-header">
                            <h1 id="users-heading" className="rooms-title">Gebruikers</h1>
                        </div>

                        <div className='rooms-layout fullwidth'>
                            <div className='rooms-sidebar'>
                                <div className='room-table-card'>
                                    <div className="table-toolbar">
                                        <span className='ut-text-link ut-text-link--lg' role='button' tabIndex={0} onClick={handleCreatePatient} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') handleCreatePatient(); }}>
                                            + Nieuwe gebruiker
                                        </span>
                                    </div>
                                    
                                        <UniversalTable
                                            columns={[
                                                { key: 'email', header: 'Email', sortable: true, align: 'left' },
                                                { key: 'role', header: 'Rol', sortable: true, align: 'left', compact: true },
                                                { key: 'createdAt', header: 'Aangemaakt', sortable: true, align: 'left', compact: true, render: (u) => new Date(u.createdAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                                { key: 'updatedAt', header: 'Laatst bijgewerkt', sortable: true, align: 'left', compact: true, render: (u) => new Date(u.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                            ]}
                                            data={users}
                                            emptyMessage={'Geen gebruikers gevonden'}
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

export default Users;