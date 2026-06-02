import { Worker } from "bullmq";
import { processDeployment } from "../deployment/deployment.service";

export const startDeploymentWorker = () => {
  const worker = new Worker(
    "deployments",
    async (job) => {
      console.log("Processing job:", job.id, job.data);
      await processDeployment(job.data);
      console.log("Job completed:", job.id);
    },
    {
      connection: {
        host: "127.0.0.1",
        port: 6379,
      },
    }
  );

  // worker.on('completed', job => {
  //   console.log(`Job ${job.id} has been completed`);
  // });

  // worker.on('failed', (job, err) => {
  //   console.error(`Job ${job.id} has failed with error:`, err);
  // });
  return worker;
}
