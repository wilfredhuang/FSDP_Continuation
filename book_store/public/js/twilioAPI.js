// Hasan's trial acc id and auth
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;

import Client from "twilio";
const client = Client(accountSid, authToken);

// client.messages
//   .create({
//     body:
//       "This is the ship that made the Kessel Run in fourteen parsecs? Your tracking code is and check your delivery here!",
//     from: "+12059461964",
//     to: "+6590251744",
//   })
//   .then((message) => console.log(message.sid));

// A simple example of sending an sms message using promises
var promise = client.messages.create({
	from: "+12059461964",
	to: "+6590251744", // a Twilio number you own
	body: "Hello, world.",
});
promise.then(
	function (sms) {
		console.log("Message success! SMS SID: " + sms.sid);
	},
	function (error) {
		console.error("Message failed!  Reason: " + error.message);
	}
);
