import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.js";
import { rm } from "fs";
// import {faker} from "@faker-js/faker"
export const newProduct = async (req, res, next) => {
    try {
        const { name, category, price, stock } = req.body;
        const photo = req.file;
        if (!photo) {
            return next(new ErrorHandler("Please Add photo", 401));
        }
        if (!name || !price || !category || !stock) {
            //manually need to delete photo
            rm(photo.path, () => {
                console.log("File Deleted");
            });
            return next(new ErrorHandler("Please Enter all Fields", 401));
        }
        const product = await Product.create({
            name,
            category: category.toLowerCase(),
            price,
            stock,
            photo: photo.path,
        });
        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product,
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
export const getLatestProduct = async (req, res, next) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        return res.status(200).json({
            success: true,
            message: "Latest products Fetched Successfully",
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct("category");
        return res.status(200).json({
            success: true,
            message: "All categories Fetched Successfully",
            categories,
        });
    }
    catch (err) {
        next(new ErrorHandler());
    }
};
export const getAdminProduct = async (req, res, next) => {
    try {
        const products = await Product.find({});
        return res.status(200).json({
            success: true,
            message: "All products Fetched Successfully",
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
export const getSingleProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        return res.status(200).json({
            success: true,
            message: "Your Product Fetched Successfully",
            product,
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock } = req.body;
        const photo = req.file;
        let product = await Product.findById(id);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        if (photo) {
            //first delete the previous photo
            rm(product.photo, () => {
                console.log("Old Photo Deleted");
            });
            //add new photo
            product.photo = photo.path;
        }
        if (name)
            product.name = name;
        if (stock)
            product.stock = stock;
        if (price)
            product.price = price;
        if (category)
            product.category = category;
        const updatedProduct = await product.save();
        return res.status(201).json({
            success: true,
            message: "Product Updated Successfully",
            updatedProduct,
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        rm(product.photo, () => {
            console.log("Product Photo Deleted");
        });
        const deleteResult = await Product.deleteOne();
        return res.status(200).json({
            success: true,
            message: "product deleted Successfully",
            deleteResult,
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
export const getFilteredProduct = async (req, res, next) => {
    try {
        const { search, price, sort, category } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;
        const baseQuery = {};
        if (search) {
            baseQuery.name = {
                $regex: search,
                $options: "i"
            };
        }
        if (price) {
            baseQuery.price = {
                $lte: Number(price)
            };
        }
        if (category) {
            baseQuery.category = category;
        }
        const products = await Product.find(baseQuery).sort(sort && { price: sort === "asc" ? 1 : -1 }).limit(limit).skip(skip);
        const filteredOnlyProduct = await Product.find(baseQuery);
        // console.log(filteredOnlyProduct.length,"-------",limit)
        const totalPages = Math.ceil(filteredOnlyProduct.length / limit);
        return res.status(200).json({
            success: true,
            message: "Filtered Applied Successfully",
            products,
            totalPages
        });
    }
    catch (error) {
        return next(new ErrorHandler());
    }
};
// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];
//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\5ecc511f-7c45-464c-a693-9b65b40e29ab.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };
//     products.push(product);
//   }
//   await Product.create(products);
//   console.log({ succecss: true });
// };
