import React from 'react';
import NewAccountForm from '../../components/forms/NewAccountForm';
import BackBtn from '../../components/buttons/BackBtn';

const NewAccount = () => {
    return(
        <>
        
        <div className='main-container'>
        <BackBtn/>
        <h1 className='rooms-title' style={{textAlign:'center'}}>Nieuwe gebruiker</h1>
        <NewAccountForm/>
        

        </div>
        </>
       
    )
}

export default NewAccount;