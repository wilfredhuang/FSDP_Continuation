const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Coupon = db.define('coupon',
    {
        // Code for the coupon code to trigger

        code: {
            type: Sequelize.STRING
        },

        // the type of discount it applies for (OVERALL, SHIPPING ONLY, SUBTOTAL ONLY) OVERALL, SHIP, SUB
        type: {
            type: Sequelize.STRING
        },

        // Discount Rate, in decimals (e.g 0.25)
        discount: {
            type: Sequelize.DECIMAL(3,2)
        },


        // Maximum discounted amount e.g Save 10% off orders (max: $10 off) so if user buys $200 worth, it is $190
        limit: {
            type: Sequelize.DECIMAL(10,2)
        },

        public: {
            type: Sequelize.BOOLEAN
        },

        message: {
            type: Sequelize.STRING
        },

        expiry: {
            type: Sequelize.DATE
        }

    });


module.exports = Coupon;