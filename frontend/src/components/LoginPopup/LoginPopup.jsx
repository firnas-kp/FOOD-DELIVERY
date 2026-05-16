// import React, { useContext, useState } from "react";
// import "./LoginPopup.css";
// import { assets } from "../../assets/assets";
// import { StoreContext } from "../../context/StoreContext";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const getAdminAppOrigin = () =>
//     (import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174").replace(/\/$/, "");

// const getRestaurantAppOrigin = () =>
//     (import.meta.env.VITE_RESTAURANT_APP_URL || "http://localhost:5175").replace(/\/$/, "");

// const LoginPopup = ({ setShowLogin, allowClose = true }) => {
//     const { url, setToken, fetchUserProfile } = useContext(StoreContext);
//     const navigate = useNavigate();

//     const [accountType, setAccountType] = useState("customer");
//     const [currState, setCurrState] = useState("Login");
//     const [loading, setLoading] = useState(false);
//     const [data, setData] = useState({
//         name: "",
//         email: "",
//         password: "",
//         businessName: "",
//         phone: "",
//         city: "",
//     });

//     const onChangeHandler = (event) => {
//         const name = event.target.name;
//         const value = event.target.value;
//         setData((d) => ({ ...d, [name]: value }));
//     };

//     const switchAccountType = (type) => {
//         setAccountType(type);
//         setCurrState("Login");
//         setData({
//             name: "",
//             email: "",
//             password: "",
//             businessName: "",
//             phone: "",
//             city: "",
//         });
//     };

//     const switchMode = (mode) => {
//         setCurrState(mode);
//         setData((d) => ({
//             ...d,
//             password: "",
//         }));
//     };

//     const heading =
//         accountType === "customer"
//             ? currState === "Login"
//                 ? "Welcome back"
//                 : "Create your account"
//             : currState === "Login"
//               ? "Partner sign in"
//               : "Register your restaurant";

//     const subline =
//         accountType === "customer"
//             ? currState === "Login"
//                 ? "Sign in to order, track deliveries, and save favourites."
//                 : "Join Tomato to order from kitchens near you."
//             : currState === "Login"
//               ? "Manage your menu, orders, and earnings."
//               : "List your kitchen and start receiving orders.";

//     const onSubmit = async (event) => {
//         event.preventDefault();
//         setLoading(true);

//         try {
//             if (accountType === "customer") {
//                 const endpoint =
//                     currState === "Login" ? `${url}/api/user/login` : `${url}/api/user/register`;
//                 const payload =
//                     currState === "Login"
//                         ? { email: data.email, password: data.password }
//                         : { name: data.name, email: data.email, password: data.password };

//                 const response = await axios.post(endpoint, payload);

//                 if (response.data.success) {
//                     setToken(response.data.token);
//                     localStorage.setItem("token", response.data.token);
//                     await fetchUserProfile(response.data.token);
//                     setShowLogin(false);
//                     navigate("/");
//                 } else {
//                     alert(response.data.message || "Something went wrong");
//                 }
//             } else {
//                 const endpoint =
//                     currState === "Login"
//                         ? `${url}/api/restaurant/login`
//                         : `${url}/api/restaurant/register`;
//                 const payload =
//                     currState === "Login"
//                         ? { email: data.email, password: data.password }
//                         : {
//                               name: data.name,
//                               email: data.email,
//                               password: data.password,
//                               businessName: data.businessName,
//                               phone: data.phone || "",
//                               city: data.city || "",
//                           };

//                 const response = await axios.post(endpoint, payload);

//                 if (response.data.success) {
//                     const partnerUrl = `${getRestaurantAppOrigin()}/?handoff=${encodeURIComponent(response.data.token)}`;
//                     /* Full navigation avoids the customer auth gate reopening (no customer JWT). */
//                     window.location.assign(partnerUrl);
//                 } else {
//                     alert(response.data.message || "Something went wrong");
//                 }
//             }
//         } catch {
//             alert("Could not reach server. Is the API running on port 4000?");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openAdminPortal = () => {
//         window.open(getAdminAppOrigin(), "_blank", "noopener,noreferrer");
//     };

//     return (
//         <div className="login-popup">
//             <div className="login-popup-backdrop" aria-hidden />
//             <form onSubmit={onSubmit} className="login-popup-container">
//                 <div className="login-popup-title">
//                     <div>
//                         <p className="login-popup-brand">Tomato</p>
//                         <h2>{heading}</h2>
//                         <p className="login-popup-sub">{subline}</p>
//                     </div>
//                     {allowClose && (
//                         <button
//                             type="button"
//                             className="login-popup-close"
//                             aria-label="Close"
//                             onClick={() => setShowLogin(false)}
//                         >
//                             <img src={assets.cross_icon} alt="" />
//                         </button>
//                     )}
//                 </div>

//                 <div className="login-popup-role-toggle" role="tablist" aria-label="Account type">
//                     <button
//                         type="button"
//                         role="tab"
//                         aria-selected={accountType === "customer"}
//                         className={accountType === "customer" ? "active" : ""}
//                         onClick={() => switchAccountType("customer")}
//                     >
//                         Customer
//                     </button>
//                     <button
//                         type="button"
//                         role="tab"
//                         aria-selected={accountType === "restaurant"}
//                         className={accountType === "restaurant" ? "active" : ""}
//                         onClick={() => switchAccountType("restaurant")}
//                     >
//                         Restaurant partner
//                     </button>
//                 </div>

//                 <div className="login-popup-inputs">
//                     {accountType === "customer" && currState === "Sign Up" && (
//                         <input
//                             name="name"
//                             onChange={onChangeHandler}
//                             value={data.name}
//                             type="text"
//                             placeholder="Full name"
//                             autoComplete="name"
//                             required
//                         />
//                     )}

//                     {accountType === "restaurant" && currState === "Sign Up" && (
//                         <>
//                             <input
//                                 name="name"
//                                 onChange={onChangeHandler}
//                                 value={data.name}
//                                 type="text"
//                                 placeholder="Your name"
//                                 required
//                             />
//                             <input
//                                 name="businessName"
//                                 onChange={onChangeHandler}
//                                 value={data.businessName}
//                                 type="text"
//                                 placeholder="Restaurant / brand name"
//                                 required
//                             />
//                             <div className="login-popup-row">
//                                 <input
//                                     name="phone"
//                                     onChange={onChangeHandler}
//                                     value={data.phone}
//                                     type="tel"
//                                     placeholder="Phone (optional)"
//                                     autoComplete="tel"
//                                 />
//                                 <input
//                                     name="city"
//                                     onChange={onChangeHandler}
//                                     value={data.city}
//                                     type="text"
//                                     placeholder="City (optional)"
//                                 />
//                             </div>
//                         </>
//                     )}

//                     <input
//                         name="email"
//                         onChange={onChangeHandler}
//                         value={data.email}
//                         type="email"
//                         placeholder="Email"
//                         autoComplete="email"
//                         required
//                     />
//                     <input
//                         name="password"
//                         onChange={onChangeHandler}
//                         value={data.password}
//                         type="password"
//                         placeholder={currState === "Sign Up" ? "Password (min. 8 characters)" : "Password"}
//                         autoComplete={currState === "Sign Up" ? "new-password" : "current-password"}
//                         minLength={currState === "Sign Up" ? 8 : undefined}
//                         required
//                     />
//                 </div>

//                 <button type="submit" className="login-popup-submit" disabled={loading}>
//                     {loading ? "Please wait…" : currState === "Sign Up" ? "Continue" : "Sign in"}
//                 </button>

//                 <div className="login-popup-condition">
//                     <input type="checkbox" required id="terms-login" />
//                     <label htmlFor="terms-login">
//                         I agree to the terms of use and privacy policy.
//                     </label>
//                 </div>

//                 <p className="login-popup-switch">
//                     {currState === "Login" ? (
//                         <>
//                             New here?{" "}
//                             <button type="button" className="linkish" onClick={() => switchMode("Sign Up")}>
//                                 Create an account
//                             </button>
//                         </>
//                     ) : (
//                         <>
//                             Already have an account?{" "}
//                             <button type="button" className="linkish" onClick={() => switchMode("Login")}>
//                                 Sign in
//                             </button>
//                         </>
//                     )}
//                 </p>

//                 <div className="login-popup-admin-row">
//                     <span>Staff admin?</span>
//                     <button type="button" className="login-popup-admin-link" onClick={openAdminPortal}>
//                         Open admin console →
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default LoginPopup;
import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getAdminAppOrigin = () =>
    (import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174").replace(/\/$/, "");

const getRestaurantAppOrigin = () =>
    (import.meta.env.VITE_RESTAURANT_APP_URL || "http://localhost:5175").replace(/\/$/, "");

const LoginPopup = ({ setShowLogin, allowClose = true }) => {

    const { url, setToken, fetchUserProfile } = useContext(StoreContext);
    const navigate = useNavigate();

    const [accountType, setAccountType] = useState("customer");
    const [currState, setCurrState] = useState("Login");
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        businessName: "",
        phone: "",
        city: "",
    });

    // INPUT HANDLER
    const onChangeHandler = (event) => {
        const name = event.target.name;
        let value = event.target.value;

        // Prevent leading spaces
        if (value.startsWith(" ")) {
            value = value.trimStart();
        }

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // VALIDATION
    const validateForm = () => {

        // NAME
        if (data.name && data.name.trim().length < 3) {
            alert("Name must contain at least 3 characters");
            return false;
        }

        // BUSINESS NAME
        if (data.businessName && data.businessName.trim().length < 3) {
            alert("Restaurant name must contain at least 3 characters");
            return false;
        }

        // CITY
        if (data.city && data.city.trim() === "") {
            alert("City cannot be empty");
            return false;
        }

        // EMAIL
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(data.email)) {
            alert("Please enter a valid email address");
            return false;
        }

        // PASSWORD
        if (data.password.length < 8) {
            alert("Password must be at least 8 characters");
            return false;
        }

        // PHONE
        if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
            alert("Phone number must be exactly 10 digits");
            return false;
        }

        return true;
    };

    // SWITCH ACCOUNT TYPE
    const switchAccountType = (type) => {
        setAccountType(type);
        setCurrState("Login");

        setData({
            name: "",
            email: "",
            password: "",
            businessName: "",
            phone: "",
            city: "",
        });
    };

    // SWITCH LOGIN / SIGNUP
    const switchMode = (mode) => {
        setCurrState(mode);

        setData((prev) => ({
            ...prev,
            password: "",
        }));
    };

    // HEADING
    const heading =
        accountType === "customer"
            ? currState === "Login"
                ? "Welcome"
                : "Create your account"
            : currState === "Login"
            ? "Partner sign in"
            : "Register your restaurant";

    // SUBLINE
    const subline =
        accountType === "customer"
            ? currState === "Login"
                ? "Sign in to order, track deliveries, and save favourites."
                : "Join Tomato to order from kitchens near you."
            : currState === "Login"
            ? "Manage your menu, orders, and earnings."
            : "List your kitchen and start receiving orders.";

    // SUBMIT
    const onSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        // VALIDATION CHECK
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {

            // CUSTOMER
            if (accountType === "customer") {

                const endpoint =
                    currState === "Login"
                        ? `${url}/api/user/login`
                        : `${url}/api/user/register`;

                const payload =
                    currState === "Login"
                        ? {
                              email: data.email.trim(),
                              password: data.password,
                          }
                        : {
                              name: data.name.trim(),
                              email: data.email.trim(),
                              password: data.password,
                          };

                const response = await axios.post(endpoint, payload);

                if (response.data.success) {

                    setToken(response.data.token);

                    localStorage.setItem("token", response.data.token);

                    await fetchUserProfile(response.data.token);

                    setShowLogin(false);

                    navigate("/");

                } else {
                    alert(response.data.message || "Something went wrong");
                }

            } else {

                // RESTAURANT
                const endpoint =
                    currState === "Login"
                        ? `${url}/api/restaurant/login`
                        : `${url}/api/restaurant/register`;

                const payload =
                    currState === "Login"
                        ? {
                              email: data.email.trim(),
                              password: data.password,
                          }
                        : {
                              name: data.name.trim(),
                              email: data.email.trim(),
                              password: data.password,
                              businessName: data.businessName.trim(),
                              phone: data.phone.trim(),
                              city: data.city.trim(),
                          };

                const response = await axios.post(endpoint, payload);

                if (response.data.success) {

                    const partnerUrl =
                        `${getRestaurantAppOrigin()}/?handoff=${encodeURIComponent(response.data.token)}`;

                    window.location.assign(partnerUrl);

                } else {
                    alert(response.data.message || "Something went wrong");
                }
            }

        } catch (error) {

            console.log(error);

            alert("Could not reach server. Is the API running on port 4000?");

        } finally {

            setLoading(false);
        }
    };

    // ADMIN
    const openAdminPortal = () => {
        window.open(getAdminAppOrigin(), "_blank", "noopener,noreferrer");
    };

    return (
        <div className="login-popup">

            <div className="login-popup-backdrop" aria-hidden />

            <form onSubmit={onSubmit} className="login-popup-container">

                <div className="login-popup-title">

                    <div>
                        <p className="login-popup-brand">Tomato</p>
                        <h2>{heading}</h2>
                        <p className="login-popup-sub">{subline}</p>
                    </div>

                    {allowClose && (
                        <button
                            type="button"
                            className="login-popup-close"
                            aria-label="Close"
                            onClick={() => setShowLogin(false)}
                        >
                            <img src={assets.cross_icon} alt="" />
                        </button>
                    )}
                </div>

                {/* ROLE TOGGLE */}
                <div
                    className="login-popup-role-toggle"
                    role="tablist"
                    aria-label="Account type"
                >

                    <button
                        type="button"
                        role="tab"
                        aria-selected={accountType === "customer"}
                        className={accountType === "customer" ? "active" : ""}
                        onClick={() => switchAccountType("customer")}
                    >
                        Customer
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={accountType === "restaurant"}
                        className={accountType === "restaurant" ? "active" : ""}
                        onClick={() => switchAccountType("restaurant")}
                    >
                        Restaurant partner
                    </button>

                </div>

                {/* INPUTS */}
                <div className="login-popup-inputs">

                    {/* CUSTOMER SIGNUP */}
                    {accountType === "customer" &&
                        currState === "Sign Up" && (
                            <input
                                name="name"
                                onChange={onChangeHandler}
                                value={data.name}
                                type="text"
                                placeholder="Full name"
                                autoComplete="name"
                                maxLength={40}
                                required
                            />
                        )}

                    {/* RESTAURANT SIGNUP */}
                    {accountType === "restaurant" &&
                        currState === "Sign Up" && (
                            <>
                                <input
                                    name="name"
                                    onChange={onChangeHandler}
                                    value={data.name}
                                    type="text"
                                    placeholder="Your name"
                                    maxLength={40}
                                    required
                                />

                                <input
                                    name="businessName"
                                    onChange={onChangeHandler}
                                    value={data.businessName}
                                    type="text"
                                    placeholder="Restaurant / brand name"
                                    maxLength={60}
                                    required
                                />

                                <div className="login-popup-row">

                                    <input
                                        name="phone"
                                        onChange={onChangeHandler}
                                        value={data.phone}
                                        type="tel"
                                        placeholder="Phone"
                                        autoComplete="tel"
                                        maxLength={10}
                                    />

                                    <input
                                        name="city"
                                        onChange={onChangeHandler}
                                        value={data.city}
                                        type="text"
                                        placeholder="City"
                                        maxLength={30}
                                    />

                                </div>
                            </>
                        )}

                    {/* EMAIL */}
                    <input
                        name="email"
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        required
                    />

                    {/* PASSWORD */}
                    <input
                        name="password"
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder={
                            currState === "Sign Up"
                                ? "Password (min. 8 characters)"
                                : "Password"
                        }
                        autoComplete={
                            currState === "Sign Up"
                                ? "new-password"
                                : "current-password"
                        }
                        minLength={8}
                        required
                    />

                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    className="login-popup-submit"
                    disabled={loading}
                >
                    {loading
                        ? "Please wait..."
                        : currState === "Sign Up"
                        ? "Continue"
                        : "Sign in"}
                </button>

                {/* TERMS */}
                <div className="login-popup-condition">

                    <input type="checkbox" required id="terms-login" />

                    <label htmlFor="terms-login">
                        I agree to the terms of use and privacy policy.
                    </label>

                </div>

                {/* SWITCH */}
                <p className="login-popup-switch">

                    {currState === "Login" ? (
                        <>
                            New here?{" "}

                            <button
                                type="button"
                                className="linkish"
                                onClick={() => switchMode("Sign Up")}
                            >
                                Create an account
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}

                            <button
                                type="button"
                                className="linkish"
                                onClick={() => switchMode("Login")}
                            >
                                Sign in
                            </button>
                        </>
                    )}

                </p>

                {/* ADMIN */}
                <div className="login-popup-admin-row">

                    <span>Staff admin?</span>

                    <button
                        type="button"
                        className="login-popup-admin-link"
                        onClick={openAdminPortal}
                    >
                        Open admin console →
                    </button>

                </div>

            </form>
        </div>
    );
};

export default LoginPopup;