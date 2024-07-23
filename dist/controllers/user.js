import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
export const newUser = async (req, res, next) => {
    try {
        const { name, email, photo, gender, _id, dob } = req.body;
        let user = await User.findById(_id);
        if (user) {
            return res.status(200).json({
                success: true,
                message: `Welcome ${user.name}`,
            });
        }
        if (!_id || !name || !photo || !gender || !dob) {
            throw new ErrorHandler("Please provide all the fields", 400);
        }
        user = await User.create({
            name,
            email,
            photo,
            gender,
            _id,
            dob: new Date(dob),
        });
        return res.status(201).json({
            success: true,
            message: `Welcome ${user.name}`,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ErrorHandler("Provide the Id First", 401);
        }
        const user = await User.findById(id);
        if (!user) {
            throw new ErrorHandler("No User found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user,
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id)
            throw new ErrorHandler("Id not found", 404);
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new ErrorHandler("No User to delete", 404);
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user,
        });
    }
    catch (error) {
        next(error);
    }
};
