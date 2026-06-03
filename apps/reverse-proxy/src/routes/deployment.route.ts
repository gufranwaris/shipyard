import { Router } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ROOT_STORAGE = process.env.STORAGE_ROOT;

import { resolveDeploymentTarget } from "../services/deployment-resolver.js";

const deploymentRouter = Router();

deploymentRouter.get(/.*/, (req, res) => {

  const deploymentId = req.deploymentId!;
  const artifactRoot = path.resolve(
    ROOT_STORAGE!,
    "artifacts",
    deploymentId
  );

  let requestedFile: string;

  if (req.path === "/") {
    requestedFile = path.join(
      artifactRoot,
      "index.html"
    );
  } else {
    requestedFile = path.join(
      artifactRoot,
      req.path
    );
  }

  // Prevent Directory Traversal
  // Bad actor: GET /../../../package.json
  // Without protection: storage/artifacts/abc123/../../../package.json
  // could escape the deployment folder.

  if (!requestedFile.startsWith(artifactRoot)) {
    return res.status(403).end();
  }

  // File Existence Check
  if (!fs.existsSync(requestedFile)) {
    return res.status(404).json({
      error: "File not found"
    });
  }
  res.sendFile(requestedFile);
});

export default deploymentRouter;
