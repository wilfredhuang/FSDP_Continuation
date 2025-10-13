import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

export interface CouponAttributes {
  id?: number;
  code: string | null;
  type: string | null; // e.g. "OVERALL", "SHIP", "SUB"
  discount: number | null; // decimal e.g. 0.25
  limit: number | null; // max discount
  public: boolean | null;
  message: string | null;
  expiry: Date | null;
}

export type CouponCreationAttributes = Optional<CouponAttributes, "id">;

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id?: number;
  public code!: string | null;
  public type!: string | null;
  public discount!: number | null;
  public limit!: number | null;
  public public!: boolean | null;
  public message!: string | null;
  public expiry!: Date | null;
}

Coupon.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    discount: { type: DataTypes.DECIMAL(3, 2) },
    limit: { type: DataTypes.DECIMAL(10, 2) },
    public: { type: DataTypes.BOOLEAN },
    message: { type: DataTypes.STRING },
    expiry: { type: DataTypes.DATE },
  },
  { sequelize, modelName: "coupon", tableName: "coupons", timestamps: false }
);

export default Coupon;
