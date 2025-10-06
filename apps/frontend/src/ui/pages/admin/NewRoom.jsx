import React from 'react';
import '../../styles/pages/admin/NewRoom.css'
import NewRoomForm from '../../components/forms/NewRoomForm';
import BackBtn from '../../components/buttons/BackBtn';

const NewRoom = () => {
    return(
        <>
        <div className='main-container' style={{maxWidth:'1100px'}}> 
        <BackBtn/>
            <h1>Nieuwe kamer maken</h1>
            <NewRoomForm/>
            
        </div>
        </>
    )
}

export default NewRoom;