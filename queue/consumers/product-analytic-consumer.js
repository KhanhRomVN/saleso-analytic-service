const amqp = require("amqplib");
const { ProductAnalyticModel } = require("../../models");

const startProductAnalyticConsumer = async () => {
  let connection;
  let channel;
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    const queue = "update_product_analytic_queue";
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      const { product_id, key, value } = JSON.parse(msg.content.toString());

      try {
        await ProductAnalyticModel.updateValueAnalyticProduct(
          product_id,
          key,
          value
        );
      } catch (error) {
        console.error("Error updating product analytic:", error);
      }

      channel.ack(msg);
    });
  } catch (error) {
    console.error("Error in product analytic consumer:", error);
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
};

module.exports = {
  startProductAnalyticConsumer,
};
