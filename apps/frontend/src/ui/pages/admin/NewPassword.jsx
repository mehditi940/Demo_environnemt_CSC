import React from 'react';
import NewPasswordForm from '../../components/forms/NewPasswordForm';
import BackBtn from '../../components/buttons/BackBtn';

const NewPassword = () => {
    return( 
        <>
        <div className='main-container'>
        <BackBtn/>
        <h1 className='rooms-title' style={{textAlign:'center'}}>Nieuw wachtwoord</h1>
        <NewPasswordForm/>
        
        </div>
        </>
    )
}

export default NewPassword;