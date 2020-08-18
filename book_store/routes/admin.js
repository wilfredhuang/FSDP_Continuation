const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroSequelize = require('admin-bro-sequelizejs')
AdminBro.registerAdapter(AdminBroSequelize)

const express = require('express')
const app = express()
const User = require('../models/User.js')
const ensureAuthenticated = require("../helpers/auth");
const adminBro = new AdminBro({
  rootPath: '/admin',
  resources:[{
    resource: User,
    options: {
      parent:{name:"User management"},
      listProperties:['name','email','confirmed','isadmin'],
      editProperties:['name','email','confirmed','isadmin'],
      showProperties:['id','name','email','facebookId','confirmed','isadmin','PhoneNo','address','address1','city','country','postalCode'],
      actions: {new:{isAccessible:false}},
    }
  }],
  branding:{
    companyName:'BookStore',
  }
})

let router = express.Router()
router.use(ensureAuthenticated,(req, res, next) => {
  if (req.user.isadmin == true) {
    next()
  } else {
    res.redirect("https://localhost:5000/user/login")
  }
})
router = AdminBroExpress.buildRouter(adminBro, router)

app.use(adminBro.options.rootPath, router)
module.exports = router;
