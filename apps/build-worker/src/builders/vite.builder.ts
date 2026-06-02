import { BaseBuilder } from "./base.builder";
import { runCommand } from "../utils/run-command";

export class ViteBuilder extends BaseBuilder {
  async installDependencies(): Promise<void> {
    await runCommand("npm", ["install"], this.sourcePath);
  }

  async build(): Promise<void> {
    await runCommand("npm", ["run", "build"], this.sourcePath);
  }

  getOutputDirectory(): string {
    return "dist";
  }
}
