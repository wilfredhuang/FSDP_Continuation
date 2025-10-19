import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db_connection.js";
class ProductAdmin extends Model {
    id;
    product_name;
    author;
    publisher;
    genre;
    price;
    stock;
    details;
    weight;
    rating;
    product_image;
}
ProductAdmin.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_name: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    stock: { type: DataTypes.STRING },
    details: { type: DataTypes.STRING(2000) },
    weight: { type: DataTypes.STRING },
    rating: { type: DataTypes.STRING },
    product_image: { type: DataTypes.STRING },
}, { sequelize, modelName: "productadmin", tableName: "productadmins", timestamps: false });
export default ProductAdmin;
//# sourceMappingURL=ProductAdmin.js.map