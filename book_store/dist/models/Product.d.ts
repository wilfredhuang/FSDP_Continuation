import { Model, Optional } from "sequelize";
export interface ProductAttributes {
    id?: number;
    product_name: string | null;
    author: string | null;
    publisher: string | null;
    genre: string | null;
    price: string | null;
    stock: string | null;
    details: string | null;
}
export type ProductCreationAttributes = Optional<ProductAttributes, "id">;
declare class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    id?: number;
    product_name: string | null;
    author: string | null;
    publisher: string | null;
    genre: string | null;
    price: string | null;
    stock: string | null;
    details: string | null;
}
export default Product;
//# sourceMappingURL=Product.d.ts.map