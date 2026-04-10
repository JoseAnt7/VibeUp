import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar_Home } from '../components/Navbar';
import '../assets/css/AccountSettings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave, faSpinner, faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';

export const AccountSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('access_token');

        if (!storedUser || !storedToken) {
            navigate('/session');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setFormData(prev => ({
            ...prev,
            username: userData.username || '',
            email: userData.email || ''
        }));
        setLoading(false);
    }, [navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (formData.username.trim().length < 3) {
            newErrors.username = 'El username debe tener al menos 3 caracteres';
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Por favor ingresa un email válido';
        }

        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Debes ingresar tu contraseña actual para cambiarla';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        validateField(name, formData[name]);
    };

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'username':
                if (value.trim().length < 3) {
                    newErrors.username = 'El username debe tener al menos 3 caracteres';
                } else {
                    delete newErrors.username;
                }
                break;
            case 'email':
                if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    newErrors.email = 'Por favor ingresa un email válido';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'newPassword':
                if (value && value.length < 6) {
                    newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
                } else {
                    delete newErrors.newPassword;
                }
                break;
            case 'confirmPassword':
                if (value && value !== formData.newPassword) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'currentPassword':
                if (formData.newPassword && !value) {
                    newErrors.currentPassword = 'Debes ingresar tu contraseña actual';
                } else {
                    delete newErrors.currentPassword;
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const payload = {
                username: formData.username,
                email: formData.email
            };

            if (formData.newPassword) {
                payload.password = formData.newPassword;
            }

            const response = await fetch('http://localhost:5000/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setFeedback({
                    type: 'error',
                    message: data.msg || 'Error al actualizar los datos'
                });
                setSubmitting(false);
                return;
            }

            // Actualizar localStorage
            const updatedUser = {
                ...user,
                username: formData.username,
                email: formData.email
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Limpiar formulario
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            setFeedback({
                type: 'success',
                message: '¡Datos actualizados correctamente!'
            });

            setTimeout(() => {
                setFeedback(null);
            }, 4000);
        } catch (error) {
            setFeedback({
                type: 'error',
                message: 'Error de conexión con el servidor'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="account-settings">
                <Navbar_Home />
                <div className="account-settings__loading">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="account-settings">
            <Navbar_Home />
            <div className="account-settings__container">
                <div className="account-settings__header">
                    <div className="account-settings__header-content">
                        <FontAwesomeIcon icon={faUser} className="account-settings__header-icon" />
                        <div>
                            <h1 className="account-settings__title">Configuración de Cuenta</h1>
                            <p className="account-settings__subtitle">Administra tu información personal</p>
                        </div>
                    </div>
                </div>

                {feedback && (
                    <div className={`account-settings__feedback account-settings__feedback--${feedback.type}`}>
                        <FontAwesomeIcon 
                            icon={feedback.type === 'success' ? faCheck : faExclamation}
                            className="account-settings__feedback-icon"
                        />
                        <span>{feedback.message}</span>
                    </div>
                )}

                <form className="account-settings__form" onSubmit={handleSubmit}>
                    {/* Sección de Información Personal */}
                    <div className="account-settings__section">
                        <h2 className="account-settings__section-title">Información Personal</h2>
                        
                        <div className="account-settings__form-group">
                            <label htmlFor="username" className="account-settings__label">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`account-settings__input ${
                                    errors.username && touched.username ? 'account-settings__input--error' : ''
                                }`}
                                placeholder="Tu nombre de usuario"
                            />
                            {errors.username && touched.username && (
                                <span className="account-settings__error">{errors.username}</span>
                            )}
                        </div>

                        <div className="account-settings__form-group">
                            <label htmlFor="email" className="account-settings__label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`account-settings__input ${
                                    errors.email && touched.email ? 'account-settings__input--error' : ''
                                }`}
                                placeholder="tu@email.com"
                            />
                            {errors.email && touched.email && (
                                <span className="account-settings__error">{errors.email}</span>
                            )}
                        </div>
                    </div>

                    {/* Sección de Cambio de Contraseña */}
                    <div className="account-settings__section">
                        <h2 className="account-settings__section-title">Cambiar Contraseña</h2>
                        <p className="account-settings__section-desc">
                            Deja estos campos en blanco si no deseas cambiar tu contraseña
                        </p>

                        <div className="account-settings__form-group">
                            <label htmlFor="currentPassword" className="account-settings__label">
                                Contraseña Actual
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`account-settings__input ${
                                    errors.currentPassword && touched.currentPassword ? 'account-settings__input--error' : ''
                                }`}
                                placeholder="••••••••"
                            />
                            {errors.currentPassword && touched.currentPassword && (
                                <span className="account-settings__error">{errors.currentPassword}</span>
                            )}
                        </div>

                        <div className="account-settings__form-row">
                            <div className="account-settings__form-group">
                                <label htmlFor="newPassword" className="account-settings__label">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`account-settings__input ${
                                        errors.newPassword && touched.newPassword ? 'account-settings__input--error' : ''
                                    }`}
                                    placeholder="••••••••"
                                />
                                {errors.newPassword && touched.newPassword && (
                                    <span className="account-settings__error">{errors.newPassword}</span>
                                )}
                            </div>

                            <div className="account-settings__form-group">
                                <label htmlFor="confirmPassword" className="account-settings__label">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`account-settings__input ${
                                        errors.confirmPassword && touched.confirmPassword ? 'account-settings__input--error' : ''
                                    }`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && touched.confirmPassword && (
                                    <span className="account-settings__error">{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="account-settings__actions">
                        <button
                            type="submit"
                            disabled={submitting || Object.keys(errors).length > 0}
                            className="account-settings__btn account-settings__btn--primary"
                        >
                            <FontAwesomeIcon 
                                icon={submitting ? faSpinner : faSave}
                                className={submitting ? 'account-settings__btn-icon--spin' : ''}
                            />
                            {submitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="account-settings__btn account-settings__btn--secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
