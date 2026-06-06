import amqp from "amqplib";
import env from "../config/env";

export interface DeploymentBuildJob {
  deploymentId: string;
  projectId?: number;
  gitUrl: string;
}

export async function publishDeploymentBuildJob(job: DeploymentBuildJob) {
  const connection = await amqp.connect(env.rabbitmqUrl);
  const channel = await connection.createChannel();

  try {
    await channel.assertExchange(env.rabbitmqExchange, "topic", { durable: true });
    channel.publish(
      env.rabbitmqExchange,
      env.rabbitmqBuildRoutingKey,
      Buffer.from(JSON.stringify(job)),
      {
        contentType: "application/json",
        persistent: true,
      }
    );
  } finally {
    await channel.close();
    await connection.close();
  }
}
