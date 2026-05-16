import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const Login = ({ url, setToken }) => {
    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        businessName: "",
        phone: "",
        address: "",
        city: "",
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((d) => ({ ...d, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        let endpoint = `${url}/api/restaurant/login`;
        let payload = { email: data.email, password: data.password };
        if (currState === "Sign Up") {
            endpoint = `${url}/api/restaurant/register`;
            payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                businessName: data.businessName,
                phone: data.phone,
                address: data.address,
                city: data.city,
            };
        }
        try {
            const response = await axios.post(endpoint, payload);
            if (response.data.success) {
                setToken(response.data.token);
                toast.success(currState === "Login" ? "Welcome back" : "Restaurant account created");
            } else {
                toast.error(response.data.message || "Something went wrong");
            }
        } catch {
            toast.error("Could not reach server");
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-card">
                <img className="admin-login-logo" src={assets.logo} alt="" />
                <form onSubmit={onSubmit} className="admin-login-form">
                    <h1>{currState === "Login" ? "Restaurant sign in" : "Partner registration"}</h1>
                    <p className="admin-login-sub">
                        {currState === "Login"
                            ? "Manage your menu, orders, and payouts."
                            : "Create your partner profile to start receiving orders."}
                    </p>
                    {currState === "Sign Up" && (
                        <>
                            <input
                                name="name"
                                onChange={onChangeHandler}
                                value={data.name}
                                type="text"
                                placeholder="Your name"
                                required
                            />
                            <input
                                name="businessName"
                                onChange={onChangeHandler}
                                value={data.businessName}
                                type="text"
                                placeholder="Restaurant / brand name"
                                required
                            />
                            <input
                                name="phone"
                                onChange={onChangeHandler}
                                value={data.phone}
                                type="text"
                                placeholder="Phone (optional)"
                            />
                            <input
                                name="address"
                                onChange={onChangeHandler}
                                value={data.address}
                                type="text"
                                placeholder="Street address (optional)"
                            />
                            <input
                                name="city"
                                onChange={onChangeHandler}
                                value={data.city}
                                type="text"
                                placeholder="City (optional)"
                            />
                        </>
                    )}
                    <input
                        name="email"
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder="Email"
                        required
                    />
                    <input
                        name="password"
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder="Password (min. 8 characters)"
                        required
                        minLength={8}
                    />
                    <button type="submit">{currState === "Login" ? "Sign in" : "Create account"}</button>
                </form>
                {currState === "Login" ? (
                    <p className="admin-login-switch">
                        New partner? <span onClick={() => setCurrState("Sign Up")}>Sign up</span>
                    </p>
                ) : (
                    <p className="admin-login-switch">
                        Already registered? <span onClick={() => setCurrState("Login")}>Sign in</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
