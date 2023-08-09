import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";

AdminJS.registerAdapter(AdminJSSequelize);

import express from "express";
const app = express();
import User from "../models/User.js";
import ensureAuthenticated from "../helpers/auth.js";

const adminJS = new AdminJS({
	rootPath: "/admin",
	resources: [
		{
			resource: User,
			options: {
				parent: { name: "User management" },
				listProperties: ["name", "email", "confirmed", "isadmin"],
				editProperties: ["name", "email", "confirmed", "isadmin"],
				showProperties: [
					"id",
					"name",
					"email",
					"facebookId",
					"confirmed",
					"isadmin",
					"PhoneNo",
					"address",
					"address1",
					"city",
					"country",
					"postalCode",
				],
				actions: { new: { isAccessible: false } },
			},
		},
	],
	branding: {
		companyName: "BookStore123",
	},
});

var router = express.Router();
router.use(ensureAuthenticated, (req, res, next) => {
	if (req.user.isadmin == true) {
		next();
	} else {
		res.redirect("https://localhost:5000/user/login");
	}
});

router = AdminJSExpress.buildRouter(adminJS, router);

app.use(adminJS.options.rootPath, router);
export { router };
