# BullMQ Concurrency and Worker Internals

## Introduction

This document explains how BullMQ workers process jobs, what concurrency means, and how Node.js handles multiple jobs internally.

---

# 1. What is a Worker in BullMQ?

A worker continuously listens to a queue and processes jobs.

Example:

```js
const { Worker } = require('bullmq');

const worker = new Worker(
  'email-queue',
  async job => {
    console.log(job.data);
  }
);
```

Flow:

```text
Queue → Worker → Executes Task
```

---

# 2. Understanding the Processor Function

This function:

```js
async job => {
  console.log(job.data);
}
```

is called the **processor function**.

Whenever a new job arrives:
- BullMQ calls this function
- passes the job object
- your logic runs

---

# 3. What is the `job` Object?

Example producer:

```js
await queue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!'
});
```

Inside worker:

```js
console.log(job.data);
```

Output:

```js
{
  to: 'user@example.com',
  subject: 'Welcome!'
}
```

Useful properties:

| Property | Meaning |
|---|---|
| `job.id` | Unique job ID |
| `job.name` | Job name |
| `job.data` | Payload |
| `job.attemptsMade` | Retry count |

---

# 4. What Does "Simulate Work" Mean?

Example:

```js
await new Promise(resolve => setTimeout(resolve, 2000));
```

This simply means:

```text
Wait for 2 seconds
```

It is used to imitate a real-world async task.

Instead of simulated work, production code might do:

```js
await sendEmail();
```

or:

```js
await uploadToS3();
```

or:

```js
await generatePDF();
```

---

# 5. Worker Events

## Completed Event

```js
worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});
```

This event fires when:
- the processor function finishes successfully
- no error occurs

Flow:

```text
Job received
   ↓
Processor starts
   ↓
Task succeeds
   ↓
completed event fires
```

---

## Failed Event

```js
worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed`);
});
```

This event fires when:
- an error occurs inside the processor function

Example:

```js
const worker = new Worker(
  'email-queue',
  async job => {
    throw new Error('SMTP server down');
  }
);
```

Output:

```text
Job failed: SMTP server down
```

---

# 6. Job Lifecycle in BullMQ

A job typically moves through these states:

```text
WAITING
   ↓
ACTIVE
   ↓
COMPLETED
```

or:

```text
WAITING
   ↓
ACTIVE
   ↓
FAILED
```

---

# 7. What Happens When 100 Jobs Are Added?

Example:

```js
for (let i = 0; i < 100; i++) {
  await queue.add('send-email', {
    userId: i
  });
}
```

BullMQ stores all jobs safely in Redis.

Queue:

```text
Job1
Job2
Job3
...
Job100
```

Workers gradually pull jobs from the queue.

---

# 8. Default Worker Behavior

Example:

```js
const worker = new Worker(
  'email-queue',
  async job => {
    await new Promise(r => setTimeout(r, 2000));
  }
);
```

Default behavior:

```text
concurrency = 1
```

Meaning:
- only ONE job is processed at a time

Timeline:

```text
Time 0s → Job1 starts
Time 2s → Job1 done
Time 2s → Job2 starts
```

---

# 9. Understanding Concurrency

Example:

```js
const worker = new Worker(
  'email-queue',
  async job => {
    await new Promise(r => setTimeout(r, 2000));
  },
  {
    concurrency: 5
  }
);
```

Meaning:

```text
Allow up to 5 jobs to stay ACTIVE simultaneously
```

---

# 10. How Concurrency Works

Suppose queue has 100 jobs.

Worker immediately pulls:

```text
Job1
Job2
Job3
Job4
Job5
```

These become ACTIVE.

Remaining jobs stay WAITING inside Redis.

Example:

| Job | State |
|---|---|
| 1 | ACTIVE |
| 2 | ACTIVE |
| 3 | ACTIVE |
| 4 | ACTIVE |
| 5 | ACTIVE |
| 6-100 | WAITING |

---

# 11. What Happens When a Job Finishes?

Suppose Job2 completes.

Worker immediately pulls Job6.

Now:

| Job | State |
|---|---|
| 1 | ACTIVE |
| 2 | COMPLETED |
| 3 | ACTIVE |
| 4 | ACTIVE |
| 5 | ACTIVE |
| 6 | ACTIVE |
| 7-100 | WAITING |

BullMQ always tries to maintain the configured concurrency level.

---

# 12. Important Clarification About Concurrency

This does NOT mean:

```text
5 threads are created
```

This also does NOT mean:

```text
5 separate Node.js processes
```

---

# 13. How Node.js Actually Handles Concurrency

Node.js usually runs JavaScript on:

```text
ONE JavaScript thread
```

Even with:

```js
concurrency: 100
```

there is still generally:
- one event loop
- one JavaScript thread

---

# 14. Then How Can Multiple Jobs Run Together?

Because of asynchronous IO.

Example:

```js
await fetch('https://api.com');
```

While Job1 waits for network response:
- Node.js can process Job2
- then Job3
- then Job4

This is called async concurrency.

---

# 15. Concurrency vs Parallelism

## Concurrency

```text
Multiple tasks make progress together
```

Usually using:
- async operations
- event loop

---

## Parallelism

```text
Multiple CPUs execute work simultaneously
```

Requires:
- multiple processes
- worker threads
- separate CPU execution

---

# 16. BullMQ Concurrency Is Best For IO Tasks

Excellent for:
- API requests
- database queries
- sending emails
- uploads/downloads
- Redis operations

---

# 17. CPU-heavy Tasks Are Different

Example:

```js
while(true) {
  heavyCalculation();
}
```

This blocks the Node.js event loop.

In CPU-heavy jobs:
- concurrency becomes less effective

---

# 18. Real Parallelism in BullMQ

To achieve real parallel execution, use:
- multiple worker processes
- worker threads
- sandboxed processors

Example:

```text
Redis Queue
   ↓
Worker A
Worker B
Worker C
```

Each worker process has:
- its own event loop
- its own memory
- independent execution

---

# 19. How BullMQ Prevents Duplicate Processing

BullMQ uses Redis locks.

Example:

```text
Worker A picks Job1
```

Redis locks Job1.

Other workers cannot process it simultaneously.

This guarantees:
- no duplicate execution
- safe distributed processing

---

# 20. Mental Model

## BullMQ Queue

```text
Queue = Restaurant order list
```

## Worker

```text
Worker = Chef
```

## Concurrency

```text
Concurrency = Number of dishes chef can manage simultaneously
```

---

# 21. Final Summary

## `concurrency: 5` Means

```text
Allow up to 5 async jobs to stay ACTIVE simultaneously
inside one Node.js process.
```

It does NOT mean:
- 5 threads
- 5 CPUs
- 5 Node.js processes

---

# 22. Key Takeaways

- BullMQ stores jobs inside Redis
- Workers pull jobs from queues
- Concurrency controls ACTIVE jobs
- Remaining jobs stay WAITING
- Node.js concurrency is async/event-loop based
- Real parallelism requires multiple processes or worker threads
- BullMQ safely distributes jobs across workers
