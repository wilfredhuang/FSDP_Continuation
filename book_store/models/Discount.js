const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Discount = db.define('discount',
    {
        discount_rate: {
            type: Sequelize.DECIMAL(10,2)
        },

        min_qty: {
            type: Sequelize.INTEGER
        },

        expiry: {
            type:Sequelize.DATE
        },

        stackable: {
            type:Sequelize.BOOLEAN
        },

        message: {
            type:Sequelize.STRING
        },

        target_id: {
            type:Sequelize.INTEGER
        }

        
    });


module.exports = Discount;