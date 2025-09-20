import React from 'react';
import NewAccountForm from '../../components/forms/NewAccountForm';
import BackBtn from '../../components/buttons/BackBtn';
import { motion } from 'framer-motion'

const NewAccount = () => {
    return(
                    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <>
        <div className='main-container'>
        <h2 className='login-h2'>Nieuwe account aanmaken</h2>
        <NewAccountForm/>
        <BackBtn/>

        </div>
        </>
        </motion.div>
    )
}

export default NewAccount;