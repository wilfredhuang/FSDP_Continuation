import { Model, Optional } from "sequelize";
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
    orderId: number | null;
}
export type OrderItemCreationAttributes = Optional<OrderItemAttributes, "id">;
declare class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
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
    orderId: number | null;
}
export default OrderItem;
//# sourceMappingURL=OrderItem.d.ts.map