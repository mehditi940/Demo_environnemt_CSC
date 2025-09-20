import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/forms/LoginForm.css';
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useContext(AuthContext);

  // Redirect based on user role
  useEffect(() => {
    if (currentUser) {
      const rolePaths = {
        'super-admin': '/admin/dashboard',
        'admin': '/chirurg/dashboard',
        'default': '/default/dashboard'
      };
      navigate(rolePaths[currentUser.role] || rolePaths.default);
    }
  }, [currentUser, navigate]);

  const validate = () => {
    const newErrors = {
      email: !formData.email ? 'E-mailadres is verplicht' : 
             !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Voer een geldig e-mailadres in' : '',
      password: !formData.password ? 'Wachtwoord is verplicht' : '',
      general: ''
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(x => !x);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Revalidate if field was already touched
    if (touched[name]) {
      validate();
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ email: '', password: '', general: '' });
    
    // Client-side validation
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        // Handle specific error cases from backend
        let fieldErrors = { email: '', password: '' };
        if (result.message?.toLowerCase().includes('email')) {
          fieldErrors.email = 'Geen account gevonden met dit e-mailadres';
        } else if (result.message?.toLowerCase().includes('wachtwoord') || 
                  result.message?.toLowerCase().includes('password')) {
          fieldErrors.password = 'Ongeldig wachtwoord';
        }

        setErrors({
          ...fieldErrors,
          general: fieldErrors.email || fieldErrors.password ? 
                 '' : 'Het e-mailadres of wachtwoord is onjuist..'
        });
      }
    } catch (error) {
      setErrors({
        email: '',
        password: '',
        general: 'Er is een fout opgetreden. Probeer het later opnieuw.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>E-mailadres</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            required
            placeholder="Voer je e-mailadres in"
            className={touched.email && errors.email ? 'input-error' : ''}
            autoComplete="username"
          />
          {touched.email && errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Wachtwoord</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            required
            placeholder="Voer je wachtwoord in"
            className={touched.password && errors.password ? 'input-error' : ''}
            autoComplete="current-password"
          />
          {touched.password && errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {errors.general && (
          <div className="error-message general-error">
            <p>{errors.general}</p>
          </div>
        )}

        <button 
          type="submit" 
          className="login-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Inloggen...
            </>
          ) : 'Inloggen'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;