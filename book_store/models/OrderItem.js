const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const OrderItem = db.define('orderitem',
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
            type: Sequelize.DECIMAL(10,2)
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
        product_image: {
            type: Sequelize.STRING
        },
    });


module.exports = OrderItem;