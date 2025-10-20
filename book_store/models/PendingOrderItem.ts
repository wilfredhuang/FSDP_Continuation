import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

export interface PendingOrderItemAttributes {
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
  pendingOrderId: number | null;
}

export type PendingOrderItemCreationAttributes = Optional<
  PendingOrderItemAttributes,
  "id"
>;

class PendingOrderItem
  extends Model<PendingOrderItemAttributes, PendingOrderItemCreationAttributes>
  implements PendingOrderItemAttributes
{
  declare id?: number;
  declare product_name: string | null;
  declare author: string | null;
  declare publisher: string | null;
  declare genre: string | null;
  declare price: number | null;
  declare stock: string | null;
  declare details: string | null;
  declare weight: string | null;
  declare product_image: string | null;
  declare pendingOrderId: number | null;
}

PendingOrderItem.init(
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
    price: { type: DataTypes.DECIMAL(10, 2) },
    stock: { type: DataTypes.STRING },
    details: { type: DataTypes.STRING(2000) },
    weight: { type: DataTypes.STRING },
    product_image: { type: DataTypes.STRING },
    pendingOrderId: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ must match pending_orders.id
      allowNull: true,
      references: { model: "pending_orders", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "pending_orderitem",
    tableName: "pending_orderitems",
    timestamps: false,
  },
);

export default PendingOrderItem;
