const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./socket/socketAuth");
const socketHandler = require("./socket/socket");

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
      console.log(`OpportunityX API listening on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
