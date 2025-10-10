import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import FormWrapper from './common/FormWrapper';
import InputField from './common/InputField';
import PasswordField from './common/PasswordField';
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
        'admin': ROUTES.ADMIN.DASHBOARD,
        'surgeon': ROUTES.SURGEON.DASHBOARD,
        'default': ROUTES.ADMIN.DASHBOARD
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
    } catch {
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
    <FormWrapper
      title="Inloggen"
      onSubmit={handleSubmit}
      footer={errors.general ? <p className="uf-error" role="alert">{errors.general}</p> : null}
    >
      <InputField
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        placeholder="Voer je e-mailadres in"
        required
        error={errors.email}
        touched={touched.email}
        autoComplete="username"
      />
      <PasswordField
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={() => handleBlur('password')}
        placeholder="Voer je wachtwoord in"
        required
        error={errors.password}
        touched={touched.password}
      />
      <div className="uf-actions">
        <button
          type="submit"
          className="uf-button uf-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Inloggen...' : 'Inloggen'}
        </button>
      </div>
    </FormWrapper>
  );
};

export default LoginForm;