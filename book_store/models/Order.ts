// models/Order.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  Sequelize
} from "sequelize";
import sequelizeInstance from "../config/db_connection.js";
import User from "./User.js";
import OrderItem from "./OrderItem.js";

const sequelize = sequelizeInstance as unknown as Sequelize;
export class Order extends Model<
  InferAttributes<Order, { omit: "user" | "orderitems" }>,
  InferCreationAttributes<Order, { omit: "id" | "status" | "shippingId" }>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare shippingId: string | null;
  declare totalPrice: number;
  declare status: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;
  declare orderitems?: NonAttribute<OrderItem[]>;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    shippingId: { type: DataTypes.STRING, allowNull: true },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: true },   // ✅ add
    updatedAt: { type: DataTypes.DATE, allowNull: true },   // ✅ add
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
  }
);


// ✅ Associations
// Order.belongsTo(User, { foreignKey: "userId", as: "user" });
// Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderitems" });

export default Order;
