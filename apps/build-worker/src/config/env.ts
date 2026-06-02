const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  postgresUrl: process.env.POSTGRES_URL || "postgres://localhost:5432/shipyard",
  storageRoot: process.env.STORAGE_ROOT || "storage"
  
};

export default env;
