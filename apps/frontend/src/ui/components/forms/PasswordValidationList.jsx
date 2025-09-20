import React from 'react'
import '../../styles/components/forms/PasswordValidationList.css'

const PasswordValidationList = ({ password }) => {
 const rules = [
    {
      label: 'Minimaal 8 tekens',
      test: (pw) => pw.length >= 8
    },
    {
      label: 'Minstens één hoofdletter',
      test: (pw) => /[A-Z]/.test(pw)
    },
    {
      label: 'Minstens één kleine letter',
      test: (pw) => /[a-z]/.test(pw)
    },
    {
      label: 'Minstens één cijfer',
      test: (pw) => /\d/.test(pw)
    },
    {
      label: 'Minstens één speciaal teken (!@#$%)',
      test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    }
  ]

  return (
    <ul className="password-validation-list">
    {rules.map((rule, index) => (
        <li key={index}
        className={rule.test(password) ? 'valid' : 'invalid'}
        >
            {rule.label}
            </li>
    ))}
    </ul>
  )
}

export default PasswordValidationList
