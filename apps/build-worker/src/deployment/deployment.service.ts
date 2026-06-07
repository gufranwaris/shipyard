import { cloneRepository } from "../git/clone.repository";
import fs from "fs-extra";
import path from "path";
import { getBuilder } from "../builders";
import { getArtifactPath, getBuildSourcePath } from "../storage/paths";
import { findDeploymentById } from "./deployment.repository";

interface DeploymentJob {
  deploymentId: string;
}
export async function processDeployment(job: DeploymentJob) {
  const { deploymentId } = job;
  const deployment = await findDeploymentById(BigInt(deploymentId));
  console.log("Fetched deployment from database:", deployment);
  if (!deployment) {
    throw new Error(`Deployment not found for ID: ${deploymentId}`);
  }
  const gitUrl = deployment?.project_entity?.git_url;
  const public_id = deployment.public_id;
  const sourcePath = getBuildSourcePath(public_id);
  const artifactPath = getArtifactPath(public_id);

  try {
    await cloneRepository(gitUrl, sourcePath);

    const builder = getBuilder(sourcePath);
    await builder.installDependencies();
    await builder.build();

    const outputDirectory = path.join(sourcePath, builder.getOutputDirectory());
    const outputExists = await fs.pathExists(outputDirectory);
    if (!outputExists) {
      throw new Error(`Build output directory not found: ${outputDirectory}`);
    }

    await fs.emptyDir(artifactPath);
    await fs.copy(outputDirectory, artifactPath);

    console.log(`Deployment ${deploymentId} built successfully`);
    // change the status of the deployment to "success" in the database
  } catch (error) {
    console.error("Error occurred while processing deployment:", error);
    // change the status of the deployment to "failed" in the database
    throw error;
  }
}
