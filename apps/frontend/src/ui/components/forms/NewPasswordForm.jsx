import React, {useState } from 'react'
import '../../styles/components/forms/NewPasswordForm.css'
import FormWrapper from './common/FormWrapper'
import InputField from './common/InputField'

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
      <div className="new-password-container">
        <FormWrapper onSubmit={handleSubmit}>
          <InputField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Voer je emailadres in" required />
          <InputField label="Nieuw wachtwoord" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Voer je wachtwoord in" required />
          <PasswordValidationList password={password} />
          <InputField label="Herhaal wachtwoord" type="password" value={confirmPassword || ''} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Herhaal het wachtwoord" required />
          {error && <p className="form-error">{error}</p>}
          <div className="uf-actions">
            <button type="submit" className="uf-button uf-button-primary">Wachtwoord veranderen</button>
          </div>
        </FormWrapper>
      </div>
    )
}

export default NewPasswordForm;