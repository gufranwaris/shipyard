import express from "express";

import deploymentRouter from "./routes/deployment.route.js";
import { deploymentResolver } from "./middleware/deployment-resolver.js";

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(deploymentResolver);
// http://12345.localhost:3001/
app.use("/", deploymentRouter);

app.listen(3001, () => {
  console.log("Reverse proxy is running on port 3001");
});
