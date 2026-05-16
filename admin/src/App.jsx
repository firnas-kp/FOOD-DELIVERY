import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Invite from "./pages/Invite/Invite";
import Dashboard from "./pages/Dashboard/Dashboard";
import Team from "./pages/Team/Team";
import Coupons from "./pages/Coupons/Coupons";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ManagerRoute = ({ profile, children }) => {
    if (profile?.role === "staff") {
        return <Navigate to="/orders" replace />;
    }
    return children;
};

const SuperRoute = ({ profile, children }) => {
    if (profile?.role !== "super_admin") {
        return <Navigate to="/orders" replace />;
    }
    return children;
};

const App = () => {
    const url = "http://localhost:4000";
    const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem("adminToken", token);
        } else {
            localStorage.removeItem("adminToken");
            setProfile(null);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        (async () => {
            try {
                const r = await axios.get(`${url}/api/admin/me`, { headers: { token } });
                if (cancelled) return;
                if (r.data.success) {
                    setProfile(r.data.admin);
                } else {
                    setToken("");
                }
            } catch {
                if (!cancelled) setToken("");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token, url]);

    if (!token) {
        return (
            <div>
                <ToastContainer />
                <Login url={url} setToken={setToken} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="admin-loading">
                <ToastContainer />
                <p>Loading…</p>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer />
            <Navbar profile={profile} onLogout={() => setToken("")} />
            <div className="app-content">
                <Sidebar profile={profile} />
                <main className="admin-main">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard url={url} token={token} />} />
                        <Route
                            path="/add"
                            element={
                                <ManagerRoute profile={profile}>
                                    <Add url={url} token={token} />
                                </ManagerRoute>
                            }
                        />
                        <Route
                            path="/list"
                            element={
                                <ManagerRoute profile={profile}>
                                    <List url={url} token={token} />
                                </ManagerRoute>
                            }
                        />
                        <Route
                            path="/coupons"
                            element={
                                <ManagerRoute profile={profile}>
                                    <Coupons url={url} token={token} />
                                </ManagerRoute>
                            }
                        />
                        <Route path="/orders" element={<Orders url={url} token={token} />} />
                        <Route
                            path="/invite"
                            element={
                                <SuperRoute profile={profile}>
                                    <Invite url={url} token={token} />
                                </SuperRoute>
                            }
                        />
                        <Route
                            path="/team"
                            element={
                                <SuperRoute profile={profile}>
                                    <Team url={url} token={token} profile={profile} />
                                </SuperRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to={profile.role === "staff" ? "/orders" : "/dashboard"} replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
