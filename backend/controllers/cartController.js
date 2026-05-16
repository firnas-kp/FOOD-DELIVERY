import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"

//add item to usr cart
const addToCart = async (req,res) => {
    try {
        const food = await foodModel.findById(req.body.itemId);
        if (!food) {
            return res.json({ success: false, message: "Item not found" });
        }
        if (food.inStock === false) {
            return res.json({ success: false, message: "This dish is currently unavailable" });
        }

        // Kitchen key for enforcing "one restaurant per order" cart rule.
        // - partner dishes: use restaurantId
        // - platform / house dishes: use a shared __platform__ key
        const newKey = food.restaurantId ? String(food.restaurantId) : "__platform__";

        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        let cartData = userData.cartData || {};
        for (const key of Object.keys(cartData || {})) {
            const qty = cartData[key];
            if (!qty || qty <= 0) continue;
            const other = await foodModel.findById(key);
            if (!other) continue;
            const otherKey = other.restaurantId ? String(other.restaurantId) : "__platform__";
            if (otherKey !== newKey) {
                return res.json({
                    success: false,
                    message:
                        "Your cart has dishes from another kitchen. Finish or clear that order before adding from a different restaurant.",
                });
            }
        }

        if(!cartData[req.body.itemId])
        {
            cartData[req.body.itemId] = 1
        }
        else{
            cartData[req.body.itemId]  += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Added To Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

// remove items fromm  user cart
const removeFromCart = async (req,res) => {
    try{
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        let cartData = userData.cartData || {};
        if (cartData[req.body.itemId]>0) {
            cartData[req.body.itemId] -= 1;
            
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Removed From Cart"})
    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

//fetch user cart data
const getCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export{addToCart,removeFromCart,getCart}
