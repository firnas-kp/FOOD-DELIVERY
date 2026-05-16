import mongoose from "mongoose";

export const ADMIN_ROLES = ["super_admin", "manager", "staff"];

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ADMIN_ROLES,
            default: "manager",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    { minimize: false, timestamps: true }
);

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
