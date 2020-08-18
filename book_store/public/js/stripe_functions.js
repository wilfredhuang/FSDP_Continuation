// Set your publishable key: remember to change this to your live publishable key in production

// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe123 = Stripe('pk_test_Ef7sYvL8k3tWVTxjADPpT4T700HuZCROoX');
var elements = stripe123.elements();

var style = {
      base: {
        color: "#32325d",
      }
};
    
var card123 = elements.create("card", {style:style});
card123.mount("#card-element");

function myFoo() {
  alert(document.getElementById('test123').value)
}

// function confirmStripe(card) {
//   var displayError = document.getElementById('card-errors');
//   if (event.error) {
//     displayError.textContent = event.error.message;
//     document.getElementById('submit').disabled = true;
//   } else {
//     displayError.textContent = '';
//     console.log(card)
//     // alert(card)
//     // alert(document.getElementById('submit').value)
//     stripe123.confirmCardPayment(document.getElementById('submit').value, {
//       payment_method: {
//         card: card,
//         billing_details: {
//           name: 'req.user.name'
//         }
//         //  Not working A request to confirm a PaymentIntent pi_1H47ztEsVjFQQiZ9KbgOCANp failed
//         // Dont on it
//         // confirm:true
//       }
//     })
//       .then(function (result) {
//         // Handle result.error or result.paymentIntent
//         console.log("FOOBAR " + result)
//           .catch(() => {
//             console.log("Confirm Card Payment went Wrong!")
//           })
//       });
//   };


// function confirmStripe(card) { 
//   var displayError = document.getElementById('card-errors');
//   if (displayError.textContent != '') {
//     document.getElementById("submit").disabled = true;
//     console.log(card)
//     // alert(card)
//     // alert(document.getElementById('submit').value)
//     stripe123.confirmCardPayment(document.getElementById('submit').value, {
//     payment_method: {
//       card: card,
//       billing_details: {
//         name: 'req.user.name'
//       }
//       //  Not working A request to confirm a PaymentIntent pi_1H47ztEsVjFQQiZ9KbgOCANp failed
//       // Dont on it
//       // confirm:true
//     }
//   })
//   .then(function(result) {
//     // Handle result.error or result.paymentIntent
//     console.log("FOOBAR " + result)
//   .catch(()=> {
//     console.log("Confirm Card Payment went Wrong!")
//   })
//   });
//   }

var cust_name = document.getElementById('customer-name').value

function confirmStripe(card123) {
  console.log(card123)
  // alert(card)
  // alert(document.getElementById('submit').value)
  stripe123.confirmCardPayment(document.getElementById('submit').value, {
    payment_method: {
      card: card123,
      billing_details: {
        name: cust_name
      }
      //  Not working A request to confirm a PaymentIntent pi_1H47ztEsVjFQQiZ9KbgOCANp failed
      // Dont on it
      // confirm:true
    }
  })
    .then(function (result) {
      // Handle result.error or result.paymentIntent
      console.log("FOOBAR " + result)
        .catch(() => {
          console.log("Confirm Card Payment went Wrong!")
        })
    });
}


// // Handle real-time validation errors from the card Element.
card123.on('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
    document.getElementById('submit').disabled = true;
  } else {
    displayError.textContent = '';
    document.getElementById('submit').disabled = false;
  }
});

// Handle form submission.
// var form = document.getElementById('payment-form');
// form.addEventListener('submit', function(event) {
//   event.preventDefault();

//   stripe123.createToken(card).then(function(result) {
//     if (result.error) {
//       // Inform the user if there was an error.
//       var errorElement = document.getElementById('card-errors');
//       errorElement.textContent = result.error.message;
//     } else {
//       // Send the token to your server.
//       stripeTokenHandler(result.token);
//     }
//   });
// });

// // Submit the form with the token ID.
// function stripeTokenHandler(token) {
//   // Insert the token ID into the form so it gets submitted to the server
//   var form = document.getElementById('payment-form');
//   var hiddenInput = document.createElement('input');
//   hiddenInput.setAttribute('type', 'hidden');
//   hiddenInput.setAttribute('name', 'stripeToken');
//   hiddenInput.setAttribute('value', token.id);
//   form.appendChild(hiddenInput);

//   // Submit the form
//   form.submit();
// }
