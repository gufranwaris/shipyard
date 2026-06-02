import { execFile } from "node:child_process";

export class CommandExecutor {
  run(command: string, args: string[] = [], options: Record<string, unknown> = {}) {
    return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      execFile(command, args, options, (error, stdout, stderr) => {
        if (error) {
          reject(Object.assign(error, { stdout, stderr }));
          return;
        }

        resolve({ stdout, stderr });
      });
    });
  }
}
