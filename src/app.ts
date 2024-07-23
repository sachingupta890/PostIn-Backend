import dotenv from "dotenv";
import NodeCache from "node-cache";
import Stripe from "stripe";
import { dbConnect } from "./db/dbconnect.js";
import { rootConfig, stripeConfig } from "./config/envConfig.js";
import { logger } from "./winston/logger.js";
import createServer from "./utils/server.js";


// Load environment variables
dotenv.config();

const app = createServer();
const port = rootConfig.server.port || 5000;
const stripeKey = stripeConfig.stripeKey;

// Connect to the database
(async () => {
  try {
    await dbConnect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with an error code
  }
})();

export const stripe = new Stripe(stripeKey)

// Middleware to parse JSON
// app.use(express.json());

// // Mounting the routes
// app.use("/api/v1", indexRoute);

// // Serve static files
// app.use("/uploads", express.static("uploads"));

// //use the morgan utility
// app.use(morgan("dev"))

// // Error handling middleware
// app.use(errorMiddleWare);

// Initialize Nodecache
export const nodeCache = new NodeCache();

app.get("/", (req, res) => {
  res.send("Cheking -----")
})

// Start the server
app.listen(port, () => {
  logger.info(`App is running at http://localhost:${port}`);
});

export {app}