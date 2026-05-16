import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"
import Stripe from "stripe"
import { consumeCouponUsage } from "./couponController.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//placing user order for frontnd
const placeOrder = async (req,res) => {

    const frontend_url = "http://localhost:5173";

    try {
        let basketRestaurantKey = null;
        let orderRestaurantId = null;

        for (const line of req.body.items || []) {
            const fid = line._id || line.id;
            if (!fid) continue;
            const food = await foodModel.findById(fid);
            if (!food) {
                return res.json({ success: false, message: `Item no longer on menu: ${line.name || fid}` });
            }
            if (food.inStock === false) {
                return res.json({
                    success: false,
                    message: `"${food.name}" is currently unavailable. Remove it from your cart and try again.`,
                });
            }
            const lineKey = food.restaurantId ? String(food.restaurantId) : "__platform__";
            if (basketRestaurantKey === null) {
                basketRestaurantKey = lineKey;
                orderRestaurantId = food.restaurantId || null;
            } else if (lineKey !== basketRestaurantKey) {
                return res.json({
                    success: false,
                    message: "Your cart mixes items from different restaurants. Keep one restaurant per order.",
                });
            }
        }

        let finalAmount = Number(req.body.amount || 0);
        let couponMeta = null;
        const baseWithoutCoupon = Number(req.body.baseAmount || finalAmount);
        if (req.body.couponCode) {
            const couponUse = await consumeCouponUsage(req.body.couponCode, baseWithoutCoupon);
            if (!couponUse.ok) {
                return res.json({ success: false, message: couponUse.message });
            }
            finalAmount = Number((baseWithoutCoupon - couponUse.discount + 2).toFixed(2));
            couponMeta = { code: couponUse.code, discount: couponUse.discount };
        }

        const newOrder = new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:finalAmount,
            address:req.body.address,
            coupon: couponMeta,
            restaurantId: orderRestaurantId
                ? new mongoose.Types.ObjectId(String(orderRestaurantId))
                : null,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

        const subtotal = req.body.items.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0), 0);
        const discountRatio = couponMeta?.discount && subtotal > 0 ? Math.max(0, (subtotal - couponMeta.discount) / subtotal) : 1;

        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.name
                },
                unit_amount:Math.max(1, Math.round(Number(item.price || 0) * discountRatio * 100 * 80))
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:"inr",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:2*100*80
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({success:true,session_url:session.url})
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
        
    }
}

const verifyOrder = async (req,res)=> {
    const {orderId,success} = req.body;
    try {
        if (success=="true") {
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

// user order for frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// Listing orders for admin panel
const listOrders = async (req,res)=> {
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// api for updating order status
const updateStatus = async (req,res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }

}

export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}