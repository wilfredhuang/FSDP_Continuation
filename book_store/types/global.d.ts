/* --------------------------------------------------------------------------
 *  Global Type Declarations for book_store (FINAL)
 * -------------------------------------------------------------------------- */

import "express";
import "express-session";

/* --------------------------------------------------------------------------
 *  EXPRESS-SESSION AUGMENTATION
 * -------------------------------------------------------------------------- */
declare module "express-session" {
  interface SessionData {
    /** General session fields */
    userId?: string;
    cartId?: string;
    flash?: Record<string, any>;

    /** 🛒 Cart totals and related data */
    userCart?: Record<string, any>;
    coupon_object?: any;
    coupon_type?: string | null;
    cart_subtotal_initial?: number;
    cart_subtotal_final?: number;
    cart_discount_savings?: number;
    cart_coupon_savings?: number;
    cart_shipping_fee?: number;
    cart_grandtotal?: number;

    /** Optional: sometimes used in your code */
    public_coupon?: any;

    /** 🧾 Shipment details (added during checkout) */
    shipment_recipient_name?: string;
    shipment_recipient_phonenum?: string;
    shipment_lineone?: string;
    shipment_linetwo?: string;
    shipment_city?: string;
    shipment_country?: string;
    shipment_postal_code?: string;
  }
}

/* --------------------------------------------------------------------------
 *  EXPRESS GLOBAL AUGMENTATION
 * -------------------------------------------------------------------------- */
declare global {
  namespace Express {
    /** Passport user object stored in req.user */
    interface User {
      id: string;
      email?: string | null;
      username?: string;
      role?: string;
      isadmin?: boolean | null;
      confirmed?: boolean | null;

      /** profile-ish fields already present in your code */
      name?: string | null;
      facebookId?: string | null;
      address?: string | null;
      address1?: string | null;
      city?: string | null;
      country?: string | null;
      postalCode?: string | null;
      PhoneNo?: string | null;

      /** Stripe / misc fields used in productRoutes.ts */
      stripeID?: string | null;
      random?: string | null;
    }

    interface Request {
      /**
       * req.user is optional in some routes, so make it optional again
       * (avoids TS18048 “possibly undefined”)
       */
      user?: User;

      cookies: Record<string, string>;
      signedCookies: Record<string, string>;

      session: Session &
        Partial<SessionData> & {
          destroy(callback: (err?: any) => void): void;
        };

      flash(type: string, message: string): void;
    }

    interface Response {
      flashMessenger: {
        success(msg: string): void;
        error(msg: string): void;
        info(msg: string): void;
        danger(msg: string): void;
      };
    }
  }
}

/* --------------------------------------------------------------------------
 *  PASSPORT MODULE AUGMENTATION
 * -------------------------------------------------------------------------- */
declare module "passport" {
  import { User } from "express";
  interface Authenticator {
    user?: User;
  }
}

/* --------------------------------------------------------------------------
 *  FLASH-MESSENGER MODULE (shim)
 * -------------------------------------------------------------------------- */
declare module "flash-messenger" {
  import { RequestHandler, Response } from "express";
  interface FlashMessenger {
    (
      res: Response,
      type: string,
      message: string,
      icon?: string,
      toast?: boolean
    ): void;
    middleware: RequestHandler;
  }
  const FlashMessenger: FlashMessenger;
  export default FlashMessenger;
}

/* --------------------------------------------------------------------------
 *  QRCODE MODULE DECLARATION
 * -------------------------------------------------------------------------- */
declare module "qrcode" {
  export interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;
  const QRCode: { toDataURL: typeof toDataURL };
  export default QRCode;
}

/* --------------------------------------------------------------------------
 *  ADMINJS-SEQUELIZE DECLARATION
 * -------------------------------------------------------------------------- */
declare module "adminjs-sequelize" {
  import AdminJS from "adminjs";
  import { Database, Resource } from "adminjs";
  export function buildAdminJS(): AdminJS;
  export const Database: typeof Database;
  export const Resource: typeof Resource;
}

/* --------------------------------------------------------------------------
 *  HANDLEBARS IMPORT SUPPORT
 * -------------------------------------------------------------------------- */
declare module "*.handlebars" {
  const template: string;
  export default template;
}

/* --------------------------------------------------------------------------
 *  ENVIRONMENT VARIABLES
 * -------------------------------------------------------------------------- */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Stripe / EasyPost / Twilio */
    EASYPOST_API_TEST_KEY: string;
    STRIPE_SECRET_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_ACCOUNT_AUTHTOKEN: string;
    TWILIO_ACCOUNT_PHONENO: string;
    DEV_PHONENO: string;

    /** App secrets */
    GOOGLE_RECAPTCHA_SECRET_KEY: string;
    GOOGLE_RECAPTCHA_SITE_KEY: string;
    JWT_SECRETKEY: string;
    BOOKSTORE_EMAIL_USERNAME: string;
    BOOKSTORE_EMAIL_PASSWORD: string;

    [key: string]: string | undefined;
  }
}

export {};
