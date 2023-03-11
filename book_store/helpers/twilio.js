const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;
const twilioPhoneNo = process.env.TWILIO_ACCOUNT_PHONENO;

const sendSms = (phone, message) => {
	const client = require("twilio")(accountSid, authToken);
	client.messages
		.create({
			body: message,
			from: twilioPhoneNo,
			to: phone,
		})
		.then((message) => console.log(message.sid));
};

export default sendSms;
