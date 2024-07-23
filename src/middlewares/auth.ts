import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";
import { logger } from "../winston/logger.js";

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query;

    if (!id) {
      throw new ErrorHandler("Provide the Admin Id First", 401);
    }

    const user = await User.findById(id);

    if (!user) {
      throw new ErrorHandler("No person found with the provided id", 401);
    }

    if (user.role !== "admin") {
      throw new ErrorHandler("This is a protected route for Admins only", 403);
    }

    next();
  } catch (error: any) {
    logger.error(`Error in adminOnly middleware: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};
