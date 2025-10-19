import { Model, Optional } from "sequelize";
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
declare class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> implements DiscountAttributes {
    id?: number;
    discount_rate: number | null;
    min_qty: number | null;
    expiry: Date | null;
    stackable: boolean | null;
    message: string | null;
    target_id: number | null;
}
export default Discount;
//# sourceMappingURL=Discount.d.ts.map