// import env from "./config/env";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { startDeploymentWorker } from "./queue/consumer";

// const logger = createLogger();
export function main() {
  // logger.info("build-worker starting", { nodeEnv: env.nodeEnv, port: env.port });
  // Initialize the worker to process deployment jobs
  console.log("before debugger");
  debugger;
  console.log("after debugger");
  startDeploymentWorker();
  // console.log("build-worker starting", process.env.STORAGE_ROOT);
}
main();
