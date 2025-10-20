import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

export interface PendingOrderAttributes {
  id?: number;
  fullName: string | null;
  phoneNumber: string | null;
  address: string | null;
  address1: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  deliverFee: number | null;
  subtotalPrice: number | null;
  totalPrice: number | null;
  dateStart: string | null;
  userId: number | null;
}

export type PendingOrderCreationAttributes = Optional<
  PendingOrderAttributes,
  "id"
>;

class PendingOrder
  extends Model<PendingOrderAttributes, PendingOrderCreationAttributes>
  implements PendingOrderAttributes
{
  declare id?: number;
  declare fullName: string | null;
  declare phoneNumber: string | null;
  declare address: string | null;
  declare address1: string | null;
  declare city: string | null;
  declare country: string | null;
  declare postalCode: string | null;
  declare deliverFee: number | null;
  declare subtotalPrice: number | null;
  declare totalPrice: number | null;
  declare dateStart: string | null;
  declare userId: number | null;
}

PendingOrder.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
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
    dateStart: { type: DataTypes.STRING },
    userId: {
      type: DataTypes.STRING(36), // ✅ must match User.id type
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "pending_order",
    tableName: "pending_orders",
    timestamps: false,
  },
);

export default PendingOrder;
