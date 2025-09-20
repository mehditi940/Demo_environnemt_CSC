import React, {useState } from 'react'
import '../../styles/components/forms/NewPasswordForm.css'

import { useNavigate } from 'react-router-dom';
import { handleNewPassword } from '../../../business/controller/userController';
import PasswordValidationList from './PasswordValidationList';
const NewPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState();
    const [error, setError] = useState();
    const navigate = useNavigate();
    const newPassword = {
        email,
        password
      };

        const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    return 'Wachtwoord moet minimaal 8 tekens bevatten'
  }
  if (!hasUpperCase) {
    return 'Wachtwoord moet minstens één hoofdletter bevatten'
  }
  if (!hasLowerCase) {
    return 'Wachtwoord moet minstens één kleine letter bevatten'
  }
  if (!hasNumber) {
    return 'Wachtwoord moet minstens één cijfer bevatten'
  }
  if (!hasSpecialChar) {
    return 'Wachtwoord moet minstens één speciaal teken bevatten (bijv. !@#$%)'
  }

  return null
}

         const handleSubmit = async (e) => {
            e.preventDefault();
            setError(null)
            if (password !== confirmPassword) {
                setError('Wachtwoorden komen niet overeen');
                return;
              }
      
            try {
                const passwordError = validatePassword(password)
              if (passwordError) {
            setError(passwordError)
            return
              }
              await handleNewPassword(newPassword);
              navigate('/admin/dashboard')
            }catch(err) {
              setError(err.message)
            }
          };


    return(
<>
<div className="new-password-container">
        <form  className="new-account-form">


          <div className="form-group">
            <label>Email</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Voer de patientnaam" />
          </div>

   
          <div className="form-group">
            <label>Wachtwoord</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Voer je wachtwoord in" />
          </div>
          <PasswordValidationList password={password} />
          <div className="form-group">
            <label>Wachtwoord</label>

            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Herhaal het wachtwoord" />
          </div>
                  {error && <p className="form-error">{error}</p>}

          <button type="submit" onClick={handleSubmit} className="new-password-button">Wachtwoord veranderen</button>

        </form>
      </div>
      </>
    )
}

export default NewPasswordForm;