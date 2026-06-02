import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ROOT_STORAGE: any = process.env.STORAGE_ROOT;

export interface DeploymentResolution {
  deploymentId: string;
  targetUrl: URL;
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
export function resolveDeploymentTarget(deploymentId: string): DeploymentResolution | null {
  const upstreamBaseUrl = process.env.STORAGE_ROOT;

  if (!upstreamBaseUrl) {
    return null;
  }

  // const requestUrl = new URL(requestPath, "http://localhost");
  // const [routeName, deploymentId, ...rest] = requestUrl.pathname.split("/").filter(Boolean);

  // if (routeName !== "deployment" || !deploymentId) {
  //   return null;
  // }

  const targetUrl = new URL(upstreamBaseUrl);
  // const targetPath = [targetUrl.pathname.replace(/\/$/, ""), deploymentId, ...rest].filter(Boolean).join("/");

  // targetUrl.pathname = `/${targetPath}`;
  // targetUrl.search = requestUrl.search;

  return {
    deploymentId,
    targetUrl,
  };
}
