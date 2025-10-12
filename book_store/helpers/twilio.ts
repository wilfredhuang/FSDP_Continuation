import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "";

const client = twilio(accountSid, authToken);

// Send SMS using Twilio
export const sendSMS = async (to: string, body: string): Promise<void> => {
  try {
    await client.messages.create({
      body,
      from: twilioPhone,
      to,
    });
    console.log(`[Twilio] SMS sent successfully to ${to}`);
  } catch (error: any) {
    console.error("[Twilio] Error sending SMS:", error.message || error);
  }
};

// Verify connection by fetching balance or some lightweight endpoint
export const verifyTwilioConnection = async (): Promise<void> => {
  try {
    const response = await client.api.accounts(accountSid).fetch();
    console.log(`[Twilio] Account SID verified: ${response.sid}`);
  } catch (error: any) {
    console.error("[Twilio] Error verifying Twilio account:", error.message || error);
  }
};

export default { sendSMS, verifyTwilioConnection };
