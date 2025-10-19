import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

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
  orderId: number | null;  // ✅ foreign key to order
}

export type OrderItemCreationAttributes = Optional<OrderItemAttributes, "id">;

class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes {
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
  public orderId!: number | null;
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
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "orders", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  { sequelize, modelName: "order_item", tableName: "order_items", timestamps: false }
);

export default OrderItem;
