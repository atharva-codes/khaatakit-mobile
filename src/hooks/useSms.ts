export const useSms = () => {
  const sendSms = async (phone: string, message: string) => {
    console.log(`[SMS Service] Would send to ${phone}: ${message}`);

    return {
      success: true,
      message: 'SMS service ready for Twilio integration',
      note: 'To enable real SMS, add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your environment variables and update this hook.',
    };
  };

  return { sendSms };
};
