import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({
    category,
    restaurantKey = null,
    title = "Top dishes near you",
    searchQuery = "",
}) => {
    const { food_list } = useContext(StoreContext);

    const q = String(searchQuery || "").trim().toLowerCase();

    const matchesRestaurant = (item) => {
        if (restaurantKey == null) return true;
        const k = item.restaurantId ? String(item.restaurantId) : "__platform__";
        return k === restaurantKey;
    };

    const matchesSearch = (item) => {
        if (!q) return true;
        const blob = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        return blob.includes(q);
    };

    return (
        <div className="food-display" id="food-display">
            <h2>{title}</h2>
            <div className="food-display-list">
                {food_list.map((item) => {
                    if (!(category === "All" || category === item.category)) return null;
                    if (!matchesRestaurant(item)) return null;
                    if (!matchesSearch(item)) return null;
                    return (
                        <FoodItem
                            key={item._id}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            inStock={item.inStock}
                            isVegetarian={item.isVegetarian}
                            prepTimeMins={item.prepTimeMins}
                            restaurantName={item.restaurantName}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default FoodDisplay;
