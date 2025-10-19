import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
// ----- Class Model -----
class User extends Model {
}
// ----- Model Initialization -----
User.init({
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
}, { sequelize, modelName: "user", tableName: "users", timestamps: false });
export default User;
//# sourceMappingURL=User.js.map