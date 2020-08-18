const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Order = db.define('order',
    {
        fullName: {type: Sequelize.STRING},
        phoneNumber: {type: Sequelize.STRING},
        address: {type: Sequelize.STRING},
        address1: {type: Sequelize.STRING},
        city: {type: Sequelize.STRING},
        country:{type: Sequelize.STRING},
        postalCode: {type: Sequelize.STRING},
        //add subtotal here
        deliverFee:{type: Sequelize.DECIMAL(10,2)},
        subtotalPrice:{type: Sequelize.DECIMAL(10,2)},
        totalPrice:{type: Sequelize.DECIMAL(10,2)},    
        shippingId:{type:Sequelize.STRING},
        addressId:{type: Sequelize.STRING},
        trackingId:{type: Sequelize.STRING},
        trackingCode:{type: Sequelize.STRING},
        dateStart:{type: Sequelize.DATE}, //rename this to order date
        dateEnd:{type:Sequelize.DATE}, //remove this
        deliveryStatus:{type:Sequelize.STRING},
    });

module.exports = Order;