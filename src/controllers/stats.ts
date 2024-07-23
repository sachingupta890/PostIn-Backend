import { nodeCache } from "../app.js";
import { NextFunction, Request, Response } from "express";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js";
import { logger } from "../winston/logger.js";

export const dashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let stats;

    if (nodeCache.has("admin-stats")) {
      stats = JSON.parse(nodeCache.get("admin-stats") as string);
    } else {
      const today = new Date();

      const sixMonthAgo = new Date();
      sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

      const thisMonth = {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today,
      };

      const lastMonth = {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth(), 0),
      };

      const thisMonthProductsPromise = Product.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthProductsPromise = Product.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const thisMonthUsersPromise = User.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthUsersPromise = User.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const thisMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const lastSixMonthsOrdersPromise = Order.find({
        createdAt: {
          $gte: sixMonthAgo,
          $lte: today,
        },
      });

      const latestTransactionsPromise = Order.find({})
        .select(["orderItems", "discount", "total", "status"])
        .limit(4);

      const [
        thisMonthOrders,
        thisMonthProducts,
        thisMonthUsers,
        lastMonthOrders,
        lastMonthProducts,
        lastMonthUsers,
        productsCount,
        userCounts,
        allOrders,
        lastSixMonthsOrders,
        categories,
        femaleUsersCount,
        latestTransaction,
      ] = await Promise.all([
        thisMonthOrdersPromise,
        thisMonthProductsPromise,
        thisMonthUsersPromise,
        lastMonthOrdersPromise,
        lastMonthProductsPromise,
        lastMonthUsersPromise,
        Product.countDocuments(),
        User.countDocuments(),
        Order.find({}).select("total"),
        lastSixMonthsOrdersPromise,
        Product.distinct("category"),
        User.countDocuments({ gender: "female" }),
        latestTransactionsPromise,
      ]);

      const thisMonthRevenue = thisMonthOrders.reduce(
        (total, order) => total + (order.total || 0),
        0
      );

      const lastMonthRevenue = lastMonthOrders.reduce(
        (total, order) => total + (order.total || 0),
        0
      );

      const changePercent = {
        revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
        product: calculatePercentage(
          thisMonthProducts.length,
          lastMonthProducts.length
        ),
        user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
        order: calculatePercentage(
          thisMonthOrders.length,
          lastMonthOrders.length
        ),
      };

      const revenue = allOrders.reduce(
        (total, order) => total + (order.total || 0),
        0
      );

      const counts = {
        revenue,
        user: userCounts,
        product: productsCount,
        order: allOrders.length,
      };

      const orderMonthCounts = new Array(6).fill(0);
      const orderMonthRevenue = new Array(6).fill(0);

      lastSixMonthsOrders.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 6) {
          orderMonthCounts[6 - monthDiff - 1] += 1;
          orderMonthRevenue[6 - monthDiff - 1] += order.total;
        }
      });

      const categoryWithCount = await getInventories({
        categories,
        productsCount, 
      });

      const userRatio = {
        male: userCounts - femaleUsersCount,
        female: femaleUsersCount,
      };

      const modifiedLatestTransactions = latestTransaction.map((i) => ({
        _id: i._id,
        discount: i.discount,
        amount: i.total,
        status: i.status,
        Quantity: i.orderItems.length,
      }));
      stats = {
        categoryWithCount,
        changePercent,
        counts,
        chart: {
          order: orderMonthCounts,
          revenue: orderMonthRevenue,
        },
        userRatio,
        latestTransaction: modifiedLatestTransactions,
      };

      nodeCache.set("admin-stats", JSON.stringify(stats));
    }

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (err: any) {
    logger.error(`Error in Fetching dashboard Stats ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
};

export const getPieCharts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let charts;

    if (nodeCache.has("admin-pie-charts")) {
      charts = JSON.parse(nodeCache.get("admin-pie-charts") as string);
    } else {
      const [
        processingOrders,
        shippedOrders,
        deliveredOrders,
        categories,
        productsCount,
        outOfStock,
        allUsers,
        adminUsers,
        customerUsers,
      ] = await Promise.all([
        Order.countDocuments({ status: "Processing" }),
        Order.countDocuments({ status: "Shipped" }),
        Order.countDocuments({ status: "Delivered" }),
        Product.distinct("category"),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 }),
        User.find({}).select(["dob"]),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "user" }),
      ]);

      const orderFullfillment = {
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
      };

      const productCategories = await getInventories({
        categories,
        productsCount,
      });

      const availability = {
        inStock: productsCount - outOfStock,
        outStock: outOfStock,
      };

      const adminCustomer = {
        admin: adminUsers,
        customer: customerUsers,
      };

      const userAgeGroups = {
        teen: allUsers.filter((i) => i.age < 20).length,
        adult: allUsers.filter((i) => i.age >= 20 && i.age <= 40).length,
        old: allUsers.filter((i) => i.age > 40).length,
      };

      charts = {
        orderFullfillment,
        productCategories,
        availability,
        adminCustomer,
        userAgeGroups,
      };

      nodeCache.set("admin-pie-charts", JSON.stringify(charts));
    }

    return res.status(200).json({
      success: true,
      charts,
    });
  } catch (err: any) {
    logger.error(`Error in fetching Pie chart data ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
};

export const getBarCharts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let charts;
    const key = "admin-bar-charts";

    if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
    else {
      const today = new Date();

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const sixMonthProductPromise = Product.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const sixMonthUsersPromise = User.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const twelveMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const [products, users, orders] = await Promise.all([
        sixMonthProductPromise,
        sixMonthUsersPromise,
        twelveMonthOrdersPromise,
      ]);

      const productCounts = getChartData({
        length: 6,
        today,
        docArr: products,
      });
      const usersCounts = getChartData({ length: 6, today, docArr: users });
      const ordersCounts = getChartData({ length: 12, today, docArr: orders });

      charts = {
        users: usersCounts, 
        products: productCounts,
        orders: ordersCounts,
      };

      nodeCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
      success: true,
      charts,
    });

  } catch (err: any) {
    logger.error(`Error in fetching bar charts data ${err.message}`, {
      stack: err.stack,
    });
    next(err);
  }
};


export const getLineCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
     let charts;
     const key = "admin-line-charts";

     if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
     else {
       const today = new Date();

       const twelveMonthsAgo = new Date();
       twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

       const baseQuery = {
         createdAt: {
           $gte: twelveMonthsAgo,
           $lte: today,
         },
       };

       const [products, users, orders] = await Promise.all([
         Product.find(baseQuery).select("createdAt"),
         User.find(baseQuery).select("createdAt"),
         Order.find(baseQuery).select(["createdAt", "discount", "total"]),
       ]);

       const productCounts = getChartData({
         length: 12,
         today,
         docArr: products,
       });
       const usersCounts = getChartData({ length: 12, today, docArr: users });
       const discount = getChartData({
         length: 12,
         today,
         docArr: orders,
         property: "discount",
       });
       const revenue = getChartData({
         length: 12,
         today,
         docArr: orders,
         property: "total",
       });

       charts = {
         users: usersCounts,
         products: productCounts,
         discount,
         revenue,
       };

       nodeCache.set(key, JSON.stringify(charts));
     }

     return res.status(200).json({
       success: true,
       charts,
     });
    
  } catch (err: any) {
     logger.error(`Error in fetching line charts data ${err.message}`, {
       stack: err.stack,
     });
     next(err);
  }
}
