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

      const user = req.user as UserInfo & { uiRole?: string };
      if (!user || !user.role) {
        res.status(401).send("Unauthorized");
        return;
      }

      // Always allow system and super-admin
      if (user.role === "system" || user.role === "super-admin") {
        next();
        return;
      }

      // Treat admin (or ADFS uiRole admin) as super-admin-equivalent
      const isAdmin =
        user.role === "admin" || (user as any).uiRole === "admin";

      if (isAdmin) {
        next();
        return;
      }

      // Allow regular users when minimumRole is just "user"
      if (minimumRole === "user") {
        next();
        return;
      }

      res.status(403).send("Insufficient permissions");

  };