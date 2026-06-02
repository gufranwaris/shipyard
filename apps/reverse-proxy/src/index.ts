import express from "express";

import deploymentRouter from "./routes/deployment.route.js";

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/deployment", deploymentRouter);

app.listen(3001, () => {
  console.log("Reverse proxy is running on port 3001");
});
