import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Force .env path to project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("🧪 DB ENV CHECK:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? "✅ (hidden)" : "❌ (empty)",
  DB_NAME: process.env.DB_NAME,
});

const sequelize = new Sequelize(
  process.env.DB_NAME || "acacia_bookstore",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true,
    },
  },
);

export default sequelize;
