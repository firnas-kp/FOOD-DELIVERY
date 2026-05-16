import adminModel from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";

const createAdminToken = (id) => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET);
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.json({ success: false, message: "Admin account not found" });
        }
        if (admin.isActive === false) {
            return res.json({ success: false, message: "Account is locked. Contact super admin." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        admin.lastLoginAt = new Date();
        await admin.save();

        const token = createAdminToken(admin._id);
        const role = admin.role || "super_admin";
        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role,
                isActive: admin.isActive !== false,
                lastLoginAt: admin.lastLoginAt,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const registerAdmin = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const exists = await adminModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Admin already exists with this email" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const count = await adminModel.countDocuments();
        const role = count === 0 ? "super_admin" : "manager";

        const newAdmin = new adminModel({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const admin = await newAdmin.save();
        const token = createAdminToken(admin._id);
        res.json({
            success: true,
            token,
            admin: { name: admin.name, email: admin.email, role: admin.role },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getAdminMe = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.adminId).select("name email role isActive lastLoginAt createdAt");
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }
        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role || "super_admin",
                isActive: admin.isActive !== false,
                lastLoginAt: admin.lastLoginAt,
                createdAt: admin.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const inviteAdmin = async (req, res) => {
    const { name, password, email, role } = req.body;
    try {
        if (!["staff", "manager"].includes(role)) {
            return res.json({
                success: false,
                message: "Role must be staff or manager",
            });
        }

        const exists = await adminModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Admin already exists with this email" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (!name || password.length < 8) {
            return res.json({
                success: false,
                message: "Name required and password must be at least 8 characters",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new adminModel({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const admin = await newAdmin.save();
        res.json({
            success: true,
            message: "Team member created",
            admin: { name: admin.name, email: admin.email, role: admin.role },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const listAdmins = async (_req, res) => {
    try {
        const admins = await adminModel
            .find({})
            .select("name email role isActive createdAt lastLoginAt")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: admins });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateAdminRole = async (req, res) => {
    const { adminId, role } = req.body;
    try {
        if (!["manager", "staff"].includes(role)) {
            return res.json({ success: false, message: "Role must be manager or staff" });
        }
        const admin = await adminModel.findById(adminId);
        if (!admin) return res.json({ success: false, message: "Admin not found" });
        if ((admin.role || "super_admin") === "super_admin") {
            return res.json({ success: false, message: "Super admin role cannot be changed" });
        }
        admin.role = role;
        await admin.save();
        res.json({ success: true, message: "Role updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const toggleAdminLock = async (req, res) => {
    const { adminId, isActive } = req.body;
    try {
        if (!adminId) return res.json({ success: false, message: "Admin id required" });
        if (String(req.adminId) === String(adminId)) {
            return res.json({ success: false, message: "You cannot lock your own account" });
        }
        const admin = await adminModel.findById(adminId);
        if (!admin) return res.json({ success: false, message: "Admin not found" });
        if ((admin.role || "super_admin") === "super_admin") {
            return res.json({ success: false, message: "Super admin account cannot be locked" });
        }
        admin.isActive = Boolean(isActive);
        await admin.save();
        res.json({ success: true, message: admin.isActive ? "Account unlocked" : "Account locked" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getDashboardStats = async (_req, res) => {
    try {
        const [totalOrders, pendingOrders, deliveredOrders, totalRevenueAgg, totalFoods, outOfStockFoods, totalAdmins, lockedAdmins, recentOrders] =
            await Promise.all([
                orderModel.countDocuments({}),
                orderModel.countDocuments({ status: { $ne: "Delivered" } }),
                orderModel.countDocuments({ status: "Delivered" }),
                orderModel.aggregate([{ $match: { payment: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
                foodModel.countDocuments({}),
                foodModel.countDocuments({ inStock: false }),
                adminModel.countDocuments({}),
                adminModel.countDocuments({ isActive: false }),
                orderModel.find({}).sort({ date: -1 }).limit(6),
            ]);

        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        res.json({
            success: true,
            data: {
                kpis: {
                    totalOrders,
                    pendingOrders,
                    deliveredOrders,
                    totalRevenue,
                    totalFoods,
                    outOfStockFoods,
                    totalAdmins,
                    lockedAdmins,
                },
                recentOrders,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export {
    loginAdmin,
    registerAdmin,
    getAdminMe,
    inviteAdmin,
    listAdmins,
    updateAdminRole,
    toggleAdminLock,
    getDashboardStats,
};
