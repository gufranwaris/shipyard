import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      deploymentId?: string;
    }
  }
}

export function deploymentResolver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const hostname = req.hostname;

  const deploymentId = hostname.split(".")[0];

  if (!deploymentId) {
    return res.status(400).json({
      error: "Invalid hostname"
    });
  }

  req.deploymentId = deploymentId;

  next();
}