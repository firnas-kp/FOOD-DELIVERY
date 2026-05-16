import express from "express";
import {
    loginAdmin,
    registerAdmin,
    getAdminMe,
    inviteAdmin,
    listAdmins,
    updateAdminRole,
    toggleAdminLock,
    getDashboardStats,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import requireAdminRole from "../middleware/requireAdminRole.js";

const adminRouter = express.Router();

adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/me", adminAuth, getAdminMe);
adminRouter.get("/dashboard", adminAuth, requireAdminRole("super_admin", "manager", "staff"), getDashboardStats);
adminRouter.get("/team", adminAuth, requireAdminRole("super_admin"), listAdmins);
adminRouter.post("/invite", adminAuth, requireAdminRole("super_admin"), inviteAdmin);
adminRouter.post("/team/role", adminAuth, requireAdminRole("super_admin"), updateAdminRole);
adminRouter.post("/team/lock", adminAuth, requireAdminRole("super_admin"), toggleAdminLock);

export default adminRouter;
