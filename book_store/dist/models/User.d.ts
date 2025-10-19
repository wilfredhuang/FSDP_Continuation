import { Model, Optional } from "sequelize";
export interface UserAttributes {
    id: string;
    name: string | null;
    email: string | null;
    password: string | null;
    confirmed: boolean | null;
    isadmin: boolean | null;
    facebookId: string | null;
    facebookToken: string | null;
    PhoneNo: string | null;
    address: string | null;
    address1: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
    stripeID: string | null;
}
export type UserCreationAttributes = Optional<UserAttributes, "id">;
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    name: string | null;
    email: string | null;
    password: string | null;
    confirmed: boolean | null;
    isadmin: boolean | null;
    facebookId: string | null;
    facebookToken: string | null;
    PhoneNo: string | null;
    address: string | null;
    address1: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
    stripeID: string | null;
}
export default User;
//# sourceMappingURL=User.d.ts.map