import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="must-footer">
      <div className="footer-top">
        <div className="footer-col footer-logo">
          <img src="/images/IEEE-MUST.webp" alt="IEEE MUST Logo" className="footer-logo-img" />
          <div className="footer-logo-text">
            <span className="footer-logo-title">IEEE</span><br />
            <span className="footer-logo-branch">Misr University for Science and Technology<br />Student Branch</span>
          </div>
        </div>
        <div className="footer-col footer-links">
          <div className="footer-link-group">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/membership">Membership</Link>
          </div>
          <div className="footer-link-group">
            <Link to="/events">Events</Link>
            <Link to="/committees">Committees</Link>
            <Link to="/ai-assistant">AI Assistant</Link>
          </div>
        </div>
        <div className="footer-col footer-contact">
          <div className="footer-contact-item"><i className="fa-solid fa-envelope"></i> ieeemust2027@gmail.com</div>
          <div className="footer-contact-item"><i className="fa-solid fa-phone"></i> +20 10 640 77 699</div>
          <div className="footer-social">
            <a href="https://www.facebook.com/IEEEMUST.egy" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/ieeemust/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/company/mustieeesb/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://www.tiktok.com/@ieee.must.sb" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
          </div>
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <span>© 2027 IEEE MUST SB. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
