import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document{
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "user" | "admin";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    //virtual  Attribute 
    age: Number;

}

const schema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required:[true,"Please enter Id"]
        },
        name: {
            type: String,
            required:[true,"Please enter Name"]
        },
        email: {
            type: String,
            required: [true, "Please enter Email"],
            unique: [true, "Email Already exists"],
            validate:validator.default.isEmail
        },
        photo: {
            type: String,
            required:[true,"Please add Photo"]
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default:"user"
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            required:[true,"Please enter gender"]
        },
        dob: {
            type: Date,
            required:[true,"Please Enter Your date of birth"]
        }
    },
    {
        timestamps:true
    }
)

schema.virtual("age").get(function () {

    const today = new Date();
    const dob = this.dob;

    let age = today.getFullYear() - dob.getFullYear();

    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
})



export const User = mongoose.model<IUser>("User", schema)


