import express from "express"
import authMiddleware from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"
import requireAdminRole from "../middleware/requireAdminRole.js"
import { placeOrder, verifyOrder,userOrders,listOrders,updateStatus } from "../controllers/orderController.js"

const orderRouter = express.Router();

const orderStaff = [adminAuth, requireAdminRole("super_admin", "manager", "staff")];

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.get("/list", ...orderStaff, listOrders);
orderRouter.post("/status", ...orderStaff, updateStatus);

export default orderRouter;