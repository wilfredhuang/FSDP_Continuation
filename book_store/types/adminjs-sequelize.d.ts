declare module "@adminjs/sequelize" {
  import { Database, Resource } from "adminjs";
  export { Database, Resource };
  const AdminJSSequelize: {
    Database: typeof Database;
    Resource: typeof Resource;
  };
  export default AdminJSSequelize;
}
