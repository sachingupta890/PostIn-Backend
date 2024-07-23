import dotenv from "dotenv"
dotenv.config();
import { dbConfig, serverConfig } from "../types/interfaces.js";


export const rootConfig = {
  db: {
    dbname: process.env.DBNAME || "PostInDatabase",
    url: process.env.MONGO_URL || "mongodb://localhost:27017",
  } as dbConfig,

  server: {
    port: process.env.PORT as string,
  } as serverConfig,
};

export const stripeConfig = {
  stripeKey: process.env.STRIPE_KEY || ""
}



