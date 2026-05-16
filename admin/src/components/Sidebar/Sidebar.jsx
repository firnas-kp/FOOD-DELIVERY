import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ profile }) => {
  const isStaff = profile?.role === "staff";
  const isSuper = profile?.role === "super_admin";

  return (
    <div className='sidebar'>
        <div className="sidebar-options">
            <NavLink to='/dashboard' className="sidebar-option">
                <img src={assets.parcel_icon} alt="" />
                <p>Dashboard</p>
            </NavLink>
            {!isStaff && (
              <>
                <NavLink to='/add' className="sidebar-option">
                    <img src={assets.add_icon} alt="" />
                    <p>Add Items</p>
                </NavLink>
                <NavLink to='/list' className="sidebar-option">
                    <img src={assets.order_icon} alt="" />
                    <p>List Items</p>
                </NavLink>
                <NavLink to='/coupons' className="sidebar-option">
                    <img src={assets.order_icon} alt="" />
                    <p>Coupons</p>
                </NavLink>
              </>
            )}
            <NavLink to='/orders' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Orders</p>
            </NavLink>
            {isSuper && (
              <>
                <NavLink to='/team' className="sidebar-option">
                  <img src={assets.order_icon} alt="" />
                  <p>Team</p>
                </NavLink>
                <NavLink to='/invite' className="sidebar-option">
                  <img src={assets.parcel_icon} alt="" />
                  <p>Invite team</p>
                </NavLink>
              </>
            )}
            </div>
        </div>
  )
}

export default Sidebar
