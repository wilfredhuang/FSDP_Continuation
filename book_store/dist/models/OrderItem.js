import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class OrderItem extends Model {
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
    orderId;
}
OrderItem.init({
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
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
}, { sequelize, modelName: "order_item", tableName: "order_items", timestamps: false });
export default OrderItem;
//# sourceMappingURL=OrderItem.js.map