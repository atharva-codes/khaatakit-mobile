// src/hooks/useSms.ts
export const useSms = () => {
  const sendSms = async (phone: string, message: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });

      const data = await res.json();
      if (!data.success) console.error("SMS failed:", data.error);
      return data;
    } catch (err) {
      console.error("Network error sending SMS:", err);
      return { success: false, error: err };
    }
  };

  return { sendSms };
};
