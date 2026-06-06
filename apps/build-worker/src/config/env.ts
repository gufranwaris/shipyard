const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  rabbitmqUrl: process.env.RABBITMQ_URL || "amqp://shipyard:shipyard@localhost:5672",
  rabbitmqExchange: process.env.RABBITMQ_EXCHANGE || "deployments.exchange",
  rabbitmqBuildQueue: process.env.RABBITMQ_BUILD_QUEUE || "deployments.build.queue",
  rabbitmqBuildRoutingKey: process.env.RABBITMQ_BUILD_ROUTING_KEY || "deployment.created",
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY || 1),
  postgresUrl: process.env.POSTGRES_URL || "postgres://localhost:5432/shipyard",
  storageRoot: process.env.STORAGE_ROOT || "storage"
  
};

export default env;
