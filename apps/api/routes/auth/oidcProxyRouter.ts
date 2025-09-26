import "dotenv/config";
import express, { Router } from "express";

// Simple proxy for AD FS token endpoint to bypass browser CORS.
// Frontend sets token_endpoint to this proxy (same origin as API),
// which forwards the request server-side to AD FS.

const oidcProxyRouter = Router();

// Accept raw x-www-form-urlencoded body for token exchange
oidcProxyRouter.use(
  "/token",
  express.text({ type: "application/x-www-form-urlencoded" })
);

oidcProxyRouter.post("/token", async (req, res) => {
  try {
    const issuer = (process.env.ADFS_OIDC_ISSUER || "").replace(/\/$/, "");
    if (!issuer) {
      res.status(500).json({ message: "ADFS_OIDC_ISSUER is not configured" });
      return;
    }
    const tokenEndpoint = (process.env.ADFS_OIDC_TOKEN_ENDPOINT || `${issuer}/oauth2/token/`).toString();

    const upstream = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: typeof req.body === "string" ? req.body : "",
    });

    const text = await upstream.text();
    // Mirror upstream status and content-type
    const contentType = upstream.headers.get("content-type") || "application/json";
    res.status(upstream.status).setHeader("content-type", contentType).send(text);
  } catch (err) {
    console.error("OIDC token proxy error:", err);
    res.status(502).json({ message: "Failed to reach ADFS token endpoint" });
  }
});

export default oidcProxyRouter;

