import type { UserAttributes } from "../models/User";

declare global {
  namespace Express {
    // Explicitly override the default Express.User type
    interface User extends Omit<UserAttributes, "id"> {
      id: string; // Force ID to be string, matching UUID
    }
  }
}

export {};
