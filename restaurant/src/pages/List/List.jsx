import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url, token }) => {
    const [list, setList] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
        price: "",
        category: "Salad",
        prepTimeMins: "20",
        inStock: true,
        isVegetarian: false,
    });

    const fetchList = async () => {
        const response = await axios.get(`${url}/api/restaurant/food/list`, { headers: { token } });
        if (response.data.success) {
            setList(response.data.data);
        } else {
            toast.error("Error");
        }
    };

    const removeFood = async (foodId) => {
        const response = await axios.post(`${url}/api/restaurant/food/remove`, { id: foodId }, { headers: { token } });
        await fetchList();
        if (response.data.success) {
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message || "Error");
        }
    };

    const toggleStock = async (foodId, currentlyInStock) => {
        const next = currentlyInStock !== false ? false : true;
        const response = await axios.post(
            `${url}/api/restaurant/food/availability`,
            { id: foodId, inStock: next },
            { headers: { token } }
        );
        if (response.data.success) {
            toast.success(response.data.message);
            await fetchList();
        } else {
            toast.error(response.data.message || "Could not update availability");
        }
    };

    const openEdit = (item) => {
        setEditing(item._id);
        setForm({
            id: item._id,
            name: item.name || "",
            description: item.description || "",
            price: item.price || "",
            category: item.category || "Salad",
            prepTimeMins: item.prepTimeMins ?? 20,
            inStock: item.inStock !== false,
            isVegetarian: item.isVegetarian === true,
        });
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        const response = await axios.post(`${url}/api/restaurant/food/update`, form, { headers: { token } });
        if (response.data.success) {
            toast.success(response.data.message || "Updated");
            setEditing(null);
            await fetchList();
        } else {
            toast.error(response.data.message || "Could not update item");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className="list add flex-col">
            <p>Your menu</p>
            <p className="list-legend">Dishes listed here are visible to customers ordering from your kitchen.</p>
            <div className="list-table">
                <div className="list-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b>Prep</b>
                    <b>Veg</b>
                    <b>Stock</b>
                    <b>Edit</b>
                    <b>Remove</b>
                </div>
                {list.map((item, index) => {
                    const inStock = item.inStock !== false;
                    return (
                        <div key={index} className="list-table-format">
                            <img src={`${url}/images/` + item.image} alt="" />
                            <p>{item.name}</p>
                            <p>{item.category}</p>
                            <p>${item.price}</p>
                            <p>{item.prepTimeMins ?? 20} min</p>
                            <p>{item.isVegetarian ? "Yes" : "—"}</p>
                            <button
                                type="button"
                                className={`list-stock-btn ${inStock ? "in" : "out"}`}
                                onClick={() => toggleStock(item._id, inStock)}
                            >
                                {inStock ? "In stock" : "Out"}
                            </button>
                            <button type="button" className="list-edit-btn" onClick={() => openEdit(item)}>
                                Edit
                            </button>
                            <p onClick={() => removeFood(item._id)} className="cursor">
                                X
                            </p>
                        </div>
                    );
                })}
            </div>
            {editing && (
                <div className="list-edit-backdrop">
                    <form className="list-edit-modal" onSubmit={submitEdit}>
                        <h3>Edit dish</h3>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Name"
                            required
                        />
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows="4"
                            placeholder="Description"
                            required
                        />
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            placeholder="Price"
                            required
                        />
                        <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                            <option value="Salad">Salad</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Deserts">Deserts</option>
                            <option value="Sandwich">Sandwich</option>
                            <option value="Cake">Cake</option>
                            <option value="Pure Veg">Pure Veg</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Noodles">Noodles</option>
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={form.prepTimeMins}
                            onChange={(e) => setForm((f) => ({ ...f, prepTimeMins: e.target.value }))}
                            placeholder="Prep time"
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={form.inStock}
                                onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                            />{" "}
                            In Stock
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={form.isVegetarian}
                                onChange={(e) => setForm((f) => ({ ...f, isVegetarian: e.target.checked }))}
                            />{" "}
                            Vegetarian
                        </label>
                        <div className="list-edit-actions">
                            <button type="submit">Save</button>
                            <button type="button" className="muted" onClick={() => setEditing(null)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default List;
