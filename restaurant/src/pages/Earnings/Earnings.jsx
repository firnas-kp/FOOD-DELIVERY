import React, { useEffect, useState } from "react";
import "./Earnings.css";
import axios from "axios";
import { toast } from "react-toastify";

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

const Earnings = ({ url, token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const r = await axios.get(`${url}/api/restaurant/earnings`, { headers: { token } });
            if (r.data.success) {
                setData(r.data.data);
            } else {
                toast.error(r.data.message || "Could not load earnings");
            }
        } catch {
            toast.error("Could not load earnings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return (
            <div className="earn-page">
                <p>Loading earnings…</p>
            </div>
        );
    }

    const byStatus = data?.byStatus || [];
    const monthly = data?.monthly || [];

    return (
        <div className="earn-page">
            <div className="earn-header">
                <div>
                    <h1>Earnings</h1>
                    <p>Paid orders only. Amounts mirror what customers were charged (after discounts).</p>
                </div>
                <button type="button" onClick={load}>
                    Refresh
                </button>
            </div>

            <section className="earn-panel">
                <h2>By order status</h2>
                {byStatus.length === 0 ? (
                    <p className="earn-empty">No paid orders yet.</p>
                ) : (
                    <div className="earn-table-wrap">
                        <table className="earn-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Orders</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {byStatus.map((row) => (
                                    <tr key={row._id}>
                                        <td>{row._id || "—"}</td>
                                        <td>{row.count}</td>
                                        <td>{formatCurrency(row.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="earn-panel">
                <h2>Monthly paid volume</h2>
                {monthly.length === 0 ? (
                    <p className="earn-empty">No monthly history yet.</p>
                ) : (
                    <div className="earn-table-wrap">
                        <table className="earn-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Orders</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthly.map((row) => (
                                    <tr key={`${row._id.y}-${row._id.m}`}>
                                        <td>
                                            {row._id.y}-{String(row._id.m).padStart(2, "0")}
                                        </td>
                                        <td>{row.count}</td>
                                        <td>{formatCurrency(row.amount)}</td>
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

export default Earnings;
