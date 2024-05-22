import express from "express";
import {
  getLatestProduct,
  newProduct,
  getAllCategories,
  getAdminProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getFilteredProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";
const router = express.Router();


router.post("/new", adminOnly, singleUpload, newProduct)

router.get("/latest", getLatestProduct)

router.get("/search", getFilteredProduct);

router.get("/getAllCategories", getAllCategories);

router.get("/admin-product",adminOnly, getAdminProduct);

router
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly,singleUpload, updateProduct)
  .delete(adminOnly,deleteProduct);
export default router;