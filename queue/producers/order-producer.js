const amqp = require("amqplib");

const getTop5CustomerAnalytic = async (seller_id) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  const q = await channel.assertQueue("", { exclusive: true });
  const correlationId = generateUuid();

  channel.sendToQueue("top5_customer_analytic_queue", Buffer.from(seller_id), {
    correlationId: correlationId,
    replyTo: q.queue,
  });

  return new Promise((resolve) => {
    channel.consume(
      q.queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          resolve(JSON.parse(msg.content.toString()));
          setTimeout(() => {
            connection.close();
          }, 500);
        }
      },
      { noAck: true }
    );
  });
};

function generateUuid() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

module.exports = {
  getTop5CustomerAnalytic,
};
