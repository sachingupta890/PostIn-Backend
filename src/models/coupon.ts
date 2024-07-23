import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        coupon: {
            type: String,
            required: [true, "Please provide the Coupon code"],
            unique:true,
        },
        amount: {
            type: Number,
            required: [true,'Please provide the discount amount']
        }
    }
) 


export const Coupon = mongoose.model('Coupon', schema);