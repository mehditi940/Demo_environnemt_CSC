import { NextFunction, Request, Response } from "express";
import { Role, UserInfo } from "../schemas/user";

// Accept Role enum values and common string aliases
type Roles = Role | "admin" | "surgeon" | "user" | "system" | "super-admin" | "chirurg" | "gebruiker";

const toRole = (value: Roles | undefined): Role | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return value as Role;
  switch (value) {
    // new canonical names
    case "admin":
      return Role.Admin; // highest
    case "surgeon":
      return Role.Surgeon;
    case "user":
      return Role.User;
    // legacy aliases
    case "super-admin":
      return Role.Admin;
    case "chirurg":
      return Role.Surgeon;
    case "gebruiker":
      return Role.User;
    case "system":
      return Role.System;
    default:
      return undefined;
  }
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

    // Admin and System can access everything
    if (user.role === Role.Admin || user.role === Role.System) {
      next();
      return;
    }

    const required = toRole(minimumRole);

    // Surgeon can access anything that is not Admin-only
    if (user.role === Role.Surgeon && required !== Role.Admin) {
      next();
      return;
    }

    // User must meet user level exactly (or lower if any)
    if (user.role === Role.User && required === Role.User) {
      next();
      return;
    }

    res.status(403).send("Onvoldoende rechten");
  };
