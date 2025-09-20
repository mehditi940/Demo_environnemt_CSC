import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/header/BurgerMenu.css'; // Zorg dat je een apart CSS-bestand hebt


const BurgerMenu = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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
        <header className= {`burger-menu-header ${scrolled ? 'scrolled' : ''}`}>
                 <Link to="/">
                <div className="logoContainerMobile">
                    <img src="/logo.png" alt="Logo" className="logo" />
                </div>
            </Link>
            <div className="burger-icon" onClick={toggleMenu}>
                <div className={`burger-line ${menuOpen ? 'open' : ''}`}></div>
                <div className={`burger-line ${menuOpen ? 'open' : ''}`}></div>
                <div className={`burger-line ${menuOpen ? 'open' : ''}`}></div>
            </div>
            <nav className={`burger-nav ${menuOpen ? 'open' : ''}`}>
                <ul className="burger-nav-list">
     
                    <li><Link to="/admin/dashboard" onClick={toggleMenu}>Dashboard</Link></li>

                
                </ul>
            </nav>
       
        </header>
    );
};

export default BurgerMenu;
