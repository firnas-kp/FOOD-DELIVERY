// import mongooose from "mongoose";

// export const connectDB = async () => {
//     await mongooose.connect('mongodb+srv://firnas:89431434@cluster0.yhgze11.mongodb.net/food-del').then(()=>console.log("DB Connected"));   
// }
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("DB Connected");
    } catch (error) {
        console.log(error);
    }
};