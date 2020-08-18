const request = require('request');
const fetch = require('node-fetch');

// fetch('https://github.com/')
//     .then(res => res.text())
//     .then(body => console.log(body));
// function currencyConverter (){
//     request('https://api.exchangeratesapi.io/latest', function (error, response, body) {
//         // console.error('error:', error); // Print the error if one occurred
//         // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         // console.log('body:', body); // Print the HTML for the Google homepage.
//         return body
//       });
// }
function currencyConverter (){
    fetch('https://api.exchangeratesapi.io/latest?symbols=USD,GBP')
    .then(res => res.json())
    .then(json => console.log(json));
}
console.log(currencyConverter())

// function thisthat(){
//     return 5
// }
// console.log(thisthat())