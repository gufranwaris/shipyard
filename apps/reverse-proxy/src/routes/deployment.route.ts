import { Router } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ROOT_STORAGE = process.env.STORAGE_ROOT;

import { resolveDeploymentTarget } from "../services/deployment-resolver.js";

const deploymentRouter = Router();

deploymentRouter.get("/:deploymentId", (req, res) => {
 
  const filePath = path.resolve(
    ROOT_STORAGE!,
    "artifacts",
    req.params.deploymentId,
    "index.html"
  );
  console.log(filePath);
  console.log(
    "Exists:",
    fs.existsSync(filePath)
  );
  // const resolution = resolveDeploymentTarget(req.params.deploymentId);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(err.status || 500).end();
    }
  });
  // if (!resolution) {
  //   res.status(502).json({ error: "Unable to resolve deployment target" });
  //   return;
  // }

  // const fetchInit: any = {
  //   method: req.method,
  //   headers: req.headers,
  // };

  // if (req.method !== "GET" && req.method !== "HEAD") {
  //   fetchInit.body = req;
  //   fetchInit.duplex = "half";
  // }

  // const upstreamResponse = await fetch(resolution.targetUrl, fetchInit);

  // res.status(upstreamResponse.status);

  // upstreamResponse.headers.forEach((value, key) => {
  //   res.setHeader(key, value);
  // });

  // if (!upstreamResponse.body) {
  //   res.end();
  //   return;
  // }

  // const reader = upstreamResponse.body.getReader();

  // while (true) {
  //   const { done, value } = await reader.read();
  //   if (done) {
  //     break;
  //   }
  //   res.write(Buffer.from(value));
  // }

  // res.end();
});

export default deploymentRouter;
