/**
 * ============================================================
 * 📘 ACACIA BOOKSTORE SERVER (TypeScript Edition)
 * ------------------------------------------------------------
 * This file bootstraps the Express web app, configures sessions,
 * authentication, view engine, and routes.
 *
 * New Dev Quickstart:
 *  1. Configure .env (see README)
 *  2. Run `npm run dev`
 *  3. Visit https://localhost:5000
 * ============================================================
 */
import "express-session";
declare module "express-session" {
    interface SessionData {
        userCart?: Record<string, any>;
        coupon_object?: any;
        coupon_type?: string | null;
        cart_subtotal_initial?: number;
        cart_subtotal_final?: number;
        cart_discount_savings?: number;
        cart_coupon_savings?: number;
        cart_shipping_fee?: number;
        cart_grandtotal?: number;
        shipment_lineone?: string;
        shipment_country?: string;
        public_coupon?: any;
    }
}
import "./config/passport.ts";
declare const app: import("express-serve-static-core").Express;
export default app;
//# sourceMappingURL=app.d.ts.map