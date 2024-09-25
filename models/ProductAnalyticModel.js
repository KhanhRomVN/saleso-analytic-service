const { getDB } = require("../config/mongoDB");
const { ObjectId } = require("mongodb");
const cron = require("node-cron");
const Joi = require("joi");

const COLLECTION_NAME = "product_analytic";
const COLLECTION_SCHEMA = Joi.object({
  product_id: Joi.string().required(),
  // time
  year: Joi.number().required(),
  month: Joi.number().required(),
  revenue: Joi.number().required(),
  visitor: Joi.number().required(),
  // wishlist
  wishlist_added: Joi.number().required(),
  // cart
  cart_added: Joi.number().required(),
  // order
  orders_placed: Joi.number().required(),
  orders_successful: Joi.number().required(),
  order_failed: Joi.number().required(),
  // reversal
  reversal_requested: Joi.number().required(),
  reversal_successful: Joi.number().required(),
  reversal_failed: Joi.number().required(),
  // discount
  discount_applications: Joi.number().required(),
}).options({ abortEarly: false });

const handleDBOperation = async (operation) => {
  const db = getDB();
  try {
    return await operation(db.collection(COLLECTION_NAME));
  } catch (error) {
    console.error(`Error in ${operation.name}: `, error);
    throw error;
  }
};

const ProductAnalyticModel = {
  // Create analytics information (only used when creating new products)
  newProductAnalytic: async (product_id) => {
    return handleDBOperation(async (collection) => {
      return await collection.insertOne({
        product_id,
        year: currentYear,
        month: currentMonth,
        revenue: 0,
        visitor: 0,
        wishlist_added: 0,
        wishlist_removed: 0,
        cart_added: 0,
        cart_removed: 0,
        orders_placed: 0,
        orders_cancelled: 0,
        orders_accepted: 0,
        orders_refused: 0,
        reversal_requested: 0,
        reversal_accepted: 0,
        reversal_refused: 0,
        discount_applications: 0,
      });
    });
  },

  updateValueAnalyticProduct: async (product_id, key, value) => {
    return handleDBOperation(async (collection) => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const productAnalyticData = await collection.findOne({
        product_id,
        year: currentYear,
        month: currentMonth,
      });
      if (!productAnalyticData) {
        await collection.insertOne({
          product_id,
          year: currentYear,
          month: currentMonth,
          revenue: 0,
          visitor: 0,
          wishlist_added: 0,
          wishlist_removed: 0,
          cart_added: 0,
          cart_removed: 0,
          orders_placed: 0,
          orders_accepted: 0,
          orders_refused: 0,
          reversal_requested: 0,
          reversal_accepted: 0,
          reversal_refused: 0,
          discount_applications: 0,
        });

        await collection.updateOne(
          { product_id, year: currentYear, month: currentMonth },
          { $inc: { [key]: value } }
        );
      } else {
        await collection.updateOne(
          { product_id, year: currentYear, month: currentMonth },
          { $inc: { [key]: value } }
        );
      }
    });
  },

  getMonthlyAnalytic: async (listProductId) => {
    return handleDBOperation(async (collection) => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const productAnalyticData = await collection
        .find({
          product_id: { $in: listProductId },
          year: year,
          month: month,
        })
        .toArray();

      return productAnalyticData;
    });
  },

  getYearlyAnalytic: async (listProductId, type) => {
    return handleDBOperation(async (collection) => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();

      // Tạo pipeline cho aggregation
      const pipeline = [
        {
          $match: {
            product_id: { $in: listProductId },
            year: year,
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: `$${type}` },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];

      const result = await collection.aggregate(pipeline).toArray();

      // Tạo mảng kết quả với 12 phần tử, mặc định là 0
      const monthlyData = Array(12).fill(0);

      // Điền dữ liệu vào mảng kết quả
      result.forEach((item) => {
        monthlyData[item._id - 1] = item.total;
      });

      return monthlyData;
    });
  },

  top5ProductAnalytic: async (listProductId) => {
    return handleDBOperation(async (collection) => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();

      const pipeline = [
        {
          $match: {
            product_id: { $in: listProductId },
            year: year,
          },
        },
        {
          $group: {
            _id: "$product_id",
            total_revenue: { $sum: "$revenue" },
            total_orders_successful: { $sum: "$orders_successful" },
          },
        },
        {
          $project: {
            _id: 0,
            product_id: "$_id",
            total_revenue: 1,
            total_orders_successful: 1,
            score: { $add: ["$total_revenue", "$total_orders_successful"] },
          },
        },
        {
          $sort: { score: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            product_id: 1,
            total_revenue: 1,
            total_orders_successful: 1,
            _id: 0,
          },
        },
      ];

      return await collection.aggregate(pipeline).toArray();
    });
  },
};

cron.schedule("* * * * *", () => {});

module.exports = ProductAnalyticModel;
