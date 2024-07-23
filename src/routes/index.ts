import express, { Router } from "express";
import axios from "axios";
const router = Router();

import userRoute from "../routes/user.js"
import productRoute from "../routes/product.js"
import orderRoute from "../routes/order.js"
import paymentRoute from "../routes/payment.js"
import dashboardRoute from "../routes/stats.js"

router.use("/user", userRoute);
router.use("/product", productRoute);
router.use("/order", orderRoute);
router.use("/payment", paymentRoute)
router.use("/dashboard",dashboardRoute)


router.get('/test', async (req, res) => {
    try {
        const result = await axios.get("http://103.140.219.4/admin/users");

        console.log(result)

    // return res.status(200).json({
    //     success: true,
    //     result
    // })
    } catch (err) {
        console.error("error")
}
})


       
 


export default router;
