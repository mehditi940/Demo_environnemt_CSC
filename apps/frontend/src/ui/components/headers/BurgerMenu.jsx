import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/components/header/BurgerMenu.css'; // Zorg dat je een apart CSS-bestand hebt
import { AuthContext } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';
import { logoutUser } from '../../../business/authManager';


const BurgerMenu = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen((prev) => {
            if (!prev) {
                document.body.classList.add('no-scroll'); // Disable scroll
            } else {
                document.body.classList.remove('no-scroll'); // Enable scroll
            }
            return !prev;
        });
    };

  

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true); 
            } else {
                setScrolled(false); 
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Leg
   
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 1000);
        };

        checkScreenSize(); // Initial check
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);



    return (
        <div className= {`burger-menu-header ${scrolled ? 'scrolled' : ''}`} role="banner" aria-label="Mobile navigation header">
                 <Link to={currentUser?.role === 'surgeon' ? "/chirurg/dashboard" : "/"}>
                <div className="logoContainerMobile">
                    <img src="/logo.png" alt="Logo" className="logo" />
                </div>
            </Link>
            <button 
                className="burger-icon" 
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                aria-controls="burger-nav"
            >
                {menuOpen ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>
            <nav className={`burger-nav ${menuOpen ? 'open' : ''}`} id="burger-nav" aria-label="Mobile navigation">
                <ul className="burger-nav-list">
                    {currentUser?.role === 'admin' && (
                        <>
                            <li><Link to={ROUTES.ADMIN.DASHBOARD} onClick={toggleMenu}>Dashboard</Link></li>
                            <li><Link to={ROUTES.ADMIN.DASHBOARD} onClick={toggleMenu}>Profiel</Link></li>
                        </>
                    )}
                    {currentUser?.role === 'surgeon' && (
                        <>
                            <li><Link to={ROUTES.SURGEON.DASHBOARD} onClick={toggleMenu}>Dashboard</Link></li>
                            <li><Link to="/chirurg/rooms" onClick={toggleMenu}>Kamer</Link></li>
                            <li><Link to={ROUTES.SURGEON.DASHBOARD} onClick={toggleMenu}>Profiel</Link></li>
                        </>
                    )}

                
                </ul>
                <div className="settingsLogoutBtnBurg">
                    <button
                        className="logout-btn-mobile"
                        onClick={() => { logoutUser(); toggleMenu(); navigate(ROUTES.LOGIN); }}
                        aria-label="Uitloggen"
                    >
                        Uitloggen
                    </button>
                </div>
            </nav>
       
        </div>
    );
};

export default BurgerMenu;
