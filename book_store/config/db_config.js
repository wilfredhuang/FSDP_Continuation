// Bring in Sequelize
import Sequelize from "sequelize";
import config from "./db.js";
// loggerHelper
import { logRed, logGreen, logBlue, logYellow, logMagenta, logCyan } from "../helpers/loggerHelper.js";

// Instantiates Sequelize with database parameters
logGreen("Initialize Sequelize");
const sequelize = new Sequelize(config.database, config.username, config.password, {
	host: config.host, // Name or IP address of MySQL server
	dialect: "mysql", // Tells squelize that MySQL is used

	define: {
		timestamps: false, // Don't create timestamp fields in database
	},

	pool: {
		// Database system params, don't need to know
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

export default sequelize;
