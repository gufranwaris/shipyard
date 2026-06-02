import { Queue } from 'bullmq';

async function producer() {

  const queue = new Queue('deployments', {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
  });

  const addJob = async (data: any) => {
    await queue.add('deploy', data);
  }

  // Example usage
  await addJob({ deploymentId: '12345', gitUrl: 'https://github.com/Gufranwaris/vite-calculator.git' });
  await queue.close();
}
producer().catch(console.error);