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
  public id?: number;
  public fullName!: string | null;
  public phoneNumber!: string | null;
  public address!: string | null;
  public address1!: string | null;
  public city!: string | null;
  public country!: string | null;
  public postalCode!: string | null;
  public deliverFee!: number | null;
  public subtotalPrice!: number | null;
  public totalPrice!: number | null;
  public shippingId!: string | null;
  public addressId!: string | null;
  public trackingId!: string | null;
  public trackingCode!: string | null;
  public dateStart!: string | null;
  public dateEnd!: string | null;
  public deliveryStatus!: string | null;
  public userId!: number | null;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
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
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  { sequelize, modelName: "order", tableName: "orders", timestamps: false }
);

export default Order;
