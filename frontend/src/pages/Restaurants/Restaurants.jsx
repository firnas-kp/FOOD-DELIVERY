import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Restaurants.css";
import { StoreContext } from "../../context/StoreContext";
import { restaurantKeyFromFood, slugFromRestaurantKey } from "../../lib/restaurantSlug";

const ratingFromKey = (key) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 1)) % 97;
    return (4 + (h % 9) / 10).toFixed(1);
};

const Restaurants = () => {
    const { food_list, url } = useContext(StoreContext);

    const restaurants = useMemo(() => {
        const map = new Map();
        for (const f of food_list || []) {
            const key = restaurantKeyFromFood(f);
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    slug: slugFromRestaurantKey(key),
                    name:
                        key === "__platform__"
                            ? "Tomato Kitchen"
                            : f.restaurantName?.trim() || "Partner restaurant",
                    items: [],
                    categories: new Set(),
                });
            }
            const row = map.get(key);
            row.items.push(f);
            row.categories.add(f.category);
        }
        return [...map.values()].sort((a, b) => b.items.length - a.items.length);
    }, [food_list]);

    const partnerOrigin =
        (import.meta.env.VITE_RESTAURANT_APP_URL || "http://localhost:5175").replace(/\/$/, "");

    return (
        <div className="restaurants-page">
            <section className="restaurants-hero">
                <div className="restaurants-hero-inner">
                    <p className="restaurants-eyebrow">Order online</p>
                    <h1>Restaurants near you</h1>
                    <p className="restaurants-lede">
                        Browse kitchens on Tomato — from our house menu to independent partner chefs. Tap a card to see
                        their full menu.
                    </p>
                    <div className="restaurants-hero-actions">
                        <a className="restaurants-partner-cta" href={partnerOrigin} target="_blank" rel="noopener noreferrer">
                            List your restaurant →
                        </a>
                    </div>
                </div>
            </section>

            <section className="restaurants-grid-section">
                <div className="restaurants-grid-head">
                    <h2>{restaurants.length} places to order from</h2>
                    <p>Updated live from what is available on the platform today.</p>
                </div>
                <div className="restaurants-grid">
                    {restaurants.map((r) => {
                        const cover = r.items[0];
                        const img = cover ? `${url}/images/${cover.image}` : "";
                        const cats = [...r.categories].slice(0, 3).join(" · ");
                        const eta = Math.min(45, 18 + (r.items.length % 12) + (r.key.length % 8));
                        return (
                            <article key={r.key} className="restaurant-card">
                                <Link to={`/restaurants/${r.slug}`} className="restaurant-card-media">
                                    {img ? <img src={img} alt="" /> : <div className="restaurant-card-ph" />}
                                    <span className="restaurant-card-badge">{ratingFromKey(r.key)} ★</span>
                                    <div className="restaurant-card-overlay">
                                        <span className="restaurant-card-cta">View menu</span>
                                    </div>
                                </Link>
                                <div className="restaurant-card-body">
                                    <Link to={`/restaurants/${r.slug}`}>
                                        <h3>{r.name}</h3>
                                    </Link>
                                    <p className="restaurant-card-meta">{cats || "Mixed cuisines"}</p>
                                    <p className="restaurant-card-foot">
                                        <span>{r.items.length} dishes</span>
                                        <span className="dot">·</span>
                                        <span>{eta}–{eta + 12} min</span>
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Restaurants;
