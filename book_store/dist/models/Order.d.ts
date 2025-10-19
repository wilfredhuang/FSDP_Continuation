import { Model, Optional } from "sequelize";
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
declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
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
export default Order;
//# sourceMappingURL=Order.d.ts.map