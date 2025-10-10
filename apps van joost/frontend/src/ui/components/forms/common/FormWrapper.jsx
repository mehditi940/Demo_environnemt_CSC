import React from 'react';
import '../../../styles/components/forms/UniversalForm.css';

const FormWrapper = ({ title, description, onSubmit, children, footer }) => {
  return (
    <div className="uf-container" role="region" aria-label={title || 'Formulier'}>
      {(title || description) && (
        <header className="uf-header">
          {title && <h1 className="uf-title">{title}</h1>}
          {description && <p className="uf-description">{description}</p>}
        </header>
      )}
      <form className="uf-form" onSubmit={onSubmit} noValidate>
        {children}
      </form>
      {footer && <div className="uf-footer">{footer}</div>}
    </div>
  );
};

export default FormWrapper;


