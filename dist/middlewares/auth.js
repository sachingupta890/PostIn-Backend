import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";
export const adminOnly = async (req, res, next) => {
    try {
        const { id } = req.query;
        if (!id) {
            return next(new ErrorHandler("Provide the Id First", 402));
        }
        const user = await User.findById(id);
        if (!user) {
            return next(new ErrorHandler("No Person is Present with the id", 404));
        }
        if (user.role != "admin") {
            return next(new ErrorHandler("this is the Protected route for Admin,", 403));
        }
        next();
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
