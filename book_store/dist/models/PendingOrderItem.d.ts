import { Model, Optional } from "sequelize";
export interface PendingOrderItemAttributes {
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
    /** 👇 Add foreign key reference */
    pendingOrderId: number | null;
}
export type PendingOrderItemCreationAttributes = Optional<PendingOrderItemAttributes, "id">;
declare class PendingOrderItem extends Model<PendingOrderItemAttributes, PendingOrderItemCreationAttributes> implements PendingOrderItemAttributes {
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
    /** 👇 Added */
    pendingOrderId: number | null;
}
export default PendingOrderItem;
//# sourceMappingURL=PendingOrderItem.d.ts.map