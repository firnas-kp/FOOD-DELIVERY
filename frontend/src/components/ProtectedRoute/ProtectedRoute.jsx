import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

/** Requires customer JWT; redirects home and opens login if missing. */
const ProtectedRoute = ({ children }) => {
    const { token, requestLogin } = useContext(StoreContext);
    const location = useLocation();

    useEffect(() => {
        if (!token) {
            requestLogin();
        }
    }, [token, location.pathname, requestLogin]);

    if (!token) {
        return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;
