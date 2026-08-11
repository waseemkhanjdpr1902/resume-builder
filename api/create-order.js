const plans = {
  monthly: { amount: 29900, label: "Career Pro - 30 days" },
  annual: { amount: 59900, label: "Career Pro - 365 days" },
  lifetime: { amount: 99900, label: "Career Pro - Lifetime" },
};

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return response.status(503).json({ error: "Payments are being configured. Please try again shortly." });
  const plan = plans[request.body?.planId];
  if (!plan) return response.status(400).json({ error: "Invalid plan" });
  try {
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: plan.amount, currency: "INR", receipt: `resu_${Date.now()}`, notes: { planId: request.body.planId, product: "ResuAIBuilder" } }),
    });
    const order = await razorpayResponse.json();
    if (!razorpayResponse.ok) return response.status(502).json({ error: order?.error?.description || "Could not create payment order" });
    return response.status(200).json({ keyId, orderId: order.id, amount: order.amount, currency: order.currency, label: plan.label, planId: request.body.planId });
  } catch {
    return response.status(500).json({ error: "Payment service is temporarily unavailable" });
  }
}
