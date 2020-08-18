// Hasan's trial acc id and auth
const accountSid = 'AC7994551ea296710e5de3b74d7a93056c';
const authToken = 'f5ac6a9439b75395ce54e9783d0f8877';
// const accountSid = "AC583c7d4bc97864b67d16d8430ad9da88";
// const authToken = "e46e5a7f50ee56da9999d8feefe82ee9";
const client = require("twilio")(accountSid, authToken);

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
