const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const ProductAdmin = db.define('productadmin',
    {
        product_name: {
            type: Sequelize.STRING
        },
        author: {
            type: Sequelize.STRING
        },
        publisher: {
            type: Sequelize.STRING
        },
        genre: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.STRING
        },
        stock: {
            type: Sequelize.STRING
        },
        details: {
            type: Sequelize.STRING(2000)
        },
        weight: {
            type: Sequelize.STRING
        },
        rating:{
            type: Sequelize.STRING
        },
        product_image: {
            type: Sequelize.STRING
        },
    });


module.exports = ProductAdmin;