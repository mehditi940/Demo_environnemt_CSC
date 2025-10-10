import React from 'react';
import NewPatientForm from '../../components/forms/NewPatientForm';
import BackBtn from '../../components/buttons/BackBtn';

const NewPatient = () => {
    return(

        <>
        <div className='main-container'>
        <BackBtn/>
        <h1 className='rooms-title' style={{textAlign:'center'}}>Nieuwe patiënt</h1>
        <NewPatientForm/>
        

        </div>

        </>


    )
}

export default NewPatient;