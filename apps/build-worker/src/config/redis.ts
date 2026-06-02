import env from "./env";

export function createRedisConfig() {
  return {
    url: env.redisUrl,
    maxRetriesPerRequest: 3
  };
}
