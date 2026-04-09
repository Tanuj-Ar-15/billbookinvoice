const mongoose = require("mongoose");
const dns = require("node:dns");

/**
 * Read URI at connect time — not at module load — so dotenv has already run.
 */
function getMongoUri() {
  return (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    ""
  ).trim();
}

function applyDnsServers() {
  const fromEnv = process.env.MONGO_DNS_SERVERS;
  const servers = fromEnv
    ? fromEnv.split(",").map((s) => s.trim()).filter(Boolean)
    : ["8.8.8.8", "8.8.4.4", "1.1.1.1"];
  if (servers.length === 0) return;
  try {
    dns.setServers(servers);
    if (process.env.NODE_ENV !== "production") {
      console.log("[mongo] DNS resolvers:", dns.getServers().join(", "));
    }
  } catch (e) {
    console.warn("[mongo] DNS setServers failed:", e.message);
  }
}

/**
 * Establish connection to MongoDB. Throws on failure (no silent retry).
 */
const connectDB = async () => {
  applyDnsServers();

  const mongoUri = getMongoUri();
  if (!mongoUri) {
    throw new Error(
      "MongoDB URI missing. Set MONGO_URI (or MONGODB_URI / DATABASE_URL) in .env at project root."
    );
  }

  const timeout = Number.parseInt(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || "30000",
    10
  );

  const mongooseOptions = {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS:
      Number.isFinite(timeout) && timeout > 0 ? timeout : 30000,
    socketTimeoutMS: 45000,
  };

  if (process.env.MONGO_FAMILY === "4" || process.env.MONGO_FAMILY === "6") {
    mongooseOptions.family = Number.parseInt(process.env.MONGO_FAMILY, 10);
  }

  await mongoose.connect(mongoUri, mongooseOptions);

  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected.");
  });

  process.once("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed (SIGINT)");
    process.exit(0);
  });
};

module.exports = connectDB;
