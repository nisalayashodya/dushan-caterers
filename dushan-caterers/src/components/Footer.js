// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main container">
        <div className="footer-brand">
          <img src="/assets/DushanCaterersLOGO.png" alt="Dushan Caterers" className="f-logo" />
          <h3>Dushan Caterers</h3>
          <p>Crystallize the uniqueness of a grand ceremony. Sri Lanka's finest outdoor catering service.</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">
              <i className="bi bi-facebook" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
              <i className="bi bi-instagram" />
            </a>
            <a href="https://wa.me/94777510513" target="_blank" rel="noreferrer" title="WhatsApp">
              <i className="bi bi-whatsapp" />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/"><i className="bi bi-house-fill me-1" />Home</Link></li>
            <li><Link to="/about"><i className="bi bi-info-circle-fill me-1" />About Us</Link></li>
            <li><Link to="/menu"><i className="bi bi-menu-button-wide-fill me-1" />Our Menu</Link></li>
            <li><Link to="/customize"><i className="bi bi-pencil-square me-1" />Customize Menu</Link></li>
            <li><Link to="/contact"><i className="bi bi-envelope-fill me-1" />Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Services</h4>
          <ul>
            <li><i className="bi bi-heart-fill me-1" style={{color:'#D4AF37'}} />Wedding Catering</li>
            <li><i className="bi bi-briefcase-fill me-1" style={{color:'#D4AF37'}} />Corporate Events</li>
            <li><i className="bi bi-balloon-fill me-1" style={{color:'#D4AF37'}} />Birthday Parties</li>
            <li><i className="bi bi-flower1 me-1" style={{color:'#D4AF37'}} />Religious Ceremonies</li>
            <li><i className="bi bi-star-fill me-1" style={{color:'#D4AF37'}} />Custom Packages</li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Info</h4>
          <p><i className="bi bi-telephone-fill me-2" style={{color:'#D4AF37'}} />0777 510 513</p>
          <p><i className="bi bi-envelope-fill me-2" style={{color:'#D4AF37'}} />dushan@dushancaterers.lk</p>
          <p><i className="bi bi-geo-alt-fill me-2" style={{color:'#D4AF37'}} />Sri Lanka</p>
          <p><i className="bi bi-clock-fill me-2" style={{color:'#D4AF37'}} />Mon–Sun: 8:00AM – 5:00PM</p>
          <div className="whatsapp-btn">
            <a href="https://wa.me/94777510513" target="_blank" rel="noreferrer" className="btn btn-gold btn-sm">
              <i className="bi bi-whatsapp me-1" />WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dushan Caterers (PVT) LTD. All rights reserved.</p>
      </div>

      <style>{`
        .me-1 { margin-right: 4px; }
        .me-2 { margin-right: 8px; }
        .footer { background: #1A1A1A; color: #ccc; margin-top: 80px; }
        .footer-main { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; padding: 60px 20px 40px; }
        .f-logo { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; display: block; }
        .footer-brand h3 { font-family: 'Cormorant Garamond', serif; color: white; font-size: 1.5rem; margin-bottom: 10px; }
        .footer-brand p { font-size: 13px; line-height: 1.7; color: #888; margin-bottom: 16px; }
        .social-links { display: flex; gap: 10px; }
        .social-links a { width: 34px; height: 34px; background: #2A2A2A; border: 1px solid #3A3A3A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #D4AF37; transition: all 0.3s; text-decoration: none; }
        .social-links a:hover { background: #D4AF37; color: #1A1A1A; }
        .footer-links h4, .footer-contact h4 { font-family: 'Cormorant Garamond', serif; color: white; font-size: 1.2rem; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #D4AF37; display: inline-block; }
        .footer-links ul { list-style: none; }
        .footer-links ul li, .footer-links ul a { color: #888; font-size: 13px; line-height: 2.2; transition: color 0.3s; cursor: pointer; display: block; }
        .footer-links ul a:hover { color: #D4AF37; }
        .footer-contact p { font-size: 13px; margin-bottom: 10px; color: #888; display: flex; align-items: center; }
        .whatsapp-btn { margin-top: 16px; }
        .footer-bottom { border-top: 1px solid #2A2A2A; padding: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #555; }
        @media (max-width: 768px) {
          .footer-main { grid-template-columns: 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>
    </footer>
  );
}