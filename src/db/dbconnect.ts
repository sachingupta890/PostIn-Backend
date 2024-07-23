import mongoose from "mongoose";
import { rootConfig } from "../config/envConfig.js";
import { logger } from "../winston/logger.js";

export const dbConnect = async () => {
  return mongoose
    .connect(rootConfig.db.url, {
      dbName: rootConfig.db.dbname,
    })
    .then((c) => {
      return c; 
    })
    .catch((err) => {
      logger.error(`Error in connecting to database ${err.message}`)
      throw err;
    });
};
