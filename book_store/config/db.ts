import dotenv from "dotenv";
dotenv.config();

export interface DBConfig {
  host: string | undefined;
  database: string | undefined;
  username: string | undefined;
  password: string | undefined;
}

const config: DBConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

export default config;
