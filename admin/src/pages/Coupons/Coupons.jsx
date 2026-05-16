import React, { useEffect, useState } from "react";
import "./Coupons.css";
import axios from "axios";
import { toast } from "react-toastify";

const initialForm = {
    code: "",
    description: "",
    discountType: "percent",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    startsAt: "",
    expiresAt: "",
    isActive: true,
};

const Coupons = ({ url, token }) => {
    const [coupons, setCoupons] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const fetchCoupons = async () => {
        const response = await axios.get(`${url}/api/coupon/list`, { headers: { token } });
        if (response.data.success) setCoupons(response.data.data);
        else toast.error(response.data.message || "Could not load coupons");
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            code: form.code.trim().toUpperCase(),
            discountValue: Number(form.discountValue),
            minOrderAmount: Number(form.minOrderAmount),
            maxDiscount: Number(form.maxDiscount),
            usageLimit: Number(form.usageLimit),
            startsAt: form.startsAt || null,
            expiresAt: form.expiresAt || null,
        };
        const endpoint = editingId ? "/api/coupon/update" : "/api/coupon/create";
        const body = editingId ? { id: editingId, ...payload } : payload;
        const response = await axios.post(`${url}${endpoint}`, body, { headers: { token } });
        if (response.data.success) {
            toast.success(response.data.message || (editingId ? "Coupon updated" : "Coupon created"));
            setEditingId(null);
            setForm(initialForm);
            fetchCoupons();
        } else {
            toast.error(response.data.message || "Could not save coupon");
        }
    };

    const onEdit = (c) => {
        setEditingId(c._id);
        setForm({
            code: c.code || "",
            description: c.description || "",
            discountType: c.discountType || "percent",
            discountValue: c.discountValue || 0,
            minOrderAmount: c.minOrderAmount || 0,
            maxDiscount: c.maxDiscount || 0,
            usageLimit: c.usageLimit || 0,
            startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : "",
            expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "",
            isActive: c.isActive !== false,
        });
    };

    const onRemove = async (id) => {
        const response = await axios.post(`${url}/api/coupon/remove`, { id }, { headers: { token } });
        if (response.data.success) {
            toast.success(response.data.message || "Deleted");
            fetchCoupons();
        } else {
            toast.error(response.data.message || "Delete failed");
        }
    };

    const onToggleActive = async (c) => {
        const response = await axios.post(
            `${url}/api/coupon/update`,
            { id: c._id, isActive: !(c.isActive !== false) },
            { headers: { token } }
        );
        if (response.data.success) fetchCoupons();
        else toast.error(response.data.message || "Update failed");
    };

    return (
        <div className="coupon-page">
            <div className="coupon-header">
                <div>
                    <h2>Coupon management</h2>
                    <p>Create and control promotional discounts from one place.</p>
                </div>
            </div>
            <form className="coupon-form" onSubmit={handleSubmit}>
                <input placeholder="Code (e.g. SAVE10)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
                <input placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                    <option value="percent">Percent</option>
                    <option value="flat">Flat amount</option>
                </select>
                <input type="number" min="1" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} required />
                <input type="number" min="0" placeholder="Min order amount" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
                <input type="number" min="0" placeholder="Max discount (0 = no cap)" value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))} />
                <input type="number" min="0" placeholder="Usage limit (0 = unlimited)" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} />
                <label>Starts at <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} /></label>
                <label>Expires at <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} /></label>
                <label className="coupon-check"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active</label>
                <div className="coupon-actions">
                    <button type="submit">{editingId ? "Update coupon" : "Create coupon"}</button>
                    {editingId && <button type="button" className="muted" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel edit</button>}
                </div>
            </form>
            <div className="coupon-table-wrap">
                <table className="coupon-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((c) => (
                            <tr key={c._id}>
                                <td>{c.code}</td>
                                <td>{c.discountType}</td>
                                <td>{c.discountValue}</td>
                                <td>{c.usedCount}/{c.usageLimit || "∞"}</td>
                                <td>{c.isActive === false ? "Inactive" : "Active"}</td>
                                <td>
                                    <button type="button" onClick={() => onEdit(c)}>Edit</button>
                                    <button type="button" onClick={() => onToggleActive(c)}>{c.isActive === false ? "Enable" : "Disable"}</button>
                                    <button type="button" className="danger" onClick={() => onRemove(c._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Coupons;
