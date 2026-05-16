import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name:{type:String,required:true},
    description: {type:String,required:true},
    price: {type:Number,required:true},
    image: {type:String,required:true},
    category: {type:String,required:true},
    inStock: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: false },
    prepTimeMins: { type: Number, default: 20, min: 1 },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", default: null },
    restaurantName: { type: String, default: "" },
})

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;