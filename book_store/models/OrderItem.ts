import { DataTypes, Model, Optional } from "sequelize";
import db from "../config/db_config";

export interface OrderItemAttributes {
  id?: number;
  product_name: string | null;
  author: string | null;
  publisher: string | null;
  genre: string | null;
  price: number | null;
  stock: string | null;
  details: string | null;
  weight: string | null;
  product_image: string | null;
}

export type OrderItemCreationAttributes = Optional<OrderItemAttributes, "id">;

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id?: number;
  public product_name!: string | null;
  public author!: string | null;
  public publisher!: string | null;
  public genre!: string | null;
  public price!: number | null;
  public stock!: string | null;
  public details!: string | null;
  public weight!: string | null;
  public product_image!: string | null;
}

OrderItem.init(
  {
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
  },
  { sequelize: db, modelName: "orderitem", tableName: "orderitems", timestamps: false }
);

export default OrderItem;
