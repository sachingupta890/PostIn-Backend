import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
import { logger } from "../winston/logger.js";
import { invalidateCache } from "../utils/features.js";
// Revalidate on create / delete and update Product & New Order
export const getLatestProduct = async (req, res, next) => {
    try {
        let products;
        if (nodeCache.has("latest-products")) {
            products = JSON.parse(nodeCache.get("latest-products"));
        }
        else {
            products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
            nodeCache.set("latest-products", JSON.stringify(products));
        }
        res.status(200).json({
            success: true,
            message: "Latest products fetched successfully",
            products,
        });
    }
    catch (error) {
        logger.error(`Error in getLatestProduct: ${error.message}`, {
            stack: error.stack,
        });
    }
};
// Revalidate on create / delete and update Product & New Order
export const getAllCategories = async (req, res, next) => {
    try {
        let categories;
        if (nodeCache.has("categories")) {
            categories = JSON.parse(nodeCache.get("categories"));
        }
        else {
            categories = await Product.distinct("category");
            nodeCache.set("categories", JSON.stringify(categories));
        }
        res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            categories,
        });
    }
    catch (error) {
        logger.error(`Error in getAllCategories: ${error.message}`, {
            stack: error.stack,
        });
        next(error);
    }
};
// Revalidate on create / delete and update Product & New Order
export const getAdminProduct = async (req, res, next) => {
    try {
        let products;
        if (nodeCache.has("all-products")) {
            products = JSON.parse(nodeCache.get("all-products"));
        }
        else {
            products = await Product.find({});
            nodeCache.set("all-products", JSON.stringify(products));
        }
        res.status(200).json({
            success: true,
            message: "All products fetched successfully",
            products,
        });
    }
    catch (error) {
        logger.error(`Error in getAdminProduct: ${error.message}`, {
            stack: error.stack,
        });
        next(error);
    }
};
// Revalidate on create / delete and update Product & New Order
export const getSingleProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let product;
        if (nodeCache.has(`product-${id}`)) {
            product = JSON.parse(nodeCache.get(`product-${id}`));
        }
        else {
            product = await Product.findById(id);
            if (!product) {
                throw new ErrorHandler("Product not found", 404);
            }
            nodeCache.set(`product-${id}`, JSON.stringify(product));
        }
        res.status(200).json({
            success: true,
            message: "Your product fetched successfully",
            product,
        });
    }
    catch (error) {
        logger.error(`Error in getSingleProduct: ${error.message}`, {
            stack: error.stack,
        });
        next(error);
    }
};
//create Product 
export const newProduct = async (req, res, next) => {
    try {
        const { name, category, price, stock } = req.body;
        const photo = req.file;
        if (!photo) {
            throw new ErrorHandler("Please add photo", 401);
        }
        if (!name || !price || !category || !stock) {
            // Manually delete the photo file if other fields are missing
            rm(photo.path, (err) => {
                if (err)
                    logger.error(`Failed to delete file: ${photo.path}`, {
                        stack: err.stack,
                    });
                else
                    logger.info(`File deleted: ${photo.path}`);
            });
            throw new ErrorHandler("Please enter all fields", 401);
        }
        const product = await Product.create({
            name,
            category: category.toLowerCase(),
            price,
            stock,
            photo: photo.path,
        });
        invalidateCache({
            product: true,
            admin: true,
            productId: String(product._id),
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    }
    catch (error) {
        logger.error(`Error in newProduct: ${error.message}`, {
            stack: error.stack,
        });
        next(error);
    }
};
// Update Product
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock } = req.body;
        const photo = req.file;
        let product = await Product.findById(id);
        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }
        if (photo) {
            // First delete the previous photo
            rm(product.photo, (err) => {
                if (err)
                    logger.error(`Failed to delete old photo: ${product.photo}`, { stack: err.stack });
                else
                    logger.info(`Old photo deleted: ${product.photo}`);
            });
            // Add new photo
            product.photo = photo?.path;
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
        invalidateCache({
            product: true,
            admin: true,
            productId: String(product._id),
        });
        res.status(201).json({
            success: true,
            message: "Product updated successfully",
            updatedProduct,
        });
    }
    catch (error) {
        logger.error(`Error in updateProduct: ${error.message}`, { stack: error.stack });
        next(error);
    }
};
// Delete Product
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }
        rm(product.photo, (err) => {
            if (err)
                logger.error(`Failed to delete product photo: ${product.photo}`, { stack: err.stack });
            else
                logger.info(`Product photo deleted: ${product.photo}`);
        });
        const deleteResult = await Product.deleteOne({ _id: id });
        invalidateCache({
            product: true,
            admin: true,
            productId: String(product._id),
        });
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            deleteResult,
        });
    }
    catch (error) {
        logger.error(`Error in deleteProduct: ${error.message}`, { stack: error.stack });
        next(error);
    }
};
// Get Filtered Products
export const getFilteredProduct = async (req, res, next) => {
    try {
        const { search, price, sort, category } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;
        const baseQuery = {};
        if (search) {
            baseQuery.name = { $regex: search, $options: "i" };
        }
        if (price) {
            baseQuery.price = { $lte: Number(price) };
        }
        if (category) {
            baseQuery.category = category;
        }
        const products = await Product.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);
        const totalProducts = await Product.countDocuments(baseQuery);
        const totalPages = Math.ceil(totalProducts / limit);
        res.status(200).json({
            success: true,
            message: "Filtered products fetched successfully",
            products,
            totalPages,
        });
    }
    catch (error) {
        logger.error(`Error in getFilteredProduct: ${error.message}`, { stack: error.stack });
        next(error);
    }
};
