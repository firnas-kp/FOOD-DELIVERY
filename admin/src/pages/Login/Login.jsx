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
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((d) => ({ ...d, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        let endpoint = `${url}/api/admin/login`;
        if (currState === "Sign Up") {
            endpoint = `${url}/api/admin/register`;
        }
        try {
            const response = await axios.post(endpoint, data);
            if (response.data.success) {
                setToken(response.data.token);
                const role = response.data.admin?.role;
                const roleMsg = role ? ` (${role.split("_").join(" ")})` : "";
                toast.success(
                    (currState === "Login" ? "Welcome back" : "Account created") + roleMsg
                );
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
                    <h1>{currState === "Login" ? "Admin sign in" : "Create admin account"}</h1>
                    <p className="admin-login-sub">
                        {currState === "Login"
                            ? "Use your admin email and password."
                            : "Register the first admin or add another authorized account."}
                    </p>
                    {currState === "Sign Up" && (
                        <input
                            name="name"
                            onChange={onChangeHandler}
                            value={data.name}
                            type="text"
                            placeholder="Your name"
                            required
                        />
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
                        Need an admin account?{" "}
                        <span onClick={() => setCurrState("Sign Up")}>Sign up</span>
                    </p>
                ) : (
                    <p className="admin-login-switch">
                        Already have an account? <span onClick={() => setCurrState("Login")}>Sign in</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
