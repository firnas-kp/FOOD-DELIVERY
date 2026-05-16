import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String, default: "" },
        discountType: { type: String, enum: ["percent", "flat"], required: true, default: "percent" },
        discountValue: { type: Number, required: true, min: 1 },
        minOrderAmount: { type: Number, default: 0, min: 0 },
        maxDiscount: { type: Number, default: 0, min: 0 },
        usageLimit: { type: Number, default: 0, min: 0 },
        usedCount: { type: Number, default: 0, min: 0 },
        startsAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);
export default couponModel;
