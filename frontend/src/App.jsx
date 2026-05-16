import React, { useContext, useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import Offers from "./pages/Offers/Offers";
import Restaurants from "./pages/Restaurants/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail/RestaurantDetail";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { StoreContext } from "./context/StoreContext";

const AppShell = () => {
    const { token, setLoginGateHandler } = useContext(StoreContext);
    const location = useLocation();
    const isVerifyPath = location.pathname === "/verify";

    const [showLogin, setShowLogin] = useState(() => {
        if (typeof window !== "undefined" && window.location.pathname === "/verify") {
            return false;
        }
        return !localStorage.getItem("token");
    });

    useEffect(() => {
        setLoginGateHandler(() => () => setShowLogin(true));
    }, [setLoginGateHandler]);

    useEffect(() => {
        if (token) {
            setShowLogin(false);
        }
      
    }, [token]);

    const allowBrowseWithoutLogin = isVerifyPath && !token;

    const mustShowAuthWall = !token && !allowBrowseWithoutLogin;

    return (
        <>
            {showLogin && (
                <LoginPopup setShowLogin={setShowLogin} allowClose={!!token || allowBrowseWithoutLogin} />
            )}

            <div className={`app ${mustShowAuthWall ? "app--auth-locked" : ""}`}>
                {!mustShowAuthWall && (
                    <>
                        <Navbar setShowLogin={setShowLogin} />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/cart"
                                element={
                                    <ProtectedRoute>
                                        <Cart />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/order"
                                element={
                                    <ProtectedRoute>
                                        <PlaceOrder />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/verify" element={<Verify />} />
                            <Route
                                path="/myorders"
                                element={
                                    <ProtectedRoute>
                                        <MyOrders />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/offers"
                                element={
                                    <ProtectedRoute>
                                        <Offers />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/restaurants"
                                element={
                                    <ProtectedRoute>
                                        <Restaurants />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/restaurants/:restaurantId"
                                element={
                                    <ProtectedRoute>
                                        <RestaurantDetail />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                        <Footer />
                    </>
                )}
            </div>
        </>
    );
};

const App = () => <AppShell />;

export default App;
