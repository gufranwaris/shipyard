import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { startDeploymentWorker } from "./queue/consumer";

export async function main() {
  await startDeploymentWorker();
}

main().catch((error) => {
  console.error("build-worker failed to start:", error);
  process.exit(1);
});
