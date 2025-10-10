import { NextFunction, Request, Response } from "express";
import { UserInfo } from "../schemas/user";

type Roles = "super-admin" | "admin" | "user" | "system" | "surgeon";

const roleWeight: Record<string, number> = {
  system: 99,
  "super-admin": 3,
  admin: 2,
  surgeon: 1,
  user: 1,
};

export const authorizationMiddleware =
  (minimumRole?: Roles) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!minimumRole) {
      next();
      return;
    }

    const user: UserInfo = req.user as UserInfo;
    if (!user || !user?.role) {
      res.status(401).send("Unauthorized");
      return;
    }

    const need = roleWeight[minimumRole] ?? 0;
    const have = roleWeight[(user.role as string) || ""] ?? 0;

    if (have >= need) {
      next();
      return;
    }

    res.status(403).send("Unsufficient permissions");
  };
