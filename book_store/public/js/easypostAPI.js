const Easypost = require('@easypost/api');
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
const api = new Easypost(apiKey);


function searchAddress(){
    var addressId
    addressId = document.getElementById("addressId")
    api.Address.retrieve(addressId).then(console.log);
}

// function checkDeliveryStatus(){
//     var shippingId;
//     shippingId = document.getElementById("deliveryId");
//     shippingId = "dwadadasdasdafaesef"
//     api.Shipment.retrieve(shippingId).then(console.log);
//     document.getElementById("demo").innerHTML = "Hello World";
//     console.log("===================================")
//     console.log(shippingId)
// }

//const webhook = new api.Webhook({ url: 'http://example.com/deliveryUpdates' });

//webhook.save().then(console.log);
//api.Webhook.retrieve('hook_20de88bbc9784a1c9512332c2c037765').then(console.log);

// const report = new api.Report({
//   type: 'shipment',
//   start_date: '2016-10-01',
//   end_date: '2016-10-31'
// });
// report.save().then(console.log);
