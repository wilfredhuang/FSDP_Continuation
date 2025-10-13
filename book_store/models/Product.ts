import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";
export interface ProductAttributes {
  id?: number;
  product_name: string | null;
  author: string | null;
  publisher: string | null;
  genre: string | null;
  price: string | null;
  stock: string | null;
  details: string | null;
}

export type ProductCreationAttributes = Optional<ProductAttributes, "id">;

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id?: number;
  public product_name!: string | null;
  public author!: string | null;
  public publisher!: string | null;
  public genre!: string | null;
  public price!: string | null;
  public stock!: string | null;
  public details!: string | null;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_name: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    stock: { type: DataTypes.STRING },
    details: { type: DataTypes.STRING(2000) },
  },
  { sequelize, modelName: "product", tableName: "products", timestamps: false }
);

export default Product;
