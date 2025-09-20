import React from 'react';
import NewPatientForm from '../../components/forms/NewPatientForm';
import BackBtn from '../../components/buttons/BackBtn';
import { motion } from 'framer-motion'

const NewPatient = () => {
    return(
                    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <>
        <div className='main-container'>
        <h2 className='login-h2'>Nieuwe patiënt toevoegen</h2>
        <NewPatientForm/>
        <BackBtn/>

        </div>

        </>
                </motion.div>

    )
}

export default NewPatient;