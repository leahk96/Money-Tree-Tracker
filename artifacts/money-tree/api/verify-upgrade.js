import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  // Parse session_id from query string
  const qs = (req.url || "").split("?")[1] || "";
  const sessionId = new URLSearchParams(qs).get("session_id");
  if (!sessionId) {
    res.status(400).json({ error: "Missing session_id" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status === "paid" &&
      session.metadata?.user_id === payload.sub
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          onboarding_completed: true,
          stripe_customer_id: session.customer?.toString() ?? null,
        })
        .eq("user_id", payload.sub);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true });
    } else {
      res.json({ success: false, payment_status: session.payment_status });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
