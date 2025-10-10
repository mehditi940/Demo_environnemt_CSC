import React, { useEffect, useState } from 'react';
import '../../styles/pages/admin/Rooms.css'
import { useNavigate } from 'react-router-dom';
import BackBtn from '../../components/buttons/BackBtn';
import { handleGetRooms } from '../../../business/controller/RoomController';
import RoomUpdatePopup from '../../components/rooms/admin/RoomUpdatePopup';
import UniversalTable from '../../components/table/UniversalTable';
import { handleDeleteRoom } from '../../../business/controller/RoomController';
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';


const Rooms = () => {
const [rooms, setRooms] = useState([]);
// const [selectedRoom, setSelectedRoom] = useState(null); // unused for now
const [editRoom, setEditRoom] = useState(null);
const [showEditPopup, setShowEditPopup] = useState(false);
const [roomToDelete, setRoomToDelete] = useState(null);
    const navigate = useNavigate();
        const {notification} = useNotification();

    useEffect(() => {
        const getAllRooms = async () => {
            const allRooms = await handleGetRooms();
            
            setRooms(allRooms.data);
        }
        getAllRooms();

    }
    
    , []);

    // removed unused roomOptions mapping to satisfy linter

    function handleToNieuwRoom(){
        navigate('/admin/rooms/nieuw-room')
    }


  // const handleRoomDeleted = (deletedRoomId) => {
  //   setRooms(prev => prev.filter(r => r.id !== deletedRoomId));
  //   setSelectedRoom(null);
  // }

    return(
            
            <main role="main" aria-labelledby="rooms-heading" className="rooms-main">
                
                <div className='main-container'>
                <BackBtn/>
                    {notification && (
                        <MessageAlert
                            message={notification.message}
                            type={notification.type}/>
                    )}
                    
                    <div className="rooms-header">
                        <h1 id="rooms-heading" className="rooms-title">Kamers</h1>
                    </div>
                    <div className='room-table-card'>
                        <div className='rooms-sidebar'>
                        <div className='rooms-top-actions'>
                            <span className='ut-text-link ut-text-link--lg' role='button' tabIndex={0} onClick={handleToNieuwRoom} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') handleToNieuwRoom(); }}>
                                + Nieuwe kamer
                            </span>
                        </div>
                        
                            <UniversalTable
                                columns={[
                                    { key: 'name', header: 'Kamer naam', sortable: true, align: 'left', render: (r) => (
                                        <button type='button' className='ut-cell-link' onClick={(e)=>{ e.preventDefault(); setEditRoom(r); setShowEditPopup(true); }}>{r.name}</button>
                                    )},
                                    { key: 'createdAt', header: 'Aangemaakt', sortable: true, align: 'left', compact: true, render: (r) => new Date(r.createdAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                    { key: 'modelsCount', header: 'Modellen', sortable: true, align: 'center', compact: true, render: (r) => r?.models?.length || 0 },
                                    { key: 'updatedAt', header: 'Laatst bijgewerkt', sortable: true, align: 'left', compact: true, render: (r) => new Date(r.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                ]}
                                data={rooms}
                                emptyMessage={'Geen kamers gevonden'}
                                initialSort={{ key: 'updatedAt', direction: 'desc' }}
                                defaultPageSize={10}
                            />
                        </div>
                    </div>        
                        
                    
                </div>
                {showEditPopup && editRoom && (
                    <RoomUpdatePopup room={editRoom} onClose={() => setShowEditPopup(false)} />
                )}
                {roomToDelete && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <p>Weet je zeker dat je <strong>{roomToDelete.name}</strong> wil verwijdern?</p>
                            <div className="modal-actions">
                                <button className="confirm-button-delete" onClick={async () => {
                                    try {
                                        await handleDeleteRoom(roomToDelete.id);
                                        setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
                                        setRoomToDelete(null);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}>Verwijderen</button>
                                <button className="cancel-button" onClick={() => setRoomToDelete(null)}>Annuleren</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
    )
}

export default Rooms;