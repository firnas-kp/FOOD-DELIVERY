import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const Navbar = ({ profile, onLogout }) => {
    return (
        <div className="navbar">
            <img className="logo" src={assets.logo} alt="" />
            <div className="navbar-right">
                {profile && (
                    <span className="navbar-role" title={profile.email}>
                        {profile.businessName || profile.name}
                    </span>
                )}
                <img className="profile" src={assets.profile_image} alt="" />
                {onLogout && (
                    <button type="button" className="navbar-logout" onClick={onLogout}>
                        Log out
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
