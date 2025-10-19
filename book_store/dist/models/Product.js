import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class Product extends Model {
    id;
    product_name;
    author;
    publisher;
    genre;
    price;
    stock;
    details;
}
Product.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_name: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    stock: { type: DataTypes.STRING },
    details: { type: DataTypes.STRING(2000) },
}, { sequelize, modelName: "product", tableName: "products", timestamps: false });
export default Product;
//# sourceMappingURL=Product.js.map