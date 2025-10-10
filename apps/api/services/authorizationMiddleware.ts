import { NextFunction, Request, Response } from "express";
import { UserInfo } from "../schemas/user";

type Roles = "super-admin" | "admin" | "user" | "system";

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

    if (user.role === "super-admin" || user.role === "system") {
      next();
      return;
    }

    if (user.role === "admin" && minimumRole !== "super-admin") {
      next();
      return;
    }

    res.status(403).send("Unsufficient permissions");
  };
