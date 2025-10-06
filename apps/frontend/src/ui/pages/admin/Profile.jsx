import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import BackBtn from '../../components/buttons/BackBtn';
import '../../styles/pages/admin/Profile.css';

const Profile = () => {
    const { currentUser } = useContext(AuthContext);

    const roleDisplayMap = {
        admin: 'Beheerder',
        surgeon: 'Chirurg',
        user: 'Gebruiker',
        system: 'Systeem',
    };

    const firstName = currentUser?.firstName || '';
    const lastName = currentUser?.lastName || '';
    const name = firstName ? `${firstName} ${lastName || ''}`.trim() : '';
    const email = currentUser?.email || '';
    const roleKey = currentUser?.role?.toLowerCase();
    const role = roleKey ? (roleDisplayMap[roleKey] || roleKey.charAt(0).toUpperCase() + roleKey.slice(1)) : '';
    const avatarInitial = firstName ? firstName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : 'U');

    const navigate = useNavigate();

    return (
        <main role="main" className="rooms-main">
            <div className="main-container">
                <BackBtn />
                <div className="rooms-header">
                    <h1 className="rooms-title">Profiel</h1>
                </div>

                <section className="profile-layout">
                    <div className="profile-summary">
                        <div className="profile-avatar" aria-hidden="true">{avatarInitial}</div>
                        {role && <span className="role-badge">{role}</span>}
                    </div>
                    <div className="profile-details">
                        <dl className="profile-dl">
                            <dt>Naam</dt>
                            <dd>{name || '—'}</dd>

                            <dt>E-mail</dt>
                            <dd>{email || '—'}</dd>

                            <dt>Rol</dt>
                            <dd>{role || '—'}</dd>
                        </dl>
                    </div>

                    <div className="profile-actions profile-actions--left">
                        <button className="btn btn-primary" onClick={() => navigate('/admin/nieuw-wachtwoord')}>
                            Wachtwoord wijzigen
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Profile;


