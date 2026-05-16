import foodModel from "../models/foodModel.js";
import fs from 'fs'

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

//add food item

const addFood = async (req,res) => {

    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name:req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        category: req.body.category,
        image: image_filename,
        inStock: parseBool(req.body.inStock, true),
        isVegetarian: parseBool(req.body.isVegetarian, false),
        prepTimeMins: parseNumber(req.body.prepTimeMins, 20),
    })

    try{
        await food.save();
        res.json({success:true,message:"Food Added"})
    }catch(error){
        console.log(error)
        res.json({success:false,message:"Error while adding food"})
        
    }
}

// all food list
const listFood = async (req,res) => {
    try{
        const foods = await foodModel.find({});
        res.json({success:true,data:foods})
    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

// remove foof item
const removeFood = async (req,res) => {
    try{
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Food Removed"})

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

const updateFoodAvailability = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        if (!id) {
            return res.json({ success: false, message: "Food id required" });
        }
        const food = await foodModel.findByIdAndUpdate(
            id,
            { inStock: parseBool(inStock, true) },
            { new: true }
        );
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }
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
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = Number(price);
        if (category !== undefined) updates.category = category;
        if (inStock !== undefined) updates.inStock = parseBool(inStock, true);
        if (isVegetarian !== undefined) updates.isVegetarian = parseBool(isVegetarian, false);
        if (prepTimeMins !== undefined) updates.prepTimeMins = parseNumber(prepTimeMins, 20);
        const food = await foodModel.findByIdAndUpdate(id, updates, { new: true });
        if (!food) return res.json({ success: false, message: "Food not found" });
        res.json({ success: true, message: "Food item updated", data: food });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export {addFood,listFood,removeFood,updateFoodAvailability,updateFood}
