import React, { useEffect, useState } from 'react';
import '../../styles/pages/admin/Rooms.css'
import { useNavigate } from 'react-router-dom';
import BackBtn from '../../components/buttons/BackBtn';
import { handleGetRooms } from '../../../business/controller/RoomController';
import SelectedRoom from '../../components/rooms/admin/SelectedRoom';
import Select from 'react-select';
import { motion } from 'framer-motion'
import { useNotification } from '../../../context/NotificationContext';
import MessageAlert from '../../components/messages/MessageAlert';


const Rooms = () => {
const [rooms, setRooms] = useState([]);
const [selectedRoom, setSelectedRoom] = useState(null);
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

    const roomOptions = rooms.map(room => ({
        value: room.id,
        label: room.name,
        data: room
    }));

    function handleToNieuwRoom(){
        navigate('/admin/rooms/nieuw-room')
    }


      const handleRoomDeleted = (deletedRoomId) => {
    setRooms(prev => prev.filter(r => r.id !== deletedRoomId));
    setSelectedRoom(null); // deselecteer de kamer zodat SelectedRoom verdwijnt
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
            <h1>Rooms</h1>
        <div className='optionsContainer'>
        <Select
                                options={roomOptions}
                                value={selectedRoom ? roomOptions.find(opt => opt.value === selectedRoom.id) : null}
                                onChange={(selectedOption) => setSelectedRoom(selectedOption.data)}
                                placeholder="Zoek een room..."
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />

                <span>Of</span>
        <button className='primaryBtn' onClick={handleToNieuwRoom}>Nieuwe room maken</button>
        </div>
    <SelectedRoom room={selectedRoom} onRoomDeleted={handleRoomDeleted} />
        <BackBtn/>
        </div>
                    {notification && (
                <MessageAlert
                    message={notification.message}
                    type={notification.type}/>
            )}
        </>
                </motion.div>

    )
}

export default Rooms;