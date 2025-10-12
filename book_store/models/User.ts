import { DataTypes, Model, Optional } from "sequelize";
import db from "../config/db_config";

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
  public id!: string;
  public name!: string | null;
  public email!: string | null;
  public password!: string | null;
  public confirmed!: boolean | null;
  public isadmin!: boolean | null;
  public facebookId!: string | null;
  public facebookToken!: string | null;
  public PhoneNo!: string | null;
  public address!: string | null;
  public address1!: string | null;
  public city!: string | null;
  public country!: string | null;
  public postalCode!: string | null;
  public stripeID!: string | null;
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
  { sequelize: db, modelName: "user", tableName: "users", timestamps: false }
);

export default User;

