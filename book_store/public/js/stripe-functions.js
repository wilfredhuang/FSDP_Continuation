// Set your publishable key: remember to change this to your live publishable key in production

// See your keys here: https://dashboard.stripe.com/account/apikeys

document.addEventListener("DOMContentLoaded", function () {
	// Replace with your actual publishable test key
	var stripe123 = Stripe("pk_test_Ef7sYvL8k3tWVTxjADPpT4T700HuZCROoX");

	// Test if Stripe instance is initialized
	if (stripe123) {
		console.log("Stripe is initialized:", stripe123);
	} else {
		console.error("Stripe failed to initialize.");
	}

	// Create an instance of Elements
	var elements = stripe123.elements();

	// Test if Elements is created
	if (elements) {
		console.log("Stripe Elements is initialized:", elements);
	} else {
		console.error("Stripe Elements failed to initialize.");
	}

	// Define style options for Elements
	var style = {
		base: {
			color: "#32325d",
		},
	};

	// Create and mount the card element
	var card123 = elements.create("card", { style: style });
	card123.mount("#card-element");

	// Handle real-time validation errors from the card Element.
	card123.on("change", function (event) {
		var displayError = document.getElementById("card-errors");
		if (event.error) {
			displayError.textContent = event.error.message;
			document.getElementById("submit").disabled = true;
		} else {
			displayError.textContent = "";
			document.getElementById("submit").disabled = false;
		}
	});

	// Function to confirm card payment
	function confirmStripe() {
		var cust_name = document.getElementById("customer-name").value;
		var clientSecret = document.getElementById("submit").value; // Assuming this is the client secret
		stripe123.confirmCardPayment(clientSecret, {
			payment_method: {
				card: card123,
				billing_details: {
					name: cust_name,
				},
			},
		})
		.then(function (result) {
			if (result.error) {
				// Show error to your customer
				console.log("Payment failed:", result.error.message);
			} else {
				// The payment has been processed!
				console.log("Payment succeeded:", result.paymentIntent);
			}
		})
		.catch(function (error) {
			console.log("Confirm Card Payment went Wrong!", error);
		});
	}

	// Example function usage
	document.getElementById("submit").addEventListener("click", confirmStripe);
});