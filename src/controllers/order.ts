import { NextFunction, Request, Response } from "express";
import { logger } from "../winston/logger.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { nodeCache } from "../app.js";


export const myOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query;

    let orders = [];

    if (nodeCache.has(`my-orders-${id}`)) {
      orders = JSON.parse(nodeCache.get(`my-orders-${id}`) as string);
    } else {
      orders = await Order.find({ user: id }).populate("user", "name");
      nodeCache.set(`my-orders-${id}`, JSON.stringify(orders));
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err: any) {
    logger.error(`Error in fetching my orders ${err.message}`);
    next(err);
  }
};

export const allOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let allOrders = [];
    if (nodeCache.has("all-orders")) {
      allOrders = JSON.parse(nodeCache.get("all-orders") as string);
    } else {
      allOrders = await Order.find().populate("user", "name");
      nodeCache.set("all-orders", JSON.stringify(allOrders));
    }

    return res.status(200).json({
      success: true,
      allOrders,
    });
  } catch (err: any) {
    logger.error(`Error in Fetching ALL Orders ${err.message}`);
    next(err);
  }
};

export const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    let order;

    if (nodeCache.has(`order-${id}`)) {
      order = JSON.parse(nodeCache.get(`order-${id}`) as string);
    } else {
      order = await Order.findById(id).populate("user", "name");
      if (!order) return next(new ErrorHandler("Order not found"));
      nodeCache.set(`order-${id}`, JSON.stringify(order));
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err: any) {
    logger.error(`Error in Fetching order ${err.message}`);
    next(err);
  }
};

export const newOrder = async (
  req: Request<{}, {}, NewOrderRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (
      !shippingInfo ||
      !orderItems ||
      !user ||
      !subtotal ||
      !tax ||
      !shippingCharges ||
      !discount ||
      !total
    ) {
      return next(new ErrorHandler("Plese fill the fields carefully "));
    }

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId:order.orderItems.map((i)=> String(i.productId))
    });

    return res.status(201).json({
      success: true,
      message: "Order Created Successfully ",
      order,
    });
  } catch (err: any) {
    logger.error(`Error in newOrder ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
};


export const processOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = req.params;
    
    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorHandler("Order not found",401);
    }

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      case "Delivered":
        order.status = "Delivered";
        break;
    }

    const updatedOrder = await order.save();
    invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });

    return res.status(200).json({
      success: true,
      message: "Order processed Successfully",
      updatedOrder
    })
    
  } catch (err: any) {
    logger.error(`Error in process Order  ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
};


export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorHandler("No order found",401);
    }

    await order.deleteOne();
       invalidateCache({
         product: false,
         order: true,
         admin: true,
         userId: order.user,
         orderId: String(order._id),
       });


    return res.status(200).json({
      success: true,
      message: "Order deleted Successfully",
      
    })

    
  } catch (err: any) {
    logger.error(`Error in deleting Order ${err.message}`, {
      stack: err.stack
    });
    next(err);
  }
}







