# AR View Dummy API

## Description

This is a dummy API for AR View project. It is a RESTful API that provides endpoints for the AR View project. The API is built using Express.js and SQlite3 as the database. It also uses Socket.io for real-time communication between the client and the server.

## Installation

1. Clone the repository
2. Copy the `.env.example` file to `.env` and update the values
3. Run `npm install` to install the dependencies
4. Run `npm run dev` to start the server
5. The server will be running on `http://localhost:{PORT}`
6. The API documentation can be found at `http://localhost:{PORT}/api-docs`

## Development

- Run `npm run dev` to start the server in development mode
- Run `npm run build` to build the project
- Run `npm start` to start the server in production mode
- Run `npm run lint` to lint the project
- Run `npm run db` to open the SQlite3 database with Drizzle Studio

## Libraries Used

- Express.js
- SQlite3
- Socket.io
- DrizzleORM

## Folder Structure

- `models/`: Contains the database models
- `routes/`: Contains the API routes
- `utils/`: Contains utility functions
- `services/`: Contains the services that interact with the database
- `index.ts`: Entry point of the application
