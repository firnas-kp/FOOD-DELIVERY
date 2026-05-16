import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const roleLabel = (role) => {
    if (role === "super_admin") return "Super admin";
    if (role === "manager") return "Manager";
    if (role === "staff") return "Staff";
    return role || "Admin";
};

const Navbar = ({ profile, onLogout }) => {
    return (
        <div className="navbar">
            <img className="logo" src={assets.logo} alt="" />
            <div className="navbar-right">
                {profile && (
                    <span className="navbar-role" title={profile.email}>
                        {profile.name} · {roleLabel(profile.role)}
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
