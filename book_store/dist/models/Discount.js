import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class Discount extends Model {
    id;
    discount_rate;
    min_qty;
    expiry;
    stackable;
    message;
    target_id;
}
Discount.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    discount_rate: { type: DataTypes.DECIMAL(10, 2) },
    min_qty: { type: DataTypes.INTEGER },
    expiry: { type: DataTypes.DATE },
    stackable: { type: DataTypes.BOOLEAN },
    message: { type: DataTypes.STRING },
    target_id: { type: DataTypes.INTEGER },
}, { sequelize, modelName: "discount", tableName: "discounts", timestamps: false });
export default Discount;
//# sourceMappingURL=Discount.js.map