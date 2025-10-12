import dotenv from "dotenv";
dotenv.config();

export interface DBConfig {
  host: string | undefined;
  database: string | undefined;
  username: string | undefined;
  password: string | undefined;
}

const config: DBConfig = {
  host: process.env.MYSQLDB_HOST,
  database: process.env.MYSQLDB_DATABASE,
  username: process.env.MYSQLDB_USERNAME,
  password: process.env.MYSQLDB_PASSWORD,
};

export default config;
