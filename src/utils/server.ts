import express from "express"
import indexRoute from "../routes/index.js"
import { errorMiddleWare } from "../middlewares/error.js";
import morgan from "morgan";

function createServer() {
    const app = express();
    app.use(express.json());

    // Mounting the routes
    app.use("/api/v1", indexRoute);

    // Serve static files
    app.use("/uploads", express.static("uploads"));

    //use the morgan utility
    app.use(morgan("dev"));

    // Error handling middleware
    app.use(errorMiddleWare);

    return app;
}
export default createServer;