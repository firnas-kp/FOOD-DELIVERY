import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import fs from "fs";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const createRestaurantToken = (id) => {
    return jwt.sign({ id, role: "restaurant" }, process.env.JWT_SECRET);
};

const parseBool = (v, defaultVal = true) => {
    if (v === undefined || v === null || v === "") return defaultVal;
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase();
    if (s === "true" || s === "1" || s === "on" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "off" || s === "no") return false;
    return defaultVal;
};

const parseNumber = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
};

const registerRestaurant = async (req, res) => {
    const { name, password, email, businessName, phone, address, city } = req.body;
    try {
        const exists = await restaurantModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Account already exists with this email" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }
        if (!businessName || String(businessName).trim().length < 2) {
            return res.json({ success: false, message: "Business name is required" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doc = new restaurantModel({
            name,
            email,
            password: hashedPassword,
            businessName: String(businessName).trim(),
            phone: phone || "",
            address: address || "",
            city: city || "",
        });
        const saved = await doc.save();
        const token = createRestaurantToken(saved._id);
        res.json({
            success: true,
            token,
            restaurant: {
                id: saved._id,
                name: saved.name,
                email: saved.email,
                businessName: saved.businessName,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const loginRestaurant = async (req, res) => {
    const { email, password } = req.body;
    try {
        const restaurant = await restaurantModel.findOne({ email });
        if (!restaurant) {
            return res.json({ success: false, message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, restaurant.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }
        const token = createRestaurantToken(restaurant._id);
        res.json({
            success: true,
            token,
            restaurant: {
                id: restaurant._id,
                name: restaurant.name,
                email: restaurant.email,
                businessName: restaurant.businessName,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getRestaurantMe = async (req, res) => {
    try {
        const r = await restaurantModel
            .findById(req.restaurantId)
            .select("name email businessName phone address city createdAt");
        if (!r) return res.json({ success: false, message: "Not found" });
        res.json({
            success: true,
            restaurant: {
                id: r._id,
                name: r.name,
                email: r.email,
                businessName: r.businessName,
                phone: r.phone,
                address: r.address,
                city: r.city,
                createdAt: r.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const addFood = async (req, res) => {
    try {
        const rest = await restaurantModel.findById(req.restaurantId);
        if (!rest) return res.json({ success: false, message: "Restaurant not found" });

        const image_filename = `${req.file.filename}`;
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            image: image_filename,
            inStock: parseBool(req.body.inStock, true),
            isVegetarian: parseBool(req.body.isVegetarian, false),
            prepTimeMins: parseNumber(req.body.prepTimeMins, 20),
            restaurantId: req.restaurantId,
            restaurantName: rest.businessName || rest.name,
        });
        await food.save();
        res.json({ success: true, message: "Dish added to your menu" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error while adding dish" });
    }
};

const listMyFoods = async (req, res) => {
    try {
        const foods = await foodModel.find({ restaurantId: req.restaurantId }).sort({ createdAt: -1 });
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findOne({ _id: req.body.id, restaurantId: req.restaurantId });
        if (!food) {
            return res.json({ success: false, message: "Dish not found" });
        }
        fs.unlink(`uploads/${food.image}`, () => {});
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Dish removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateFoodAvailability = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        if (!id) return res.json({ success: false, message: "Food id required" });
        const food = await foodModel.findOneAndUpdate(
            { _id: id, restaurantId: req.restaurantId },
            { inStock: parseBool(inStock, true) },
            { new: true }
        );
        if (!food) return res.json({ success: false, message: "Dish not found" });
        res.json({
            success: true,
            message: food.inStock ? "Marked as available" : "Marked as unavailable",
            data: food,
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category, inStock, isVegetarian, prepTimeMins } = req.body;
        if (!id) return res.json({ success: false, message: "Food id required" });
        const existing = await foodModel.findOne({ _id: id, restaurantId: req.restaurantId });
        if (!existing) return res.json({ success: false, message: "Dish not found" });

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = Number(price);
        if (category !== undefined) updates.category = category;
        if (inStock !== undefined) updates.inStock = parseBool(inStock, true);
        if (isVegetarian !== undefined) updates.isVegetarian = parseBool(isVegetarian, false);
        if (prepTimeMins !== undefined) updates.prepTimeMins = parseNumber(prepTimeMins, 20);

        const food = await foodModel.findByIdAndUpdate(id, updates, { new: true });
        res.json({ success: true, message: "Dish updated", data: food });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const listMyOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ restaurantId: req.restaurantId })
            .sort({ date: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateMyOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.json({ success: false, message: "orderId and status required" });
        }
        const allowed = ["Food Processing", "Out for delivery", "Delivered"];
        if (!allowed.includes(status)) {
            return res.json({ success: false, message: "Invalid status" });
        }
        const order = await orderModel.findOne({ _id: orderId, restaurantId: req.restaurantId });
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getDashboard = async (req, res) => {
    try {
        const rid = req.restaurantId;
        const [totalFoods, outOfStock, totalOrders, pending, delivered, paidAgg] = await Promise.all([
            foodModel.countDocuments({ restaurantId: rid }),
            foodModel.countDocuments({ restaurantId: rid, inStock: false }),
            orderModel.countDocuments({ restaurantId: rid }),
            orderModel.countDocuments({ restaurantId: rid, status: { $ne: "Delivered" } }),
            orderModel.countDocuments({ restaurantId: rid, status: "Delivered" }),
            orderModel.aggregate([
                { $match: { restaurantId: rid, payment: true } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);
        const totalRevenue = paidAgg[0]?.total || 0;
        const recentOrders = await orderModel.find({ restaurantId: rid }).sort({ date: -1 }).limit(5);
        res.json({
            success: true,
            data: {
                kpis: { totalFoods, outOfStock, totalOrders, pending, delivered, totalRevenue },
                recentOrders,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getEarnings = async (req, res) => {
    try {
        const rid = req.restaurantId;
        const [byStatus, monthly] = await Promise.all([
            orderModel.aggregate([
                { $match: { restaurantId: rid, payment: true } },
                { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
            ]),
            orderModel.aggregate([
                { $match: { restaurantId: rid, payment: true } },
                {
                    $group: {
                        _id: { y: { $year: "$date" }, m: { $month: "$date" } },
                        amount: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.y": -1, "_id.m": -1 } },
                { $limit: 12 },
            ]),
        ]);
        res.json({ success: true, data: { byStatus, monthly } });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export {
    registerRestaurant,
    loginRestaurant,
    getRestaurantMe,
    addFood,
    listMyFoods,
    removeFood,
    updateFoodAvailability,
    updateFood,
    listMyOrders,
    updateMyOrderStatus,
    getDashboard,
    getEarnings,
};
