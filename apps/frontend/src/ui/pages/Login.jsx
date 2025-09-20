import React from 'react';
import LoginForm from '../components/forms/LoginForm';
import '../styles/pages/Login.css'
import { motion } from 'framer-motion'

const Login = () => {
    return(
                    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <>
        <div className='main-container'>
        <img className="login-logo" src='logo.png' alt='UMC Utrecht logo'></img>
        <h2 className='login-h2'>Inloggen</h2>
        <LoginForm/>
        </div>
        </>
        </motion.div>
    )
}

export default Login;