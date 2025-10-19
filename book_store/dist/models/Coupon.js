import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class Coupon extends Model {
    id;
    code;
    type;
    discount;
    limit;
    public;
    message;
    expiry;
}
Coupon.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    discount: { type: DataTypes.DECIMAL(3, 2) },
    limit: { type: DataTypes.DECIMAL(10, 2) },
    public: { type: DataTypes.BOOLEAN },
    message: { type: DataTypes.STRING },
    expiry: { type: DataTypes.DATE },
}, { sequelize, modelName: "coupon", tableName: "coupons", timestamps: false });
export default Coupon;
//# sourceMappingURL=Coupon.js.map