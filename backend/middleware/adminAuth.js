import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

const adminAuth = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "Admin login required" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.json({ success: false, message: "Not authorized as admin" });
        }
        const admin = await adminModel.findById(decoded.id).select("name email role isActive");
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }
        if (admin.isActive === false) {
            return res.json({ success: false, message: "Account is locked. Contact super admin." });
        }
        req.adminId = decoded.id;
        req.adminRole = admin.role || "super_admin";
        req.adminName = admin.name;
        req.adminEmail = admin.email;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid or expired token" });
    }
};

export default adminAuth;
