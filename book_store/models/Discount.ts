import { DataTypes, Model, Optional } from "sequelize";
import db from "../config/db_config";

export interface DiscountAttributes {
  id?: number;
  discount_rate: number | null;
  min_qty: number | null;
  expiry: Date | null;
  stackable: boolean | null;
  message: string | null;
  target_id: number | null;
}

export type DiscountCreationAttributes = Optional<DiscountAttributes, "id">;

class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> implements DiscountAttributes {
  public id?: number;
  public discount_rate!: number | null;
  public min_qty!: number | null;
  public expiry!: Date | null;
  public stackable!: boolean | null;
  public message!: string | null;
  public target_id!: number | null;
}

Discount.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    discount_rate: { type: DataTypes.DECIMAL(10, 2) },
    min_qty: { type: DataTypes.INTEGER },
    expiry: { type: DataTypes.DATE },
    stackable: { type: DataTypes.BOOLEAN },
    message: { type: DataTypes.STRING },
    target_id: { type: DataTypes.INTEGER },
  },
  { sequelize: db, modelName: "discount", tableName: "discounts", timestamps: false }
);

export default Discount;
