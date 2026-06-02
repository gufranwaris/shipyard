import { BaseBuilder } from "./base.builder";
import { ViteBuilder } from "./vite.builder";

export function getBuilder(sourcePath: string): BaseBuilder {
  return new ViteBuilder(sourcePath);
}
