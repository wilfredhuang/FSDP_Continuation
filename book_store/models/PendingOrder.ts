import { DataTypes, Model, Optional } from "sequelize";
import db from "../config/db_config";

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
}

export type PendingOrderCreationAttributes = Optional<PendingOrderAttributes, "id">;

class PendingOrder extends Model<PendingOrderAttributes, PendingOrderCreationAttributes>
  implements PendingOrderAttributes {
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
  public dateStart!: string | null;
}

PendingOrder.init(
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
    dateStart: { type: DataTypes.STRING },
  },
  { sequelize: db, modelName: "pending_order", tableName: "pending_orders", timestamps: false }
);

export default PendingOrder;
