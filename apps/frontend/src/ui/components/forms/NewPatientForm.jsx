import React, { useState } from 'react'
import '../../styles/components/forms/NewPatientForm.css'
import FormWrapper from './common/FormWrapper'
import InputField from './common/InputField'
import { getAllPatients, handleNewPatient } from '../../../business/authManager'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../../context/NotificationContext'

const NewPatientForm = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nummer, setNummer] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const validateForm = async () => {
    const newErrors = {}

    // Nummer validation
    if (!nummer.trim()) {
      newErrors.nummer = 'Patientnummer is verplicht.'
    } else if (!/^\d+$/.test(nummer)) {
      newErrors.nummer = 'Patientnummer moet een getal zijn.'
    } else {
      const result = await getAllPatients()
      if (result.success && Array.isArray(result.data)) {
        const patientNumberExists = result.data.some(patient => patient.nummer === nummer)
        if (patientNumberExists) {
          newErrors.nummer = "Dit patientnummer is al in gebruik."
        }
      } else {
        setServerError(result.message || "Fout bij het ophalen van patiënten.")
        return false
      }
    }

    // Name validations
    if (!firstName.trim()) newErrors.firstName = 'Voornaam is verplicht.'
    if (!lastName.trim()) newErrors.lastName = 'Achternaam is verplicht.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    const isValid = await validateForm()
    if (!isValid) return

    setShowConfirm(true)
  }

  const confirmSubmit = async () => {
    const newPatient = { nummer, firstName, lastName }

    try {
      const result = await handleNewPatient(newPatient)
      if (result.success) {
        showNotification('Nieuwe patiënt is toegevoegd')
        navigate('/admin/patients')
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      showNotification(err.message || 'Er is iets misgegaan', 'error')
      setServerError(err.message || 'Er is iets misgegaan.')
    }
  }

  return (
    <div className="new-patient-container">
      <FormWrapper onSubmit={handleSubmit}>
        <InputField
          label="Patiëntnummer"
          type="number"
          value={nummer}
          onChange={(e) => setNummer(e.target.value)}
          placeholder="Voer het patiëntnummer in"
          required
          error={errors.nummer}
          touched={Boolean(errors.nummer)}
        />
        <InputField
          label="Voornaam"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Voer de voornaam in"
          required
          error={errors.firstName}
          touched={Boolean(errors.firstName)}
        />
        <InputField
          label="Achternaam"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Voer de achternaam in"
          required
          error={errors.lastName}
          touched={Boolean(errors.lastName)}
        />
        {serverError && <p className="form-error">{serverError}</p>}
        <div className="uf-actions">
          <button type="submit" className="uf-button uf-button-primary">Aanmaken</button>
        </div>
      </FormWrapper>

      {showConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3 className="modal-title">Bevestig patiëntgegevens</h3>
            <p className="modal-sub">Controleer onderstaande gegevens.</p>
            <p><strong>Patiëntnummer:</strong> {nummer}</p>
            <p><strong>Voornaam:</strong> {firstName}</p>
            <p><strong>Achternaam:</strong> {lastName}</p>

            <div className="modal-actions modal-actions--right">
              <button className="cancel-button" onClick={() => setShowConfirm(false)}>
                Annuleren
              </button>
              <button className="confirm-button" onClick={confirmSubmit}>
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewPatientForm
