import React from 'react';
import '../../styles/pages/admin/NewRoom.css'
import NewRoomForm from '../../components/forms/NewRoomForm';
import BackBtn from '../../components/buttons/BackBtn';
import { motion } from 'framer-motion'

const NewRoom = () => {
    return(
                    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <>
        <div className='main-container'>
            <h1>Nieuwe room maken</h1>
            <NewRoomForm/>
            <BackBtn/>
        </div>
        </>
        </motion.div>
    )
}

export default NewRoom;