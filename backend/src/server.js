const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./socket/socketAuth");
const socketHandler = require("./socket/socket");
const logger = require("./utils/logger");

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: env.socketCorsOrigins, credentials: true },
    });
    io.use(socketAuth);
    socketHandler(io);
    app.set("io", io);

    server.listen(env.port, () => {
      logger.info("server_started", { port: env.port, environment: env.nodeEnv });
    });
  } catch (error) {
    logger.error("server_startup_failed", { error });
    process.exit(1);
  }
};

startServer();
