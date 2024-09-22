const { ProductAnalyticModel } = require("../models");
const { handleRequest, createError } = require("../services/responseHandler");

const ProductAnalyticController = {
  newProductAnalytic: (req, res) =>
    handleRequest(req, res, async (req) => {
      const { product_id } = req.params;
      if (!product_id) {
        throw createError("Product ID is required", 400, "MISSING_PRODUCT_ID");
      }
      const result = await ProductAnalyticModel.newProductAnalytic(product_id);
      return { message: "Product analytic created successfully", data: result };
    }),

  updateVisitor: (req, res) =>
    handleRequest(req, res, async (req) => {
      const { product_id } = req.params;
      if (!product_id) {
        throw createError("Product ID is required", 400, "MISSING_PRODUCT_ID");
      }
      const result = await ProductAnalyticModel.updateValueAnalyticProduct(
        product_id,
        "visitor",
        1
      );
      return { message: "Visitor count updated successfully", data: result };
    }),
};

module.exports = ProductAnalyticController;
