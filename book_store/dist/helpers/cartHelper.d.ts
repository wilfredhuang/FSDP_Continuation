import { Request } from "express";
import Discount from "../models/Discount.js";
type NumLike = number | string;
export type CartItem = {
    id: number;
    Name: string;
    Price: NumLike;
    Weight: NumLike;
    Quantity: number;
    SubtotalPrice: string;
    SubtotalWeight: string;
};
export type ProductLike = {
    id: number;
    price: NumLike;
    weight: NumLike;
    product_name?: string;
};
export type DiscountLike = {
    discount_rate?: NumLike | null;
    min_qty?: NumLike | null;
} | null;
export declare const checkEmptyCart: (userCart: Record<string, any>) => boolean;
export declare const countCartQty: (userCart: Record<string, any>) => number;
export declare const checkPromo: (couponObj: any) => boolean;
export declare const convertDiscount: (discount: number) => number;
export declare const displayCouponType: (type: string) => string;
export declare const checkShipmentCountrySingapore: (country?: string) => boolean;
export declare const checkProductPriceDiscounted: (qty: number | undefined, price: number | undefined, newSub: number | string | undefined) => string | undefined;
export declare const calculate_cart_total_coupon_savings: (req: Request, coupon_input: string) => Promise<number>;
export declare const calculateDiscountedPrice: (req: Request, quantity: number, price: number, discountRate: number, minQty: number) => {
    originalSubtotalPrice: string;
    discountedSubtotalPrice: string;
    totalDiscount: string;
};
export declare const updateCartItem: (req: Request, cartItem: CartItem, product: ProductLike, discount: DiscountLike, increment: boolean) => void;
export declare const refreshCartCalculations: (req: Request, cart: Record<string, any>) => Promise<void>;
export declare const addNewCartItem: (req: Request, cart: Record<string, any>, product: any, discount: any) => void;
export declare const getProductDiscount: (productId: number) => Promise<Discount | null>;
export declare const processCart: (req: Request, cart: Record<string, any>, product: any, discount: any, increment: boolean) => void;
declare const _default: {
    checkEmptyCart: (userCart: Record<string, any>) => boolean;
    countCartQty: (userCart: Record<string, any>) => number;
    checkPromo: (couponObj: any) => boolean;
    convertDiscount: (discount: number) => number;
    displayCouponType: (type: string) => string;
    checkShipmentCountrySingapore: (country?: string) => boolean;
    checkProductPriceDiscounted: (qty: number | undefined, price: number | undefined, newSub: number | string | undefined) => string | undefined;
    calculate_cart_total_coupon_savings: (req: Request, coupon_input: string) => Promise<number>;
    calculateDiscountedPrice: (req: Request, quantity: number, price: number, discountRate: number, minQty: number) => {
        originalSubtotalPrice: string;
        discountedSubtotalPrice: string;
        totalDiscount: string;
    };
    updateCartItem: (req: Request, cartItem: CartItem, product: ProductLike, discount: DiscountLike, increment: boolean) => void;
    addNewCartItem: (req: Request, cart: Record<string, any>, product: any, discount: any) => void;
    getProductDiscount: (productId: number) => Promise<Discount | null>;
    processCart: (req: Request, cart: Record<string, any>, product: any, discount: any, increment: boolean) => void;
    refreshCartCalculations: (req: Request, cart: Record<string, any>) => Promise<void>;
};
export default _default;
//# sourceMappingURL=cartHelper.d.ts.map