const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Product = db.define('product',
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
    });


module.exports = Product;
