import dotenv from 'dotenv';
dotenv.config();

export default {
	host: process.env.MYSQLDB_HOST,
	database: process.env.MYSQLDB_DATABASE,
	username: process.env.MYSQLDB_USERNAME,
	password: process.env.MYSQLDB_PASSWORD,
};


//console.log(`Test this ${process.env.MYSQLDB_USERNAME}`);