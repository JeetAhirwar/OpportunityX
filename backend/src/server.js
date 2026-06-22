const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`OpportunityX API listening on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
