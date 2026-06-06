import amqp, { ConsumeMessage } from "amqplib";
import env from "../config/env";
import { processDeployment } from "../deployment/deployment.service";

interface DeploymentBuildMessage {
  deploymentId?: string;
  projectId?: number;
  gitUrl?: string;
}

function parseDeploymentBuildMessage(message: ConsumeMessage): { deploymentId: string; gitUrl: string } {
  const payload = JSON.parse(message.content.toString()) as DeploymentBuildMessage;

  if (!payload.gitUrl) {
    throw new Error("Build job is missing gitUrl");
  }

  const deploymentId = payload.deploymentId || String(payload.projectId || "");
  if (!deploymentId) {
    throw new Error("Build job is missing deploymentId");
  }

  return {
    deploymentId,
    gitUrl: payload.gitUrl,
  };
}

export const startDeploymentWorker = async () => {
  const connection = await amqp.connect(env.rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(env.rabbitmqExchange, "topic", { durable: true });
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

    try {
      const job = parseDeploymentBuildMessage(message);
      console.log("Processing deployment build job:", job);
      await processDeployment(job);
      channel.ack(message);
      console.log("Deployment build job completed:", job.deploymentId);
    } catch (error) {
      console.error("Deployment build job failed:", error);
      channel.nack(message, false, true);
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
