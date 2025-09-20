import React, { useEffect, useState } from 'react';
import { Link  } from 'react-router-dom';
import '../../styles/components/header/DesktopHeader.css';


const DesktopHeader = () => {
    const [scrolled, setScrolled] = useState(false);
   

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



    return (
        <header className={`desktop-header ${scrolled ? 'scrolled' : ''}`}>


            <Link to="/">
                    <div className="logo-container">
                        <img src="/logo.png" alt="Logo" className="logo" />
                    </div>
                </Link>
                <nav>
                    <ul className="nav-list">
                    <li><Link to="/admin/dashboard" className="nav-link">Dashboard</Link></li>
                    </ul>
                </nav>
            
        </header>
    );
};

export default DesktopHeader;
