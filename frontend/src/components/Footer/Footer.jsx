import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const SOCIAL = {
    facebook: "https://www.facebook.com/",
    twitter: "https://twitter.com/",
    linkedin: "https://www.linkedin.com/",
};

const Footer = () => {
    return (
        <div className="footer" id="footer">
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.logo} alt="Tomato" />
                    <p>
                        Order great food from trusted kitchens near you. Fast delivery, curated menus, and offers you
                        will want to share with friends.
                    </p>
                    <div className="footer-social-icons">
                        <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <img src={assets.facebook_icon} alt="" />
                        </a>
                        <a href={SOCIAL.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <img src={assets.twitter_icon} alt="" />
                        </a>
                        <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <img src={assets.linkedin_icon} alt="" />
                        </a>
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li>
                            <a href="/">Home</a>
                        </li>
                        <li>
                            <a href="#explore-menu">Menu</a>
                        </li>
                        <li>
                            <a href="#app-download">Mobile app</a>
                        </li>
                        <li>
                            <a href="#footer">Contact</a>
                        </li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+1-212-456-7890</li>
                        <li>
                            <a href="mailto:contact@tomato.com">contact@tomato.com</a>
                        </li>
                    </ul>
                </div>
            </div>
            <hr />
            <p className="footer-copyright">Copyright 2026 Tomato.com - All Right Reserved.</p>
        </div>
    );
};

export default Footer;
