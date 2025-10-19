import { Model, Optional } from "sequelize";
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
    /** 👇 Add this */
    userId: number | null;
}
export type PendingOrderCreationAttributes = Optional<PendingOrderAttributes, "id">;
declare class PendingOrder extends Model<PendingOrderAttributes, PendingOrderCreationAttributes> implements PendingOrderAttributes {
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
    /** 👇 Add this */
    userId: number | null;
}
export default PendingOrder;
//# sourceMappingURL=PendingOrder.d.ts.map