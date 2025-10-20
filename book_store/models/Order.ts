import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

export interface OrderAttributes {
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
  shippingId: string | null;
  addressId: string | null;
  trackingId: string | null;
  trackingCode: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  deliveryStatus: string | null;
  userId: number | null;
}

export type OrderCreationAttributes = Optional<OrderAttributes, "id">;

class Order extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes {
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
  declare shippingId: string | null;
  declare addressId: string | null;
  declare trackingId: string | null;
  declare trackingCode: string | null;
  declare dateStart: string | null;
  declare dateEnd: string | null;
  declare deliveryStatus: string | null;
  declare userId: number | null;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,  // ✅ unsigned primary key
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
    shippingId: { type: DataTypes.STRING },
    addressId: { type: DataTypes.STRING },
    trackingId: { type: DataTypes.STRING },
    trackingCode: { type: DataTypes.STRING },
    dateStart: { type: DataTypes.STRING },
    dateEnd: { type: DataTypes.STRING },
    deliveryStatus: { type: DataTypes.STRING },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,   // ✅ must also be UNSIGNED
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  { sequelize, modelName: "order", tableName: "orders", timestamps: false }
);

export default Order;
