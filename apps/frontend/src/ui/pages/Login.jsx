import React from 'react';
import LoginForm from '../components/forms/LoginForm';
import '../styles/pages/Login.css'

const Login = () => {
    return(
        <>
        <main className='login-page' role='main'>
          <div className='login-layout'>
            <section className='login-hero'>
              <div className='login-hero-content'>
                <img className="login-logo" src='logo.png' alt='UMC Utrecht logo' />
                <h1 className='login-h2'>Welkom bij AR-Viewer</h1>
              </div>
            </section>
            <section className='login-right'>
              <LoginForm />
            </section>
          </div>
        </main>
        </>
    )
}

export default Login;
