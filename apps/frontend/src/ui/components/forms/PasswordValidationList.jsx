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

  const remaining = rules.filter(r => !r.test(password))

  if (remaining.length === 0) {
    return null
  }

  return (
    <ul className="password-validation-list">
      {remaining.map((rule, index) => (
        <li key={index} className={'invalid'}>
          <span className="rule-icon">•</span>
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default PasswordValidationList
