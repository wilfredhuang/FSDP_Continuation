import { Sequelize } from "sequelize";
import config from "./db.js";
import {
  logRed,
  logGreen,
  logBlue,
  logYellow,
  logMagenta,
  logCyan,
} from "../helpers/loggerHelper.js";

logGreen("Initialize Sequelize connection");

const mySQLDB = new Sequelize(
  config.database || "",
  config.username || "",
  config.password || "",
  {
    host: config.host || "localhost",   // ✅ fallback prevents 'undefined'
    dialect: "mysql",
    define: { timestamps: false },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);


export default mySQLDB;
