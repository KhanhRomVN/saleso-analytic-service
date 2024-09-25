const { ProductAnalyticModel } = require("../models");
const { handleRequest } = require("../services/responseHandler");
const {
  getListProductBySellerId,
  getProductById,
} = require("../queue/producers/product-producer");
const {
  getTop5CustomerAnalytic,
} = require("../queue/producers/order-producer");
const { getUserById } = require("../queue/producers/user-producer");

const AnalyticController = {
  // general analytic is include total_revenue, orders_successful, order_canceled, total_reversal
  getMonthlyAnalytic: (req, res) =>
    handleRequest(req, res, async (req) => {
      const seller_id = req.user._id.toString();
      const listProductData = await getListProductBySellerId(seller_id);
      const listProductId = listProductData.map((product) =>
        product._id.toString()
      );
      const productAnalyticData =
        await ProductAnalyticModel.getMonthlyAnalytic(listProductId);

      const generalAnalytic = productAnalyticData.reduce(
        (acc, item) => {
          acc.total_revenue += item.revenue || 0;
          acc.orders_successful += item.orders_successful || 0;
          acc.order_canceled += item.orders_cancelled || 0;
          acc.total_reversal += item.reversal || 0;
          return acc;
        },
        {
          total_revenue: 0,
          orders_successful: 0,
          order_canceled: 0,
          total_reversal: 0,
        }
      );

      return generalAnalytic;
    }),

  getYearlyAnalytic: (req, res) =>
    handleRequest(req, res, async (req) => {
      const { type } = req.params;
      const seller_id = req.user._id.toString();
      const listProductData = await getListProductBySellerId(seller_id);
      const listProductId = listProductData.map((product) =>
        product._id.toString()
      );
      const productAnalyticData = await ProductAnalyticModel.getYearlyAnalytic(
        listProductId,
        type
      );
      return productAnalyticData;
    }),

  getTop5ProductAnalytic: async (req, res) =>
    handleRequest(req, res, async (req) => {
      const seller_id = req.user._id.toString();
      const listProductData = await getListProductBySellerId(seller_id);
      const listProductId = listProductData.map((product) =>
        product._id.toString()
      );
      const productAnalyticData =
        await ProductAnalyticModel.top5ProductAnalytic(listProductId);

      // Bổ sung thông tin tên và hình ảnh cho mỗi sản phẩm
      const enhancedProductAnalyticData = await Promise.all(
        productAnalyticData.map(async (product) => {
          const productDetails = await getProductById(product.product_id);
          return {
            ...product,
            name: productDetails.name,
            image: productDetails.images[0],
          };
        })
      );

      return enhancedProductAnalyticData;
    }),

  getTop5CustomerAnalytic: (req, res) =>
    handleRequest(req, res, async (req) => {
      const seller_id = req.user._id.toString();
      const top5CustomerAnalytic = await getTop5CustomerAnalytic(seller_id);

      const enhancedTop5CustomerAnalytic = await Promise.all(
        top5CustomerAnalytic.map(async (customer) => {
          const customerDetails = await getUserById(
            customer.customer_id,
            "customer"
          );
          return {
            ...customer,
            username: customerDetails.username,
            email: customerDetails.email,
          };
        })
      );

      return enhancedTop5CustomerAnalytic;
    }),
};

module.exports = AnalyticController;
