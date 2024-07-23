import { NextFunction, Request, Response } from "express";
import { Coupon } from "../models/coupon.js";
import { NewCouponBody } from "../types/types.js";
import { logger } from "../winston/logger.js";
import ErrorHandler from "../utils/utility-class.js";
import { stripe } from "../app.js";

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
     const { amount } = req.body;

     if (!amount) return next(new ErrorHandler("Please enter amount", 400));

     const paymentIntent = await stripe.paymentIntents.create({
       amount: Number(amount) * 100,
       currency: "inr",
     });

     return res.status(201).json({
       success: true,
       clientSecret: paymentIntent.client_secret,
     });
  } catch (err: any) {
    logger.error(`Error in creating new Payment intent : ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
}

export const newCoupon = async (req: Request<{},{},NewCouponBody>, res: Response, next: NextFunction) => {
    try {

        const { coupon, amount } = req.body;

        if (!coupon || !amount) {
            return next(new ErrorHandler("Please provide both coupon and amount",400))
        }
        
        await Coupon.create({ coupon, amount });

        return res.status(201).json({
            success: true,
            message:`Coupon ${coupon} Creayed successfully `
        })
        
    } catch (err: any) {
        logger.error(`Error in  newCoupon : ${err.message}`, {
          stack: err.stack,
        });
        next(err);
    }
}


export const applyDiscount = async (
  req:Request,
  res: Response,
  next: NextFunction
) => {
    try {
      
        const { coupon } = req.query;

        const discount = await Coupon.findOne({ coupon });

        if (!discount) {
            return next(new ErrorHandler("Invalid coupon ",401))
        }


    return res.status(200).json({
      success: true,
      discount:discount.amount,
    });
      
  } catch (err: any) {
    logger.error(`Error in  applying discount : ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
};

export const allCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find();

    return res.status(200).json({
      status: true,
      coupons,
    })
    
  } catch (err: any) {
    logger.error(`Error in Fetching all coupons :${err.message}`, {
      stack:err.stack
    });
    next(err);
  }
}

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler("Please provide the id first", 400));
    }

    const coupon = await Coupon.findOneAndDelete({ id });

    if (!coupon) {
      return next(new ErrorHandler("Invalid Id",400))
    }
    
    return res.status(200).json({
      success: true,
      message: "Coupon deleted Successfully",
      coupon
    })
    
  } catch (err: any) {
     logger.error(`Error in Fetching all coupons :${err.message}`, {
       stack: err.stack,
     });
     next(err);
  }
}