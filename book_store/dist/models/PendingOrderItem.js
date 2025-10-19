import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class PendingOrderItem extends Model {
    id;
    product_name;
    author;
    publisher;
    genre;
    price;
    stock;
    details;
    weight;
    product_image;
    /** 👇 Added */
    pendingOrderId;
}
PendingOrderItem.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_name: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2) },
    stock: { type: DataTypes.STRING },
    details: { type: DataTypes.STRING(2000) },
    weight: { type: DataTypes.STRING },
    product_image: { type: DataTypes.STRING },
    /** 👇 Added foreign key column */
    pendingOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "pending_orders", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
}, {
    sequelize,
    modelName: "pending_orderitem",
    tableName: "pending_orderitems",
    timestamps: false,
});
export default PendingOrderItem;
//# sourceMappingURL=PendingOrderItem.js.map