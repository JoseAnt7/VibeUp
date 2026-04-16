import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/AuthForms.css";
import { API_BASE } from "../utils/apiBase";

export const Forms = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    
    // Estados para Login
    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    
    // Estados para Registro
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    
    // Estados generales
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' o 'error'
    const [isLoading, setIsLoading] = useState(false);

    
    // Validar email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Manejar Login
    async function handleLogin(e) {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        if (!loginIdentifier || !loginPassword) {
            setMessage("Por favor completa todos los campos");
            setMessageType("error");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: loginIdentifier, password: loginPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.msg || 'Error al iniciar sesión');
                setMessageType("error");
                setIsLoading(false);
                return;
            }
            // store token and user
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setMessage('¡Bienvenido! Redirigiendo...');
            setMessageType("success");
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setMessage('Error de conexión con el servidor');
            setMessageType("error");
            setIsLoading(false);
        }
    }

    // Manejar Registro
    async function handleRegister(e) {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        // Validaciones
        if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
            setMessage("Por favor completa todos los campos");
            setMessageType("error");
            setIsLoading(false);
            return;
        }

        if (!isValidEmail(registerEmail)) {
            setMessage("Email inválido");
            setMessageType("error");
            setIsLoading(false);
            return;
        }

        if (registerPassword.length < 6) {
            setMessage("La contraseña debe tener al menos 6 caracteres");
            setMessageType("error");
            setIsLoading(false);
            return;
        }

        if (registerPassword !== registerConfirmPassword) {
            setMessage("Las contraseñas no coinciden");
            setMessageType("error");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: registerUsername,
                    email: registerEmail,
                    password: registerPassword
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.msg || 'Error al registrar usuario');
                setMessageType("error");
                setIsLoading(false);
                return;
            }
            
            setMessage('¡Registro exitoso! Iniciando sesión...');
            setMessageType("success");
            
            // Auto-login después del registro
            setTimeout(() => {
                setIsLogin(true);
                setLoginIdentifier(registerEmail);
                setLoginPassword("");
                setRegisterUsername("");
                setRegisterEmail("");
                setRegisterPassword("");
                setRegisterConfirmPassword("");
                setMessage("");
            }, 1500);
        } catch (err) {
            setMessage('Error de conexión con el servidor');
            setMessageType("error");
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Fondo decorativo */}
                <div className="auth-background">
                    <div className="auth-background__shape auth-background__shape--1"></div>
                    <div className="auth-background__shape auth-background__shape--2"></div>
                    <div className="auth-background__shape auth-background__shape--3"></div>
                </div>

                {/* Contenedor del formulario */}
                <div className="auth-wrapper">
                    {/* Toggle de pestañas */}
                    <div className="auth-toggle">
                        <button
                            className={`auth-toggle__item ${isLogin ? 'auth-toggle__item--active' : ''}`}
                            onClick={() => {
                                setIsLogin(true);
                                setMessage("");
                            }}
                        >
                            <span className="auth-toggle__text">Iniciar Sesión</span>
                        </button>
                        <button
                            className={`auth-toggle__item ${!isLogin ? 'auth-toggle__item--active' : ''}`}
                            onClick={() => {
                                setIsLogin(false);
                                setMessage("");
                            }}
                        >
                            <span className="auth-toggle__text">Registrarse</span>
                        </button>
                    </div>

                    {/* Formulario de Login */}
                    {isLogin && (
                        <form onSubmit={handleLogin} className="auth-form auth-form--login">
                            <div className="auth-header">
                                <h1 className="auth-header__title">Bienvenido</h1>
                                <p className="auth-header__subtitle">Inicia sesión para acceder a tu música</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-identifier" className="form-group__label">
                                    Usuario o Email
                                </label>
                                <div className="form-group__input-wrapper">
                                    <input
                                        id="login-identifier"
                                        className="form-group__input"
                                        type="text"
                                        placeholder="Usuario o correo electrónico"
                                        value={loginIdentifier}
                                        onChange={(e) => setLoginIdentifier(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="form-group__icon"></span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-password" className="form-group__label">
                                    Contraseña
                                </label>
                                <div className="form-group__input-wrapper">
                                    <input
                                        id="login-password"
                                        className="form-group__input"
                                        type="password"
                                        placeholder="Tu contraseña"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="form-group__icon"></span>
                                </div>
                            </div>

                            {message && (
                                <div className={`auth-message auth-message--${messageType}`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-button auth-button--submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Procesando..." : "Iniciar Sesión"}
                            </button>

                            <p className="auth-footer">
                                ¿No tienes cuenta?{" "}
                                <button
                                    type="button"
                                    className="auth-link"
                                    onClick={() => {
                                        setIsLogin(false);
                                        setMessage("");
                                    }}
                                >
                                    Regístrate aquí
                                </button>
                            </p>
                        </form>
                    )}

                    {/* Formulario de Registro */}
                    {!isLogin && (
                        <form onSubmit={handleRegister} className="auth-form auth-form--register">
                            <div className="auth-header">
                                <h1 className="auth-header__title">Crear Cuenta</h1>
                                <p className="auth-header__subtitle">nete a nuestra comunidad de músicos</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-username" className="form-group__label">
                                    Usuario
                                </label>
                                <div className="form-group__input-wrapper">
                                    <input
                                        id="register-username"
                                        className="form-group__input"
                                        type="text"
                                        placeholder="Nombre de usuario único"
                                        value={registerUsername}
                                        onChange={(e) => setRegisterUsername(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="form-group__icon"></span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-email" className="form-group__label">
                                    Email
                                </label>
                                <div className="form-group__input-wrapper">
                                    <input
                                        id="register-email"
                                        className="form-group__input"
                                        type="email"
                                        placeholder="Tu correo electrónico"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="form-group__icon"></span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-password" className="form-group__label">
                                    Contraseña
                                </label>
                                <div className="form-group__input-wrapper">
                                    <input
                                        id="register-password"
                                        className="form-group__input"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="form-group__icon"></span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-confirm-password" className="form-group__label">
                                    Confirmar Contraseña
                                </label>
                                <div className="form-group__input-wrapper">
                                    <input
                                        id="register-confirm-password"
                                        className="form-group__input"
                                        type="password"
                                        placeholder="Repite tu contraseña"
                                        value={registerConfirmPassword}
                                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="form-group__icon"></span>
                                </div>
                            </div>

                            {message && (
                                <div className={`auth-message auth-message--${messageType}`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-button auth-button--submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Procesando..." : "Crear Cuenta"}
                            </button>

                            <p className="auth-footer">
                                ¿Ya tienes cuenta?{" "}
                                <button
                                    type="button"
                                    className="auth-link"
                                    onClick={() => {
                                        setIsLogin(true);
                                        setMessage("");
                                    }}
                                >
                                    Inicia sesión
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
