import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";

const prisma = new PrismaClient();

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Add it to your .env to enable billing.");
  }
  // Pin to whatever Stripe API version is current when you set this up —
  // https://stripe.com/docs/upgrades — this value is just a placeholder.
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

const PLAN_PRICE_IDS: Record<"starter" | "pro", string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
};

export const billingService = {
  async createCheckoutSession(userId: string, userEmail: string, plan: "starter" | "pro") {
    const stripe = getStripeClient();
    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      throw new Error(`No Stripe price configured for plan "${plan}" (set STRIPE_PRICE_${plan.toUpperCase()}).`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.WEB_APP_URL ?? "http://localhost:3000"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.WEB_APP_URL ?? "http://localhost:3000"}/dashboard/billing?canceled=true`,
      client_reference_id: userId,
      metadata: { userId, plan },
    });

    return { url: session.url };
  },

  /**
   * `rawBody` must be the untouched request body Buffer — see the note in
   * app.ts about why this route is registered before express.json().
   */
  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan ?? "starter";
        if (userId) {
          await prisma.subscription.create({
            data: {
              userId,
              plan,
              status: "active",
              stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
              stripeSubscriptionId:
                typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
            },
          });
          await prisma.user.update({ where: { id: userId }, data: { role: "PRO" } });
          logger.info("Subscription activated", { userId, plan, service: "billing" });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const existing = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (existing) {
          await prisma.subscription.update({ where: { id: existing.id }, data: { status: "canceled" } });
          await prisma.user.update({ where: { id: existing.userId }, data: { role: "FREE" } });
          logger.info("Subscription canceled", { userId: existing.userId, service: "billing" });
        }
        break;
      }

      default:
        logger.info("Unhandled Stripe event type", { type: event.type, service: "billing" });
    }

    return { received: true };
  },
};
