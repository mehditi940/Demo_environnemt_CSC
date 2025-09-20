import "dotenv/config";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "AR-View API Documentation",
      version: "0.1.0",
      description:
        "This is a dummy API for AR View project. It is a RESTful API that provides endpoints for the AR View project. The API is built using Express.js and SQlite3 as the database. It also uses Socket.io for real-time communication between the client and the server.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
      {
        url: process.env.API_URL,
      },
    ],
  },
  apis: ["./routes/**/*.ts", "index.ts"],
};

export const swaggerSpecs = swaggerJsdoc(options);
  