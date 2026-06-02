import env from "./env";

export function createPostgresConfig() {
  return {
    connectionString: env.postgresUrl
  };
}
