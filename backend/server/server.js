const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

// Connect to MongoDB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  });
});
