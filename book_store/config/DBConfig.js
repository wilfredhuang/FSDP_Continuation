// Bring in Sequelize
import Sequelize from "sequelize";

//const Sequelize = require("sequelize");
// Bring in db.js which contains database name, username and password
//const db = require("./db");

// Instantiates Sequelize with database parameters
const sequelize = new Sequelize("book_store", "itp211", "itp211", {
	host: "localhost", // Name or IP address of MySQL server
	dialect: "mysql", // Tells squelize that MySQL is used
	operatorsAliases: false,

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
