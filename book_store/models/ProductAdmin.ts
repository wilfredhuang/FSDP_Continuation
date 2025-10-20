import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

export interface ProductAdminAttributes {
  id?: number;
  product_name: string | null;
  author: string | null;
  publisher: string | null;
  genre: string | null;
  price: string | null;
  stock: string | null;
  details: string | null;
  weight: string | null;
  rating: string | null;
  product_image: string | null;
}

export type ProductAdminCreationAttributes = Optional<
  ProductAdminAttributes,
  "id"
>;

class ProductAdmin
  extends Model<ProductAdminAttributes, ProductAdminCreationAttributes>
  implements ProductAdminAttributes
{
  public id?: number;
  public product_name!: string | null;
  public author!: string | null;
  public publisher!: string | null;
  public genre!: string | null;
  public price!: string | null;
  public stock!: string | null;
  public details!: string | null;
  public weight!: string | null;
  public rating!: string | null;
  public product_image!: string | null;
}

ProductAdmin.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
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
  },
  {
    sequelize,
    modelName: "productadmin",
    tableName: "productadmins",
    timestamps: false,
  },
);

export default ProductAdmin;
