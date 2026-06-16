import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function parseJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return payload?.sub ? payload : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  const payload = token ? parseJwt(token) : null;
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Money Tree Tracker — Lifetime Access",
              description: "Pay once. Save your progress forever.",
            },
            unit_amount: 1299,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://www.moneytreetracker.com/settings?upgraded=true`,
      cancel_url: `https://www.moneytreetracker.com/settings`,
      customer_email: payload.email,
      metadata: { user_id: payload.sub },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
