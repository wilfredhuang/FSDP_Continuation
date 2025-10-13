import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

// ----- Interface for columns -----
export interface UserAttributes {
  id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  confirmed: boolean | null;
  isadmin: boolean | null;
  facebookId: string | null;
  facebookToken: string | null;
  PhoneNo: string | null;
  address: string | null;
  address1: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  stripeID: string | null;
}

// ----- Interface for creation -----
export type UserCreationAttributes = Optional<UserAttributes, "id">;

// ----- Class Model -----
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  // ❌ REMOVE all public fields!
  // ✅ TypeScript will infer from interface
  declare id: string;
  declare name: string | null;
  declare email: string | null;
  declare password: string | null;
  declare confirmed: boolean | null;
  declare isadmin: boolean | null;
  declare facebookId: string | null;
  declare facebookToken: string | null;
  declare PhoneNo: string | null;
  declare address: string | null;
  declare address1: string | null;
  declare city: string | null;
  declare country: string | null;
  declare postalCode: string | null;
  declare stripeID: string | null;
}

// ----- Model Initialization -----
User.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    confirmed: { type: DataTypes.BOOLEAN },
    isadmin: { type: DataTypes.BOOLEAN },
    facebookId: { type: DataTypes.STRING },
    facebookToken: { type: DataTypes.STRING },
    PhoneNo: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    address1: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING },
    stripeID: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "user", tableName: "users", timestamps: false }
);

export default User;
