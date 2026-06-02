const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const infraDir = path.join(rootDir, "infra");
const composeDir = path.join(infraDir, "compose");
const storageDir = path.join(infraDir, "storage");

const composeFiles = {
  dev: path.join(composeDir, "docker-compose.dev.yml"),
  prod: path.join(composeDir, "docker-compose.prod.yml")
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd: rootDir,
    shell: false,
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function dockerCompose(envName, args) {
  const composeFile = composeFiles[envName];
  if (!composeFile) {
    throw new Error(`Unknown environment: ${envName}`);
  }

  run("docker", ["compose", "-f", composeFile, ...args]);
}

function cleanDirectory(targetDir) {
  if (!fs.existsSync(targetDir)) {
    return;
  }

  for (const entry of fs.readdirSync(targetDir)) {
    const entryPath = path.join(targetDir, entry);
    fs.rmSync(entryPath, { recursive: true, force: true });
  }
}

function usage() {
  console.log([
    "Usage:",
    "  node scripts/shipyard.js up <dev|prod>",
    "  node scripts/shipyard.js down <dev|prod>",
    "  node scripts/shipyard.js restart <dev|prod>",
    "  node scripts/shipyard.js reset <dev|prod>",
    "  node scripts/shipyard.js logs <dev|prod>",
    "  node scripts/shipyard.js ps <dev|prod>",
    "  node scripts/shipyard.js cleanup"
  ].join("\n"));
}

function main() {
  //  process.argv is the array of arguments passed to the Node.js program
  // slice(2) removes the first two default values:
  //    1) the Node executable path
  //    2) the script path
  const [command, envName = "dev"] = process.argv.slice(2);

  switch (command) {
    case "up":
      dockerCompose(envName, ["up", "-d", "--build"]);
      break;
    case "down":
      dockerCompose(envName, ["down"]);
      break;
    case "restart":
      dockerCompose(envName, ["down"]);
      dockerCompose(envName, ["up", "-d", "--build"]);
      break;
    case "reset":
      dockerCompose(envName, ["down", "-v", "--remove-orphans"]);
      cleanDirectory(path.join(storageDir, "builds"));
      cleanDirectory(path.join(storageDir, "artifacts"));
      break;
    case "logs":
      dockerCompose(envName, ["logs", "-f"]);
      break;
    case "ps":
      dockerCompose(envName, ["ps"]);
      break;
    case "cleanup":
      cleanDirectory(path.join(storageDir, "builds"));
      cleanDirectory(path.join(storageDir, "artifacts"));
      break;
    default:
      usage();
      process.exit(command ? 1 : 0);
  }
}

main();
