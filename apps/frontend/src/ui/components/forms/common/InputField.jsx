import React from 'react';

const InputField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error = '',
  touched = false,
  autoComplete,
  children,
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
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
          type={type}
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
        {children}
      </div>
      {touched && error && (
        <p id={describedById} className="uf-error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default InputField;


