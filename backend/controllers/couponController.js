import couponModel from "../models/couponModel.js";

const normalizeCode = (code = "") => String(code).trim().toUpperCase();

const computeDiscount = (coupon, amount) => {
    if (coupon.discountType === "percent") {
        const raw = (amount * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0) return Math.min(raw, coupon.maxDiscount);
        return raw;
    }
    return Math.min(coupon.discountValue, amount);
};

const validateCouponCommon = (coupon, amount) => {
    const now = new Date();
    if (!coupon || coupon.isActive === false) return { ok: false, message: "Coupon not active" };
    if (coupon.startsAt && now < new Date(coupon.startsAt)) return { ok: false, message: "Coupon not started yet" };
    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) return { ok: false, message: "Coupon expired" };
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return { ok: false, message: "Coupon usage limit reached" };
    }
    if (amount < coupon.minOrderAmount) {
        return { ok: false, message: `Minimum order amount is ${coupon.minOrderAmount}` };
    }
    const discount = Number(computeDiscount(coupon, amount).toFixed(2));
    if (discount <= 0) return { ok: false, message: "Invalid coupon amount" };
    return { ok: true, discount };
};

const listCoupons = async (_req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const createCoupon = async (req, res) => {
    try {
        const payload = {
            code: normalizeCode(req.body.code),
            description: req.body.description || "",
            discountType: req.body.discountType || "percent",
            discountValue: Number(req.body.discountValue || 0),
            minOrderAmount: Number(req.body.minOrderAmount || 0),
            maxDiscount: Number(req.body.maxDiscount || 0),
            usageLimit: Number(req.body.usageLimit || 0),
            startsAt: req.body.startsAt || null,
            expiresAt: req.body.expiresAt || null,
            isActive: req.body.isActive !== false,
        };
        if (!payload.code) return res.json({ success: false, message: "Coupon code required" });
        if (!["percent", "flat"].includes(payload.discountType)) {
            return res.json({ success: false, message: "Discount type invalid" });
        }
        if (payload.discountValue <= 0) return res.json({ success: false, message: "Discount value must be positive" });
        const exists = await couponModel.findOne({ code: payload.code });
        if (exists) return res.json({ success: false, message: "Coupon already exists" });
        const coupon = await couponModel.create(payload);
        res.json({ success: true, message: "Coupon created", data: coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateCoupon = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.json({ success: false, message: "Coupon id required" });
        const updates = { ...req.body };
        delete updates.id;
        if (updates.code) updates.code = normalizeCode(updates.code);
        if (updates.discountValue !== undefined) updates.discountValue = Number(updates.discountValue || 0);
        if (updates.minOrderAmount !== undefined) updates.minOrderAmount = Number(updates.minOrderAmount || 0);
        if (updates.maxDiscount !== undefined) updates.maxDiscount = Number(updates.maxDiscount || 0);
        if (updates.usageLimit !== undefined) updates.usageLimit = Number(updates.usageLimit || 0);
        const coupon = await couponModel.findByIdAndUpdate(id, updates, { new: true });
        if (!coupon) return res.json({ success: false, message: "Coupon not found" });
        res.json({ success: true, message: "Coupon updated", data: coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const removeCoupon = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.json({ success: false, message: "Coupon id required" });
        await couponModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Coupon deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const code = normalizeCode(req.body.code);
        const amount = Number(req.body.amount || 0);
        if (!code) return res.json({ success: false, message: "Coupon code required" });
        if (amount <= 0) return res.json({ success: false, message: "Amount must be greater than 0" });
        const coupon = await couponModel.findOne({ code });
        if (!coupon) return res.json({ success: false, message: "Coupon not found" });
        const check = validateCouponCommon(coupon, amount);
        if (!check.ok) return res.json({ success: false, message: check.message });
        res.json({
            success: true,
            data: {
                couponId: coupon._id,
                code: coupon.code,
                discount: check.discount,
                finalAmount: Number((amount - check.discount).toFixed(2)),
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const consumeCouponUsage = async (code, amount) => {
    if (!code) return { ok: true, discount: 0 };
    const coupon = await couponModel.findOne({ code: normalizeCode(code) });
    if (!coupon) return { ok: false, message: "Coupon not found" };
    const check = validateCouponCommon(coupon, amount);
    if (!check.ok) return { ok: false, message: check.message };
    coupon.usedCount += 1;
    await coupon.save();
    return { ok: true, discount: check.discount, code: coupon.code };
};
const publicCoupons = async (_req, res) => {
    try {
        const now = new Date();

        const coupons = await couponModel.find({
            isActive: true,
            $or: [
                { startsAt: null },
                { startsAt: { $lte: now } }
            ],
            $and: [
                {
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gte: now } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });

        res.json({ success: true, data: coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { listCoupons, createCoupon, updateCoupon, removeCoupon, validateCoupon, consumeCouponUsage, publicCoupons };
