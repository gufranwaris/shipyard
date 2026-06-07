import amqp, { ConsumeMessage } from "amqplib";
import env from "../config/env";
import { processDeployment } from "../deployment/deployment.service";

interface DeploymentBuildMessage {
  deploymentId: string;
}

function parseDeploymentBuildMessage(message: ConsumeMessage): DeploymentBuildMessage {
  const content = message.content.toString();
  let payload: any;
  try {
    payload = JSON.parse(content);
  } catch (e) {
    throw new Error(`Invalid JSON content: ${content}`);
  }

  if (!payload.deploymentId) {
    throw new Error(`Build job is missing required fields. Raw content: ${content}`);
  }

  return {
    deploymentId: payload.deploymentId.toString(),
  };
}

export const startDeploymentWorker = async () => {
  console.log("Connecting to RabbitMQ at", env.rabbitmqUrl);
  const connection = await amqp.connect(env.rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(env.rabbitmqExchange, "direct", { durable: true });
  await channel.assertQueue(env.rabbitmqBuildQueue, { durable: true });
  await channel.bindQueue(
    env.rabbitmqBuildQueue,
    env.rabbitmqExchange,
    env.rabbitmqBuildRoutingKey
  );
  
  await channel.prefetch(env.workerConcurrency);

  console.log("build-worker consuming RabbitMQ queue", {
    queue: env.rabbitmqBuildQueue,
    exchange: env.rabbitmqExchange,
    routingKey: env.rabbitmqBuildRoutingKey,
    concurrency: env.workerConcurrency,
  });

  await channel.consume(env.rabbitmqBuildQueue, async (message) => {
    if (!message) {
      return;
    }

    const content = message.content.toString();
    console.log("Received message from RabbitMQ:", content);

    try {
      const job = parseDeploymentBuildMessage(message);
      console.log("Processing deployment build job:", job);
      await processDeployment(job);
      channel.ack(message);
      console.log("Deployment build job completed:", job.deploymentId);
    } catch (error) {
      console.error("Deployment build job failed:", error);
      // Don't requue if it's a parsing error to avoid infinite loops
      channel.nack(message, false, false);
    }
  });

  const shutdown = async () => {
    console.log("build-worker shutting down");
    await channel.close();
    await connection.close();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
