const {
  startProductAnalyticConsumer,
} = require("./consumers/product-analytic-consumer");

const runAllConsumers = async () => {
  await startProductAnalyticConsumer();
};

module.exports = {
  runAllConsumers,
};
