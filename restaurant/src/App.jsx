import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./pages/Dashboard/Dashboard";
import Earnings from "./pages/Earnings/Earnings";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const App = () => {
    const url = "http://localhost:4000";
    const [token, setToken] = useState(() => localStorage.getItem("restaurantToken") || "");
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const handoff = params.get("handoff");
        if (handoff) {
            setToken(handoff);
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem("restaurantToken", token);
        } else {
            localStorage.removeItem("restaurantToken");
            setProfile(null);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        (async () => {
            try {
                const r = await axios.get(`${url}/api/restaurant/me`, { headers: { token } });
                if (cancelled) return;
                if (r.data.success) {
                    setProfile(r.data.restaurant);
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
                <Sidebar />
                <main className="admin-main">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard url={url} token={token} />} />
                        <Route path="/add" element={<Add url={url} token={token} />} />
                        <Route path="/list" element={<List url={url} token={token} />} />
                        <Route path="/orders" element={<Orders url={url} token={token} />} />
                        <Route path="/earnings" element={<Earnings url={url} token={token} />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
