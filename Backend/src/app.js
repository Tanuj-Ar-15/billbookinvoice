const express = require("express");
const os = require("os");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());

const frontendOrigin =
  process.env.FRONTEND_ORIGIN ||
  process.env.CORS_ORIGIN ||
  "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(fileUpload());




app.use((req, res, next) => {
    if (Object.keys(req.body || {}).length > 0) {
        console.log("📍 Route:", `${req.method} ${req.originalUrl}`);
        console.log("📦 Request Body:", req.body);
    }
    next();
});


module.exports = { app };
