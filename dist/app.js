import express from "express";
const app = express();
import { dbConnect } from "./db/dbconnect.js";
import { errorMiddleWare } from "./middlewares/error.js";
//improting routes
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
const port = 5000;
app.use(express.json());
//mounting the routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.listen(port, () => {
    console.log(`App is Running at http://localhost:${port}`);
});
app.use("/uploads", express.static("uploads"));
//for controlling errors
app.use(errorMiddleWare);
//connecting to the database 
dbConnect();
