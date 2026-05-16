import React, { useState } from "react";
import "./Invite.css";
import axios from "axios";
import { toast } from "react-toastify";

const Invite = ({ url, token }) => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setData((d) => ({ ...d, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/api/admin/invite`, data, {
                headers: { token },
            });
            if (res.data.success) {
                toast.success(res.data.message || "Invited");
                setData({ name: "", email: "", password: "", role: "staff" });
            } else {
                toast.error(res.data.message || "Failed");
            }
        } catch {
            toast.error("Could not reach server");
        }
    };

    return (
        <div className="invite-page">
            <h1>Invite team member</h1>
            <p className="invite-sub">
                Super admins can create <strong>Staff</strong> (orders only) or <strong>Manager</strong> (menu +
                orders) accounts.
            </p>
            <form className="invite-form" onSubmit={onSubmit}>
                <input
                    name="name"
                    value={data.name}
                    onChange={onChange}
                    type="text"
                    placeholder="Full name"
                    required
                />
                <input
                    name="email"
                    value={data.email}
                    onChange={onChange}
                    type="email"
                    placeholder="Work email"
                    required
                />
                <input
                    name="password"
                    value={data.password}
                    onChange={onChange}
                    type="password"
                    placeholder="Temporary password (min. 8 characters)"
                    minLength={8}
                    required
                />
                <label className="invite-label">
                    Role
                    <select name="role" value={data.role} onChange={onChange}>
                        <option value="staff">Staff — view & update orders only</option>
                        <option value="manager">Manager — menu, availability & orders</option>
                    </select>
                </label>
                <button type="submit">Create account</button>
            </form>
        </div>
    );
};

export default Invite;
