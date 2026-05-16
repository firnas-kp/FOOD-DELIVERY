import React, { useEffect, useMemo, useState } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";

const Orders = ({ url, token }) => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [query, setQuery] = useState("");

    const fetchAllOrders = async () => {
        const response = await axios.get(`${url}/api/restaurant/orders/list`, {
            headers: { token },
        });
        if (response.data.success) {
            setOrders(response.data.data);
        } else {
            toast.error("Could not load orders");
        }
    };

    const statusHandler = async (event, orderId) => {
        const response = await axios.post(
            `${url}/api/restaurant/orders/status`,
            {
                orderId,
                status: event.target.value,
            },
            { headers: { token } }
        );
        if (response.data.success) {
            await fetchAllOrders();
        } else {
            toast.error(response.data.message || "Could not update status");
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return orders.filter((order) => {
            const statusOk = statusFilter === "All" || order.status === statusFilter;
            if (!statusOk) return false;
            if (!needle) return true;
            const name = `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.toLowerCase();
            const phone = `${order.address?.phone || ""}`;
            return name.includes(needle) || phone.includes(needle);
        });
    }, [orders, statusFilter, query]);

    return (
        <div className="order-page">
            <div className="order-header">
                <div>
                    <h2>Incoming orders</h2>
                    <p>Update status as you prepare and hand off deliveries.</p>
                </div>
                <button type="button" onClick={fetchAllOrders}>
                    Refresh
                </button>
            </div>
            <div className="order-filters">
                <input
                    type="text"
                    placeholder="Search by customer or phone"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All statuses</option>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                </select>
            </div>
            <div className="order-list">
                {filteredOrders.map((order) => (
                    <div key={order._id} className="order-item">
                        <img src={assets.parcel_icon} alt="" />
                        <div>
                            <p className="order-item-food">
                                {order.items.map(
                                    (item, idx) =>
                                        `${item.name} x ${item.quantity}${idx < order.items.length - 1 ? ", " : ""}`
                                )}
                            </p>
                            <p className="order-item-name">{`${order.address?.firstName || ""} ${order.address?.lastName || ""}`}</p>
                            <div className="order-item-address">
                                <p>{`${order.address?.street || ""},`}</p>
                                <p>{`${order.address?.city || ""}, ${order.address?.state || ""}, ${order.address?.country || ""}, ${order.address?.zipcode || ""}`}</p>
                            </div>
                            <p className="order-item-phone">{order.address?.phone}</p>
                        </div>
                        <p>Items: {order.items?.length || 0}</p>
                        <p>${order.amount}</p>
                        <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
                            <option value="Food Processing">Food Processing</option>
                            <option value="Out for delivery">Out for delivery</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
