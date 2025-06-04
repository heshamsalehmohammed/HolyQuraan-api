const dotenv = require("dotenv");
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const winston = require("winston");
const express = require("express");
const http = require("http");
const config = require("config");

const app = express();

async function start() {
  // Init logging first
  require("./startup/logging")();

  // Basic config and middleware
  require("./startup/config")();
  require("./startup/cors")(app);

  // ✅ Await DB connection and handle failures
  try {
    await require("./startup/db")();
  } catch (err) {
    winston.error("❌ Failed to connect to MongoDB");
    winston.error(err.stack || err.message);
    process.exit(1);
  }

  // Continue only if DB is connected
  require("./startup/validation")();
  require("./startup/routes")(app);

  const server = http.createServer(app);

  server.on("error", (err) => {
    winston.error(`Server error: ${err.message}`);
  });

  const port = process.env.PORT || config.get("port") || 8080;
  server.listen(port, () => winston.info(`✅ Listening on port ${port}...`));
}

start();
