import { UserAttributes } from "../models/User";

declare global {
  namespace Express {
    // make Express.User identical to our model attributes
    interface User extends UserAttributes {}
  }
}
