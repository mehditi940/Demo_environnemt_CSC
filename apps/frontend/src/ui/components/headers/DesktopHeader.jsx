import React, { useEffect, useState, useContext } from 'react';
import { Link, NavLink,useNavigate, useLocation } from 'react-router-dom';
import '../../styles/components/header/DesktopHeader.css';
import { logoutUser } from '../../../business/authManager';
import { AuthContext } from '../../../context/AuthContext';


const DesktopHeader = () => {
    const [scrolled, setScrolled] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();
   

    useEffect(() => {

        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true); // Voeg de class toe als er gescrold is
            } else {
                setScrolled(false); // Verwijder de class als er niet genoeg gescrold is
            }
        };

        // Event listener toevoegen
        window.addEventListener('scroll', handleScroll);

        // Cleanup event listener bij unmounten
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Leg



    const navigate = useNavigate();
    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const roleDisplayMap = {
        admin: 'Beheerder',
        surgeon: 'Chirurg',
        user: 'Gebruiker',
        system: 'Systeem',
    };

    const rawFirstName = currentUser?.firstName?.trim();
    const displayFirstName = rawFirstName
        ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
        : 'Account';

    return (
        <div className={`desktop-header ${scrolled ? 'scrolled' : ''}`} role="banner" aria-label="Main navigation header">
            <Link 
                to="/" 
                className="logo-link" 
                aria-label="Home"
            >
                <div className="logo-container">
                    <img src="/logo.png" alt="UMC Utrecht" className="logo" />
                </div>
            </Link>

            <nav aria-label="Main navigation">
            </nav>

            <div className="header-actions">
                {currentUser?.role === 'admin' && (
                    <>
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) => `nav-link dashboard-link${isActive ? ' active' : ''}`}
                            aria-label="Ga naar dashboard"
                            end
                        >
                            Dashboard
                        </NavLink>
                        <span className="header-separator" aria-hidden="true"></span>
                    </>
                )}
                {currentUser?.role === 'surgeon' && (
                    <>
                        <Link 
                            to="/chirurg/dashboard" 
                            className={`dashboard-link ${location.pathname === '/chirurg/dashboard' ? 'active' : ''}`}
                            aria-label="Ga naar kamer"
                        >
                            Kamers
                        </Link>
                        <span className="header-separator" aria-hidden="true"></span>
                    </>
                )}
                <NavLink
                    to="/profiel"
                    className={({ isActive }) => `user-badge-link${isActive ? ' active' : ''}`}
                    aria-label="Profiel"
                    title="Profiel"
                    end
                >
                    <div className="user-badge">
                        <span className="user-badge__name">{displayFirstName}</span>
                        {(() => {
                            const roleKey = currentUser?.role?.toLowerCase();
                            if (!roleKey) return null;
                            const localized = roleDisplayMap[roleKey] || (roleKey.charAt(0).toUpperCase() + roleKey.slice(1));
                            return <span className="user-badge__role">{localized}</span>;
                        })()}
                    </div>
                </NavLink>
                <button className="logout-icon-btn" onClick={handleLogout} aria-label="Uitloggen">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DesktopHeader;
