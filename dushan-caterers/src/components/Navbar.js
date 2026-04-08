// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''}`}>
      <div className="navbar-top">
        <span><i className="bi bi-telephone-fill me-1" /> 0777 510 513</span>
        <span><i className="bi bi-envelope-fill me-1" /> dushan@dushancaterers.lk</span>
        <span><i className="bi bi-clock-fill me-1" /> Mon–Sun: 8:00AM – 5:00PM</span>
      </div>
      <div className="navbar-main container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <img src="/assets/DushanCaterersLOGO.png" alt="Dushan Caterers Logo" style={{width:'44px',height:'44px',borderRadius:'50%',objectFit:'cover'}} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Dushan Caterers</span>
            <span className="brand-tagline">Grand Catering Services</span>
          </div>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/menu" onClick={() => setMenuOpen(false)}>Menu</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
          {currentUser ? (
            <>
              {userRole === 'admin' ? (
                <li><Link to="/admin" onClick={() => setMenuOpen(false)}><i className="bi bi-shield-fill me-1" />Admin Panel</Link></li>
              ) : (
                <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}><i className="bi bi-grid-fill me-1" />My Orders</Link></li>
              )}
              <li>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1" />Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}><i className="bi bi-person-fill me-1" />Login</Link></li>
              <li>
                <Link to="/customize" className="btn btn-gold btn-sm" onClick={() => setMenuOpen(false)}>
                  <i className="bi bi-pencil-square me-1" />Customize Menu
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <style>{`
        .me-1 { margin-right: 4px; }
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000; transition: all 0.4s ease;
        }
        .navbar-top {
          background: #1A1A1A; color: #D4AF37;
          display: flex; justify-content: center; gap: 32px;
          padding: 6px 0; font-size: 12px; font-family: 'Jost', sans-serif;
        }
        .navbar-main {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; background: rgba(26,26,26,0.95);
          backdrop-filter: blur(10px); transition: all 0.4s ease;
        }
        .navbar.scrolled .navbar-top { display: none; }
        .navbar.scrolled .navbar-main { background: #1A1A1A; padding: 10px 20px; box-shadow: 0 2px 20px rgba(0,0,0,0.4); }
        .navbar-brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .brand-name { display: block; font-family: 'Cormorant Garamond', serif; font-size: 18px; color: white; font-weight: 600; }
        .brand-tagline { display: block; font-size: 10px; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase; }
        .navbar-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .navbar-links a { color: #ccc; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; transition: color 0.3s; position: relative; }
        .navbar-links a:hover { color: #D4AF37; }
        .navbar-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #D4AF37; transition: width 0.3s; }
        .navbar-links a:hover::after { width: 100%; }
        .menu-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .menu-toggle span { display: block; width: 24px; height: 2px; background: #D4AF37; border-radius: 2px; transition: all 0.3s; }
        @media (max-width: 768px) {
          .navbar-top { display: none !important; }
          .menu-toggle { display: flex; }
          .navbar-links { display: none; position: absolute; top: 70px; left: 0; right: 0; background: #1A1A1A; flex-direction: column; padding: 20px; gap: 16px; }
          .navbar-links.open { display: flex; }
        }
      `}</style>
    </nav>
  );
}