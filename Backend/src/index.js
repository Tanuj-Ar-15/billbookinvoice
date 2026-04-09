const path = require("path");

// Load .env before any module reads process.env (e.g. mongoDb.js)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { app } = require("./app");
const requireDir = require("require-dir");
const { Router } = require("express");

const connectDB = require("./config/mongoDb");
const { ensureDefaultAdmin } = require("./bootstrap/ensureDefaultAdmin");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const billRoutes = require("./routes/billRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load all controllers
requireDir("controllers", { recurse: true });

const router = Router();
const port = process.env.PORT || 5000;

app.use("/api/v1", router);

router.use("/auth", authRoutes);
router.use("/item", itemRoutes);
router.use("/bill", billRoutes);
router.use("/admin", adminRoutes);

require("./lib/swagger")(app);

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }

  try {
    await ensureDefaultAdmin();
  } catch (error) {
    console.error("Default admin bootstrap failed:", error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(
      `🚀 Server is running on port ${port} | Environment: ${process.env.ENVIRONMENT}`
    );
    console.log(
      `📘 Swagger Docs available at: http://localhost:${port}/api-docs`
    );
  });
}

start();
