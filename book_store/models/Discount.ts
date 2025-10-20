import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db_connection.js";

export interface DiscountAttributes {
  id?: number;
  discount_rate: number | null;
  min_qty: number | null;
  expiry: Date | null;
  stackable: boolean | null;
  message: string | null;
  target_id: number | null;
  uid: number | null; // 👈 foreign key reference to ProductAdmin.id
}

export type DiscountCreationAttributes = Optional<DiscountAttributes, "id">;

class Discount
  extends Model<DiscountAttributes, DiscountCreationAttributes>
  implements DiscountAttributes
{
  declare id?: number;
  declare discount_rate: number | null;
  declare min_qty: number | null;
  declare expiry: Date | null;
  declare stackable: boolean | null;
  declare message: string | null;
  declare target_id: number | null;
  declare uid: number | null; // 👈 foreign key reference to ProductAdmin.id
}

Discount.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    discount_rate: { type: DataTypes.DECIMAL(10, 2) },
    min_qty: { type: DataTypes.INTEGER },
    expiry: { type: DataTypes.DATE },
    stackable: { type: DataTypes.BOOLEAN },
    message: { type: DataTypes.STRING },
    target_id: { type: DataTypes.INTEGER.UNSIGNED },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "productadmins", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "discount",
    tableName: "discounts",
    timestamps: false,
  },
);

export default Discount;
