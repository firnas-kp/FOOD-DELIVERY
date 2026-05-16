import express from "express";
import multer from "multer";
import restaurantAuth from "../middleware/restaurantAuth.js";
import {
    registerRestaurant,
    loginRestaurant,
    getRestaurantMe,
    addFood,
    listMyFoods,
    removeFood,
    updateFoodAvailability,
    updateFood,
    listMyOrders,
    updateMyOrderStatus,
    getDashboard,
    getEarnings,
} from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    },
});
const upload = multer({ storage });

restaurantRouter.post("/register", registerRestaurant);
restaurantRouter.post("/login", loginRestaurant);
restaurantRouter.get("/me", restaurantAuth, getRestaurantMe);
restaurantRouter.get("/dashboard", restaurantAuth, getDashboard);
restaurantRouter.get("/earnings", restaurantAuth, getEarnings);

restaurantRouter.post("/food/add", restaurantAuth, upload.single("image"), addFood);
restaurantRouter.get("/food/list", restaurantAuth, listMyFoods);
restaurantRouter.post("/food/remove", restaurantAuth, removeFood);
restaurantRouter.post("/food/availability", restaurantAuth, updateFoodAvailability);
restaurantRouter.post("/food/update", restaurantAuth, updateFood);

restaurantRouter.get("/orders/list", restaurantAuth, listMyOrders);
restaurantRouter.post("/orders/status", restaurantAuth, updateMyOrderStatus);

export default restaurantRouter;
