import express from "express";
import {
    listCoupons,
    createCoupon,
    updateCoupon,
    removeCoupon,
    validateCoupon,
} from "../controllers/couponController.js";
import adminAuth from "../middleware/adminAuth.js";
import requireAdminRole from "../middleware/requireAdminRole.js";
import { publicCoupons } from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.post("/validate", validateCoupon);
couponRouter.get("/list", adminAuth, requireAdminRole("super_admin", "manager"), listCoupons);
couponRouter.post("/create", adminAuth, requireAdminRole("super_admin", "manager"), createCoupon);
couponRouter.post("/update", adminAuth, requireAdminRole("super_admin", "manager"), updateCoupon);
couponRouter.post("/remove", adminAuth, requireAdminRole("super_admin", "manager"), removeCoupon);
couponRouter.get("/public", publicCoupons);

export default couponRouter;
