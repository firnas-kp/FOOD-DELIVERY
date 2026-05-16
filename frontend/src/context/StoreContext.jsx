import axios from "axios";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000";
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [food_list, setFoodList] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    const loginGateRef = useRef(() => {});

    const requestLogin = useCallback(() => {
        loginGateRef.current();
    }, []);

    const setLoginGateHandler = useCallback((fn) => {
        loginGateRef.current = typeof fn === "function" ? fn : () => {};
    }, []);

    const fetchUserProfile = useCallback(async (authToken) => {
        if (!authToken) {
            setUserProfile(null);
            return;
        }
        try {
            const res = await axios.get(`${url}/api/user/me`, { headers: { token: authToken } });
            if (res.data.success) {
                setUserProfile(res.data.user);
            } else {
                setUserProfile(null);
            }
        } catch {
            setUserProfile(null);
        }
    }, [url]);

    const addToCart = async (itemId) => {
        if (!token) {
            requestLogin();
            return;
        }
        const item = food_list.find((p) => p._id === itemId);
        if (item?.inStock === false) {
            alert("This dish is currently unavailable.");
            return;
        }
        const newKey = item?.restaurantId ? String(item.restaurantId) : "__platform__";
        for (const id in cartItems) {
            const qty = cartItems[id];
            if (!qty || qty <= 0) continue;
            const other = food_list.find((p) => p._id === id);
            if (!other) continue;
            const otherKey = other.restaurantId ? String(other.restaurantId) : "__platform__";
            if (otherKey !== newKey) {
                alert(
                    "Your cart already has dishes from another restaurant. Finish or clear that cart before adding from a different kitchen."
                );
                return;
            }
        }
        const nextCount = (cartItems[itemId] || 0) + 1;
        setCartItems((prev) => ({ ...prev, [itemId]: nextCount }));
        try {
            const res = await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
            if (!res.data.success) {
                setCartItems((prev) => {
                    const n = (prev[itemId] || 0) - 1;
                    if (n <= 0) {
                        const { [itemId]: _, ...rest } = prev;
                        return rest;
                    }
                    return { ...prev, [itemId]: n };
                });
                alert(res.data.message || "Could not add to cart");
            }
        } catch {
            setCartItems((prev) => {
                const n = (prev[itemId] || 0) - 1;
                if (n <= 0) {
                    const { [itemId]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [itemId]: n };
            });
            alert("Could not add to cart");
        }
    };

    const removeFromCart = async (itemId) => {
        if (!token) {
            requestLogin();
            return;
        }
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (!itemInfo || itemInfo.inStock === false) continue;
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    };

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    };

    const loadCartData = async (authToken) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: authToken } });
        setCartItems(response.data.cartData || {});
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
        }
        loadData();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            loadCartData(token);
            fetchUserProfile(token);
        } else {
            localStorage.removeItem("token");
            setCartItems({});
            setUserProfile(null);
        }
    }, [token, fetchUserProfile]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        userProfile,
        fetchUserProfile,
        requestLogin,
        setLoginGateHandler,
    };

    return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
