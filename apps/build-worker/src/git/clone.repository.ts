import simpleGit from "simple-git";
import fs from "fs-extra";

export async function cloneRepository(
  gitUrl: string,
  targetPath: string
) {
  await fs.emptyDir(targetPath);

  const git = simpleGit();

  console.log("Cloning repository...");

  await git.clone(gitUrl, targetPath);

  console.log("Repository cloned");
}
