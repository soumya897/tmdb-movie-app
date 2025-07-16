const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnection = require("./database/dbConnection");
const app = express();
const authRoutes = require("./routes/auth.routes");
dotenv.config({ path: "./.env" }); // Load environment variables

app.use(
  cors({
    origin: [process.env.FRONTEND_URL], // Allow frontend
    methods: ["POST", "GET", "PATCH", "DELETE"], // Allowed methods
    credentials: true, // Enable cookies/auth headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for auth routes
app.use("/api/auth", authRoutes);

dbConnection();

module.exports = app;
