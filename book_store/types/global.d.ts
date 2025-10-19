/* --------------------------------------------------------------------------
 *  Global Type Declarations for book_store (final unified version)
 * -------------------------------------------------------------------------- */

import "express";
import "express-session";

/* --------------------------------------------------------------------------
 *  EXPRESS & SESSION AUGMENTATION
 * -------------------------------------------------------------------------- */
declare module "express-session" {
  interface SessionData {
    userId?: string;
    cartId?: string;
    flash?: Record<string, any>;
  }
}

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
    }

    interface Request {
      user?: User;
      session: Session & Partial<SessionData>;
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
 *  FLASH-MESSENGER MODULE (merged shim)
 * -------------------------------------------------------------------------- */
declare module "flash-messenger" {
  import { RequestHandler, Response } from "express";

  interface FlashMessenger {
    (res: Response, type: string, message: string, icon?: string, toast?: boolean): void;
    middleware: RequestHandler; // 👈 app.use(FlashMessenger.middleware)
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

  const QRCode: {
    toDataURL: typeof toDataURL;
  };

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
 *  EXPORT GLOBALS
 * -------------------------------------------------------------------------- */
// export {};


//
// === Added Express / Passport / Session Typings (for userRoutes.ts compatibility) ===
//

import "express-session";
import "express";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_RECAPTCHA_SECRET_KEY: string;
      GOOGLE_RECAPTCHA_SITE_KEY: string;
      JWT_SECRETKEY: string;
      BOOKSTORE_EMAIL_USERNAME: string;
      BOOKSTORE_EMAIL_PASSWORD: string;
    }
  }

  namespace Express {
interface User {
  id: string;
  email: string;
  name?: string | null;
  facebookId?: string | null;
  isadmin?: boolean;
  confirmed?: boolean;
  address?: string | null;
  address1?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  PhoneNo?: string | null;
}


    interface Request {
      user?: User;
      cookies: Record<string, string>;
      signedCookies: Record<string, string>;
      session: {
        userCart?: Record<string, any>;
        coupon_object?: any;
        coupon_type?: string | null;
        cart_subtotal_initial?: number;
        cart_subtotal_final?: number;
        cart_discount_savings?: number;
        cart_coupon_savings?: number;
        cart_shipping_fee?: number;
        cart_grandtotal?: number;
        destroy(callback: (err?: any) => void): void;
      };
    }
  }
}

export {}
