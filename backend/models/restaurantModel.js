import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        businessName: { type: String, required: true },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        city: { type: String, default: "" },
    },
    { minimize: false, timestamps: true }
);

const restaurantModel =
    mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;
