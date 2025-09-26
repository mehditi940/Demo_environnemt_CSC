import "dotenv/config";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import authRouter from "./routes/auth/authRouter";
import { swaggerSpecs } from "./utils/swaggerJs";
import {
  AuthBearerStrategy,
  LocalLoginStrategy,
  PassportJwtStrategy,
  AdfsJwtStrategy,
} from "./services/passport";
import passport from "passport";
import cors from "cors";
import patientRouter from "./routes/patient/patientRouter";
import roomRouter from "./routes/room/roomRouter";
import { authorizationMiddleware } from "./services/authorizationMiddleware";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { socketHandler } from "./socket/socketHandler";
import connectionRouter from "./routes/connection/connectionRouter";
import oidcProxyRouter from "./routes/auth/oidcProxyRouter";

//Check envoirment variables
if (!process.env.PORT) {
  throw new Error("PORT is not set in the environment variables.");
}
if (!process.env.DB_FILE_NAME) {
  throw new Error("DB_FILE_NAME is not set in the environment variables.");
}
const adfsEnabled = !!(
  process.env.ADFS_OIDC_JWKS_URI &&
  process.env.ADFS_OIDC_ISSUER
);
if (!adfsEnabled && !process.env.JWT_SECRET) {
  throw new Error("Either ADFS OIDC variables or JWT_SECRET must be set.");
}
if (!process.env.API_URL) {
  throw new Error("API_URL is not set in the environment variables.");
}
if (!process.env.FRONTEND_URL && !process.env.FRONTEND_URLS) {
  throw new Error("Either FRONTEND_URL or FRONTEND_URLS must be set in the environment variables.");
}
if (!process.env.STORAGE_PATH) {
  throw new Error("STORAGE_PATH is not set in the environment variables.");
}
// AUTH_TOKEN only required if bearer strategy is used
if (!process.env.STUN_SERVERS) {
  throw new Error("STUN_SERVERS is not set in the environment variables.");
}

//Initialize express app and server
export const app = express();
export const server = createServer(app);

// CORS middleware
// Support multiple allowed origins via comma-separated env (FRONTEND_URL or FRONTEND_URLS)
const normalizeOrigin = (value?: string) =>
  (value || "")
    .toLowerCase()
    .trim()
    .replace(/\/$/, "");

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => normalizeOrigin(s))
  .filter(Boolean);

const isAllowedOrigin = (origin?: string) => {
  const o = normalizeOrigin(origin);
  if (!o) return true; // non-browser or same-origin
  if (allowedOrigins.length === 0) return true; // allow all if not configured
  return allowedOrigins.includes(o);
};

app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);

// Ensure OPTIONS preflight gets CORS headers
app.options("*", cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
    "Origin",
  ],
  optionsSuccessStatus: 200,
}));

// Morgan middleware to log requests
app.use(
  morgan(
    "[\u001b[35m:date[iso]\u001b[0m](\u001b[33m:status\u001b[0m) Request \u001b[32m:method\u001b[0m :url for \u001b[35m:remote-addr\u001b[0m"
  )
);

// Passport middleware
app.use(bodyParser.json());
passport.use(LocalLoginStrategy);
if (PassportJwtStrategy) {
  passport.use(PassportJwtStrategy);
}
passport.use(AuthBearerStrategy);
if (AdfsJwtStrategy) {
  passport.use("adfs-jwt", AdfsJwtStrategy);
}

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Base routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple "OK" response to indicate the API is running.
 *     responses:
 *       200:
 *         description: API is running successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
app.get("/", (req, res) => {
  res.json({ message: "OK" });
});

/**
 * @swagger
 *
 * tags:
 *   - name: Static
 *     description: Static file serving
 *
 * /static/{path}:
 *   get:
 *     summary: Serves static files
 *     description: Serves files from the STORAGE_PATH directory. Requires authorization.
 *     tags: [Static]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the file.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Unauthorized access.
 *       404:
 *         description: File not found.
 */
app.use(
  "/static",
  passport.authenticate(AdfsJwtStrategy ? ["adfs-jwt"] : ["jwt"], {
    session: false,
  }),
  authorizationMiddleware("user"),
  express.static(process.env.STORAGE_PATH)
);

// Routers
app.use("/auth", authRouter);
app.use("/patient", patientRouter);
app.use("/room", roomRouter);
app.use("/connection", connectionRouter);
app.use("/oidc", oidcProxyRouter);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  },
});
io.engine.use((req: any, res: any, next: any) => {
  // This middleware is used to authenticate the socket connection
  const isHandshake = req._query.sid === undefined;
  if (isHandshake) {
    passport.authenticate(AdfsJwtStrategy ? ["adfs-jwt"] : ["jwt"], {
      session: false,
    })(
      req,
      res,
      next
    );
  } else {
    next();
  }
});
io.on("connection", socketHandler);

// Start the server
const port = Number(process.env.PORT) || 3001;

server.listen(port, '0.0.0.0', () => {
  console.log(
    `AR-View API listening on port ${port}. http://0.0.0.0:${port}`
  );
});
