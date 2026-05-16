/**
 * Use after adminAuth. Allows only listed admin roles (from DB via adminAuth).
 */
const requireAdminRole = (...allowedRoles) => (req, res, next) => {
    if (!req.adminRole) {
        return res.json({ success: false, message: "Admin role missing" });
    }
    if (!allowedRoles.includes(req.adminRole)) {
        return res.json({
            success: false,
            message: "You do not have permission to perform this action",
        });
    }
    next();
};

export default requireAdminRole;
