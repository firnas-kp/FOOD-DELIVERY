import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { restaurantKeyFromFood, slugFromRestaurantKey } from "../../lib/restaurantSlug";

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("menu");
    const { getTotalCartAmount, token, setToken, userProfile, requestLogin, food_list, url } =
        useContext(StoreContext);
    const [dark, setDark] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQ, setSearchQ] = useState("");
    const searchWrapRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const onDoc = (e) => {
            if (!searchWrapRef.current?.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") setSearchOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
        setShowLogin(true);
    };

    const initials =
        userProfile?.name
            ?.split(/\s+/)
            .filter(Boolean)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "••";

    const toggleDarkMode = () => {
        setDark(!dark);
        document.body.classList.toggle("dark-mode");
    };

    useEffect(() => {
        const savedMode = localStorage.getItem("dark-mode");
        if (savedMode === "true") {
            document.body.classList.add("dark-mode");
            setDark(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("dark-mode", dark);
    }, [dark]);

    const searchResults = useMemo(() => {
        const q = searchQ.trim().toLowerCase();
        if (q.length < 2) return [];
        const foods = food_list || [];
        const scored = foods
            .map((f) => {
                const name = (f.name || "").toLowerCase();
                const cat = (f.category || "").toLowerCase();
                const desc = (f.description || "").toLowerCase();
                let score = 0;
                if (name.includes(q)) score += 4;
                if (name.startsWith(q)) score += 3;
                if (cat.includes(q)) score += 2;
                if (desc.includes(q)) score += 1;
                return { f, score };
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map((x) => x.f);
        return scored;
    }, [food_list, searchQ]);

    const restaurantSummaries = useMemo(() => {
        const q = searchQ.trim().toLowerCase();
        if (q.length < 2) return [];
        const map = new Map();
        for (const f of food_list || []) {
            const key = restaurantKeyFromFood(f);
            const name =
                key === "__platform__"
                    ? "Tomato Kitchen"
                    : (f.restaurantName || "Restaurant").trim();
            if (!map.has(key)) {
                map.set(key, { key, name, slug: slugFromRestaurantKey(key) });
            }
        }
        return [...map.values()].filter((r) => r.name.toLowerCase().includes(q)).slice(0, 4);
    }, [food_list, searchQ]);

    const runSearch = (e) => {
        e.preventDefault();
        const q = searchQ.trim();
        if (!q) return;
        setSearchOpen(false);
        navigate(`/?q=${encodeURIComponent(q)}#food-display`);
    };

    const goDish = (name) => {
        setSearchOpen(false);
        navigate(`/?q=${encodeURIComponent(name)}#food-display`);
    };

    const goRestaurant = (slug) => {
        setSearchOpen(false);
        navigate(`/restaurants/${slug}`);
    };

    return (
        <div className="navbar">
            <Link to="/" onClick={() => setMenu("home")}>
                <img src={assets.logo} alt="" className="logo" />
            </Link>

            <ul className="navbar-menu">
                <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
                    home
                </Link>
                <a href="/#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
                    menu
                </a>
                <a
                    href="/#app-download"
                    onClick={() => setMenu("mobile-app")}
                    className={menu === "mobile-app" ? "active" : ""}
                >
                    mobile-app
                </a>
                <a
                    href="/#footer"
                    onClick={() => setMenu("contact-us")}
                    className={menu === "contact-us" ? "active" : ""}
                >
                    contact us
                </a>
                <Link to="/offers">Offers</Link>
                <Link to="/restaurants" className="navbar-partner">
                    Restaurants
                </Link>
            </ul>

            <div className="navbar-right">
                <button type="button" onClick={toggleDarkMode} className="dark-toggle" aria-label="Toggle theme">
                    {dark ? "☀️" : "🌙"}
                </button>

                <div className="navbar-search-wrap" ref={searchWrapRef}>
                    <button
                        type="button"
                        className="navbar-search-trigger"
                        aria-label="Search"
                        aria-expanded={searchOpen}
                        onClick={() => setSearchOpen((o) => !o)}
                    >
                        <img src={assets.search_icon} alt="" />
                    </button>
                    {searchOpen && (
                        <div className="navbar-search-panel" role="dialog" aria-label="Search">
                            <form onSubmit={runSearch} className="navbar-search-form">
                                <input
                                    autoFocus
                                    value={searchQ}
                                    onChange={(e) => setSearchQ(e.target.value)}
                                    placeholder="Search dishes, cuisines, restaurants…"
                                    aria-label="Search query"
                                />
                                <button type="submit">Go</button>
                            </form>
                            {searchQ.trim().length >= 2 && (
                                <div className="navbar-search-results">
                                    {restaurantSummaries.length > 0 && (
                                        <div className="navbar-search-section">
                                            <p className="navbar-search-label">Restaurants</p>
                                            <ul>
                                                {restaurantSummaries.map((r) => (
                                                    <li key={r.key}>
                                                        <button type="button" onClick={() => goRestaurant(r.slug)}>
                                                            <span className="navbar-search-rest">{r.name}</span>
                                                            <span className="navbar-search-hint">View menu</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="navbar-search-section">
                                        <p className="navbar-search-label">Dishes</p>
                                        {searchResults.length === 0 ? (
                                            <p className="navbar-search-empty">No dishes match yet.</p>
                                        ) : (
                                            <ul>
                                                {searchResults.map((item) => (
                                                    <li key={item._id}>
                                                        <button type="button" onClick={() => goDish(item.name)}>
                                                            <img src={`${url}/images/${item.image}`} alt="" />
                                                            <span>
                                                                <span className="navbar-search-dish-name">{item.name}</span>
                                                                <span className="navbar-search-dish-meta">
                                                                    {item.category} · ${item.price}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="navbar-search-icon">
                    <Link
                        to="/cart"
                        onClick={(e) => {
                            if (!token) {
                                e.preventDefault();
                                requestLogin();
                            }
                        }}
                    >
                        <img src={assets.basket_icon} alt="" />
                    </Link>
                    <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
                </div>

                {!token ? (
                    <button type="button" onClick={() => setShowLogin(true)}>
                        Sign in
                    </button>
                ) : (
                    <div className="navbar-profile">
                        <div className="nav-profile-trigger" aria-haspopup="true">
                            <span className="nav-profile-avatar">{initials}</span>
                            <span className="nav-profile-chevron">▾</span>
                        </div>
                        <div className="nav-profile-dropdown">
                            <div className="nav-profile-card">
                                <div className="nav-profile-card-avatar">{initials}</div>
                                <div className="nav-profile-card-text">
                                    <p className="nav-profile-name">{userProfile?.name || "Customer"}</p>
                                    <p className="nav-profile-email">{userProfile?.email || ""}</p>
                                </div>
                            </div>
                            <ul className="nav-profile-actions">
                                <li onClick={() => navigate("/myorders")} role="presentation">
                                    <img src={assets.bag_icon} alt="" />
                                    <span>My orders</span>
                                </li>
                                <li onClick={() => navigate("/cart")} role="presentation">
                                    <img src={assets.basket_icon} alt="" />
                                    <span>Cart</span>
                                </li>
                                <li onClick={() => navigate("/restaurants")} role="presentation">
                                    <span className="nav-profile-emoji" aria-hidden>
                                        🍽️
                                    </span>
                                    <span>Restaurants</span>
                                </li>
                                <li onClick={logout} role="presentation">
                                    <img src={assets.logout_icon} alt="" />
                                    <span>Log out</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
