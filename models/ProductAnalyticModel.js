const { getDB } = require("../config/mongoDB");
const { ObjectId } = require("mongodb");
const cron = require("node-cron");
const Joi = require("joi");

const COLLECTION_NAME = "product_analytic";
const COLLECTION_SCHEMA = Joi.object({
  product_id: Joi.string().required(),
  year: Joi.number().required(),
  month: Joi.number().required(),
  revenue: Joi.number().required(),
  visitor: Joi.number().required(),
  wishlist_added: Joi.number().required(),
  wishlist_removed: Joi.number().required(),
  cart_added: Joi.number().required(),
  cart_removed: Joi.number().required(),
  orders_placed: Joi.number().required(),
  orders_cancelled: Joi.number().required(),
  orders_accepted: Joi.number().required(),
  orders_refused: Joi.number().required(),
  reversal_requested: Joi.number().required(),
  reversal_accepted: Joi.number().required(),
  reversal_refused: Joi.number().required(),
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
};

cron.schedule("* * * * *", () => {});

module.exports = ProductAnalyticModel;
