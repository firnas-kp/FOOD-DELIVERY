import React, { useEffect, useState } from "react";
import "./Team.css";
import axios from "axios";
import { toast } from "react-toastify";

const roleLabel = (role) => role === "super_admin" ? "Super Admin" : role === "manager" ? "Manager" : "Staff";

const Team = ({ url, token, profile }) => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTeam = async () => {
        try {
            const response = await axios.get(`${url}/api/admin/team`, { headers: { token } });
            if (response.data.success) {
                setTeam(response.data.data);
            } else {
                toast.error(response.data.message || "Could not load team");
            }
        } catch {
            toast.error("Could not load team");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const updateRole = async (adminId, role) => {
        const response = await axios.post(`${url}/api/admin/team/role`, { adminId, role }, { headers: { token } });
        if (response.data.success) {
            toast.success("Role updated");
            fetchTeam();
        } else {
            toast.error(response.data.message || "Could not update role");
        }
    };

    const toggleLock = async (adminId, isActive) => {
        const response = await axios.post(`${url}/api/admin/team/lock`, { adminId, isActive }, { headers: { token } });
        if (response.data.success) {
            toast.success(response.data.message || "Updated");
            fetchTeam();
        } else {
            toast.error(response.data.message || "Could not update account");
        }
    };

    return (
        <div className="team-page">
            <div className="team-header">
                <h1>Team management</h1>
                <p>Manage admin roles and account access locks.</p>
            </div>
            {loading ? (
                <p>Loading team...</p>
            ) : (
                <div className="team-table-wrap">
                    <table className="team-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map((admin) => {
                                const role = admin.role || "super_admin";
                                const isSelf = String(profile?.id) === String(admin._id);
                                const canEdit = role !== "super_admin" && !isSelf;
                                return (
                                    <tr key={admin._id}>
                                        <td>{admin.name}</td>
                                        <td>{admin.email}</td>
                                        <td>
                                            {role === "super_admin" ? (
                                                <span className="role-pill super">{roleLabel(role)}</span>
                                            ) : (
                                                <select
                                                    className="role-select"
                                                    value={role}
                                                    onChange={(e) => updateRole(admin._id, e.target.value)}
                                                    disabled={!canEdit}
                                                >
                                                    <option value="manager">Manager</option>
                                                    <option value="staff">Staff</option>
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-pill ${admin.isActive === false ? "locked" : "active"}`}>
                                                {admin.isActive === false ? "Locked" : "Active"}
                                            </span>
                                        </td>
                                        <td>{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}</td>
                                        <td>
                                            {canEdit ? (
                                                <button
                                                    type="button"
                                                    className={`lock-btn ${admin.isActive === false ? "unlock" : "lock"}`}
                                                    onClick={() => toggleLock(admin._id, admin.isActive === false)}
                                                >
                                                    {admin.isActive === false ? "Unlock" : "Lock"}
                                                </button>
                                            ) : (
                                                <span className="muted">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Team;
