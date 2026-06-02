import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ROOT_STORAGE = process.env.STORAGE_ROOT;

// const ROOT_STORAGE = path.join(process.cwd(), "storage");

export function getBuildSourcePath(
  deploymentId: string
) {
  return path.join(
    ROOT_STORAGE,
    "builds",
    deploymentId,
    "source"
  );
}

export function getArtifactPath(
  deploymentId: string
) {
  return path.join(
    ROOT_STORAGE,
    "artifacts",
    deploymentId
  );
}