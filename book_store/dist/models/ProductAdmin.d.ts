import { Model, Optional } from "sequelize";
export interface ProductAdminAttributes {
    id?: number;
    product_name: string | null;
    author: string | null;
    publisher: string | null;
    genre: string | null;
    price: string | null;
    stock: string | null;
    details: string | null;
    weight: string | null;
    rating: string | null;
    product_image: string | null;
}
export type ProductAdminCreationAttributes = Optional<ProductAdminAttributes, "id">;
declare class ProductAdmin extends Model<ProductAdminAttributes, ProductAdminCreationAttributes> implements ProductAdminAttributes {
    id?: number;
    product_name: string | null;
    author: string | null;
    publisher: string | null;
    genre: string | null;
    price: string | null;
    stock: string | null;
    details: string | null;
    weight: string | null;
    rating: string | null;
    product_image: string | null;
}
export default ProductAdmin;
//# sourceMappingURL=ProductAdmin.d.ts.map