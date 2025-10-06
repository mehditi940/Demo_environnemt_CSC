import React, { useState } from 'react'
import '../../styles/components/forms/NewAccountForm.css'
import FormWrapper from './common/FormWrapper'
import InputField from './common/InputField'
import { getAllUsers, handleUserRegistration } from '../../../business/authManager'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../../context/NotificationContext'
import PasswordValidationList from './PasswordValidationList'

const NewAccountForm = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const { showNotification } = useNotification()
  const navigate = useNavigate()


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
  e.preventDefault()

  const resulte = await getAllUsers();
  const emailExists = resulte.data?.length > 0 
  ? resulte.data.some(user => user.email.toLowerCase() === email.toLowerCase())
  : false;

  setError(null)
  if(emailExists){
    setError("Je kan geen bestaande emailadres gebruiken voor het aanmaken van een nieuwe account")
    return
  }
  if (password !== confirmPassword) {
    setError('Wachtwoorden komen niet overeen')
    return
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    setError(passwordError)
    return
  }

  setShowConfirm(true)
}

  const confirmSubmit = async () => {
    const newUser = {
      email,
      firstName,
      lastName,
      password,
      role: 'user',
    }

    console.log('Nieuwe gebruiker:', newUser);
    

    try {
      await handleUserRegistration(newUser)
      showNotification('Nieuwe account is aangemaakt')
      navigate('/admin/users')
    } catch (err) {
      showNotification(err.message || 'Er is iets misgegaan', 'error')
      setError(err.message || 'Er ging iets mis')
    }
  }

  return (
    <div className="new-account-container">
      <div className="register-layout">
        <div className="register-right" style={{gridColumn:'1 / -1'}}>
          <FormWrapper onSubmit={handleSubmit}>
          <div className="uf-grid-2">
            <InputField label="Voornaam" value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="Voer de voornaam in" required />
            <InputField label="Achternaam" value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Voer de achternaam in" required />
          </div>
        <InputField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Voer het emailadres in" required />
        <InputField label="Wachtwoord" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Voer het wachtwoord in" required />
          <PasswordValidationList password={password}/>
        <InputField label="Herhaal wachtwoord" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Herhaal het wachtwoord" required />
        {error && <p className="form-error">{error}</p>}
        <div className="uf-actions">
          <button type="submit" className="uf-button uf-button-primary">Gebruiker aanmaken</button>
        </div>
          </FormWrapper>
        </div>
      </div>

      {/* Custom confirm pop-up */}
      {showConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3 className="modal-title">Bevestig accountgegevens</h3>
            <p className="modal-sub">Controleer onderstaande gegevens voordat je het account aanmaakt.</p>
            <p><strong>Voornaam:</strong> {firstName}</p>
            <p><strong>Achternaam:</strong> {lastName}</p>
            <p><strong>Email:</strong> {email}</p>

            <div className="modal-actions modal-actions--right">
              <button className="cancel-button" onClick={() => setShowConfirm(false)}>Annuleren</button>
              <button className="confirm-button" onClick={confirmSubmit}>Bevestigen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewAccountForm
