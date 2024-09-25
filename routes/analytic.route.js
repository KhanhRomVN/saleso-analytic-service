const express = require("express");
const { AnalyticController } = require("../controllers");
const { authSellerToken } = require("../middleware/authToken");
const router = express.Router();

const routes = [
  {
    // get total_revenue, orders_successful, order_canceled, total_reversal for month
    method: "get",
    path: "/monthly",
    middleware: [authSellerToken],
    handler: AnalyticController.getMonthlyAnalytic,
  },
  {
    method: "get",
    path: "/yearly/:type",
    middleware: [authSellerToken],
    handler: AnalyticController.getYearlyAnalytic,
  },
  {
    method: "get",
    path: "/top5product",
    middleware: [authSellerToken],
    handler: AnalyticController.getTop5ProductAnalytic,
  },
  {
    method: "get",
    path: "/top5customer",
    middleware: [authSellerToken],
    handler: AnalyticController.getTop5CustomerAnalytic,
  },
];

routes.forEach(({ method, path, middleware = [], handler }) => {
  router[method](path, ...middleware, handler);
});

module.exports = router;
