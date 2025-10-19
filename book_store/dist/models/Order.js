import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class Order extends Model {
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
    shippingId;
    addressId;
    trackingId;
    trackingCode;
    dateStart;
    dateEnd;
    deliveryStatus;
    userId;
}
Order.init({
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
    shippingId: { type: DataTypes.STRING },
    addressId: { type: DataTypes.STRING },
    trackingId: { type: DataTypes.STRING },
    trackingCode: { type: DataTypes.STRING },
    dateStart: { type: DataTypes.STRING },
    dateEnd: { type: DataTypes.STRING },
    deliveryStatus: { type: DataTypes.STRING },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
}, { sequelize, modelName: "order", tableName: "orders", timestamps: false });
export default Order;
//# sourceMappingURL=Order.js.map