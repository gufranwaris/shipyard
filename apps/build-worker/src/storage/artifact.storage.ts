import { getArtifactPath } from "./paths";

export class ArtifactStorage {
  async save(deploymentId: string, name: string, contents: unknown) {
    return {
      name,
      path: getArtifactPath(deploymentId),
      contents
    };
  }
}
