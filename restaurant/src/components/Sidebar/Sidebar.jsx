import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-options">
                <NavLink to="/dashboard" className="sidebar-option">
                    <img src={assets.parcel_icon} alt="" />
                    <p>Dashboard</p>
                </NavLink>
                <NavLink to="/add" className="sidebar-option">
                    <img src={assets.add_icon} alt="" />
                    <p>Add dish</p>
                </NavLink>
                <NavLink to="/list" className="sidebar-option">
                    <img src={assets.order_icon} alt="" />
                    <p>Menu</p>
                </NavLink>
                <NavLink to="/orders" className="sidebar-option">
                    <img src={assets.order_icon} alt="" />
                    <p>Orders</p>
                </NavLink>
                <NavLink to="/earnings" className="sidebar-option">
                    <img src={assets.parcel_icon} alt="" />
                    <p>Earnings</p>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
