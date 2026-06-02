export abstract class BaseBuilder {
  constructor(protected readonly sourcePath: string) {}

  abstract installDependencies(): Promise<void>;
  abstract build(): Promise<void>;
  abstract getOutputDirectory(): string;
}
