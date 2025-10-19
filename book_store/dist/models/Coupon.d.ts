import { Model, Optional } from "sequelize";
export interface CouponAttributes {
    id?: number;
    code: string | null;
    type: string | null;
    discount: number | null;
    limit: number | null;
    public: boolean | null;
    message: string | null;
    expiry: Date | null;
}
export type CouponCreationAttributes = Optional<CouponAttributes, "id">;
declare class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
    id?: number;
    code: string | null;
    type: string | null;
    discount: number | null;
    limit: number | null;
    public: boolean | null;
    message: string | null;
    expiry: Date | null;
}
export default Coupon;
//# sourceMappingURL=Coupon.d.ts.map