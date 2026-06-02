export const DeploymentStatus = {
  Pending: "pending",
  Building: "building",
  Succeeded: "succeeded",
  Failed: "failed"
} as const;

export type DeploymentStatusValue = (typeof DeploymentStatus)[keyof typeof DeploymentStatus];
