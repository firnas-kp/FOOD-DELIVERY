import express from "express";
import { addFood,listFood,removeFood,updateFoodAvailability,updateFood } from "../controllers/foodController.js";
import multer from "multer";
import adminAuth from "../middleware/adminAuth.js";
import requireAdminRole from "../middleware/requireAdminRole.js";

const foodRouter = express.Router();

const foodManagers = [adminAuth, requireAdminRole("super_admin", "manager")];

//Image Storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req,file,cb)=> {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})

foodRouter.post("/add", ...foodManagers, upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", ...foodManagers, removeFood);
foodRouter.post("/availability", ...foodManagers, updateFoodAvailability);
foodRouter.post("/update", ...foodManagers, updateFood);



export default foodRouter;