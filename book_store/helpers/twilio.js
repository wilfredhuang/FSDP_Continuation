const accountSid = "AC7994551ea296710e5de3b74d7a93056c";
const authToken = "f5ac6a9439b75395ce54e9783d0f8877";

const sendSms = (phone, message) => {
  const client = require("twilio")(accountSid, authToken);
  client.messages
    .create({
      body: message,
      from: "+12059461964",
      to: phone,
    })
    .then((message) => console.log(message.sid));
};

module.exports = sendSms;
