import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import axios from "axios";
import { toast } from "react-toastify";

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

const Dashboard = ({ url, token }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const load = async () => {
        try {
            const response = await axios.get(`${url}/api/admin/dashboard`, { headers: { token } });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                toast.error(response.data.message || "Could not load dashboard");
            }
        } catch {
            toast.error("Could not load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return <div className="dashboard-page"><p>Loading dashboard...</p></div>;
    }

    const kpis = data?.kpis || {};
    const recentOrders = data?.recentOrders || [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Operations dashboard</h1>
                    <p>Real-time overview of orders, menu health, and team activity.</p>
                </div>
                <button type="button" onClick={load}>Refresh</button>
            </div>

            <div className="dashboard-kpis">
                <article className="kpi-card"><h3>Total Orders</h3><p>{kpis.totalOrders || 0}</p></article>
                <article className="kpi-card"><h3>Pending Orders</h3><p>{kpis.pendingOrders || 0}</p></article>
                <article className="kpi-card"><h3>Delivered</h3><p>{kpis.deliveredOrders || 0}</p></article>
                <article className="kpi-card"><h3>Revenue</h3><p>{formatCurrency(kpis.totalRevenue)}</p></article>
                <article className="kpi-card"><h3>Menu Items</h3><p>{kpis.totalFoods || 0}</p></article>
                <article className="kpi-card warn"><h3>Out of Stock</h3><p>{kpis.outOfStockFoods || 0}</p></article>
                <article className="kpi-card"><h3>Admins</h3><p>{kpis.totalAdmins || 0}</p></article>
                <article className="kpi-card warn"><h3>Locked Accounts</h3><p>{kpis.lockedAdmins || 0}</p></article>
            </div>

            <section className="dashboard-panel">
                <h2>Recent orders</h2>
                {recentOrders.length === 0 ? (
                    <p className="empty">No recent orders yet.</p>
                ) : (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order.address?.firstName} {order.address?.lastName}</td>
                                        <td>{order.items?.length || 0}</td>
                                        <td>{order.status}</td>
                                        <td>{formatCurrency(order.amount)}</td>
                                        <td>{new Date(order.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
