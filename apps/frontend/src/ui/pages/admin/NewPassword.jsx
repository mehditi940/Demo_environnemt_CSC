import React from 'react';
import NewPasswordForm from '../../components/forms/NewPasswordForm';
import BackBtn from '../../components/buttons/BackBtn';
import { motion } from 'framer-motion'

const NewPassword = () => {
    return(
                    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <>
        <div className='main-container'>
        <h2 className='login-h2'>Nieuwe wachtwoord instellen</h2>
        <NewPasswordForm/>
        <BackBtn/>
        </div>
        </>
        </motion.div>
    )
}

export default NewPassword;