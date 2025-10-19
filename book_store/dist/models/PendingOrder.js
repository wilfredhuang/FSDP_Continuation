import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class PendingOrder extends Model {
    id;
    fullName;
    phoneNumber;
    address;
    address1;
    city;
    country;
    postalCode;
    deliverFee;
    subtotalPrice;
    totalPrice;
    dateStart;
    /** 👇 Add this */
    userId;
}
PendingOrder.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    address1: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING },
    deliverFee: { type: DataTypes.DECIMAL(10, 2) },
    subtotalPrice: { type: DataTypes.DECIMAL(10, 2) },
    totalPrice: { type: DataTypes.DECIMAL(10, 2) },
    dateStart: { type: DataTypes.STRING },
    /** 👇 Add this */
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" }, // assumes you have a "users" table
    },
}, {
    sequelize,
    modelName: "pending_order",
    tableName: "pending_orders",
    timestamps: false,
});
export default PendingOrder;
//# sourceMappingURL=PendingOrder.js.map