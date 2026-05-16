import React, { useContext, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import "./RestaurantDetail.css";
import { StoreContext } from "../../context/StoreContext";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { restaurantKeyFromFood, restaurantKeyFromSlug } from "../../lib/restaurantSlug";

const RestaurantDetail = () => {
    const { restaurantId: slug } = useParams();
    const { food_list, url } = useContext(StoreContext);

    const meta = useMemo(() => {
        const key = restaurantKeyFromSlug(slug);
        const items = (food_list || []).filter((f) => restaurantKeyFromFood(f) === key);
        const first = items[0];
        const name =
            key === "__platform__"
                ? "Tomato Kitchen"
                : first?.restaurantName?.trim() || "Restaurant";
        return { key, items, name, cover: first };
    }, [food_list, slug]);

    if (!meta.items.length) {
        return (
            <div className="restaurant-detail-empty">
                <h1>Kitchen not found</h1>
                <p>This menu may have been removed or the link is outdated.</p>
                <Link to="/restaurants">← Back to restaurants</Link>
            </div>
        );
    }

    const heroImg = meta.cover ? `${url}/images/${meta.cover.image}` : "";

    const subtitle =
        meta.key === "__platform__"
            ? `${meta.items.length} dishes · Tomato house kitchen`
            : `${meta.items.length} dishes · Partner kitchen`;

    return (
        <div className="restaurant-detail">
            <div className="restaurant-detail-breadcrumb">
                <Link to="/restaurants">Restaurants</Link>
                <span>/</span>
                <span>{meta.name}</span>
            </div>

            <header className="restaurant-detail-hero" style={{ backgroundImage: heroImg ? `url(${heroImg})` : undefined }}>
                <div className="restaurant-detail-hero-scrim" />
                <div className="restaurant-detail-hero-inner">
                    <h1>{meta.name}</h1>
                    <p>{subtitle}</p>
                </div>
            </header>

            <FoodDisplay category="All" restaurantKey={meta.key} title={`Popular at ${meta.name}`} />
        </div>
    );
};

export default RestaurantDetail;
