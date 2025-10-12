// types/express.d.ts
import type { UserAttributes } from "../models/User";

declare global {
  namespace Express {
    interface User extends Omit<UserAttributes, "id"> {
      id: string; // override to UUID string
    }
  }
}

export {};
