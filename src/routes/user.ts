import express from "express";
const router = express.Router();
import { adminOnly } from "../middlewares/auth.js";
import {
  newUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/user.js";

router.post("/new", newUser)
router.get("/getAllUsers", adminOnly,getAllUsers);
router.route("/:id").get(adminOnly,getUserById).delete(adminOnly, deleteUser);


export default router;