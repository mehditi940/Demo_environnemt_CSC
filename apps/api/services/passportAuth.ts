import passport from "passport";
import { AdfsJwtStrategy, PassportJwtStrategy } from "./passport";

const baseStrategies: string[] = [];

if (AdfsJwtStrategy) {
  baseStrategies.push("adfs-jwt");
}

if (PassportJwtStrategy) {
  baseStrategies.push("jwt");
}

if (baseStrategies.length === 0) {
  throw new Error(
    "No authentication strategies configured. Set JWT_SECRET or configure ADFS OIDC."
  );
}

export const getAuthMiddleware = (additionalStrategies: string[] = []) =>
  passport.authenticate([...baseStrategies, ...additionalStrategies], {
    session: false,
  });
