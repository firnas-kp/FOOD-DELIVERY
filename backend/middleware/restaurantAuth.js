import jwt from "jsonwebtoken";
import restaurantModel from "../models/restaurantModel.js";

const restaurantAuth = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "Restaurant login required" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "restaurant") {
            return res.json({ success: false, message: "Not authorized as restaurant" });
        }
        const restaurant = await restaurantModel.findById(decoded.id).select("name email businessName");
        if (!restaurant) {
            return res.json({ success: false, message: "Restaurant not found" });
        }
        req.restaurantId = decoded.id;
        req.restaurant = restaurant;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid or expired token" });
    }
};

export default restaurantAuth;
