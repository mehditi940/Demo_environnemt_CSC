import React, { useState } from 'react';

const PasswordField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error = '',
  touched = false,
  autoComplete = 'current-password',
}) => {
  const [visible, setVisible] = useState(false);
  const inputId = id || `password-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const describedById = error && touched ? `${inputId}-error` : undefined;

  return (
    <div className="uf-field">
      {label && (
        <label className="uf-label" htmlFor={inputId}>
          {label} {required && <span className="uf-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="uf-input-wrap">
        <input
          id={inputId}
          className={`uf-input ${touched && error ? 'uf-input-error' : ''}`}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(touched && error)}
          aria-describedby={describedById}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="uf-input-action"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
          aria-pressed={visible}
        >
          {visible ? 'Verberg' : 'Toon'}
        </button>
      </div>
      {touched && error && (
        <p id={describedById} className="uf-error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default PasswordField;


