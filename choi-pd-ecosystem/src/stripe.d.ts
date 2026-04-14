/**
 * Stripe module type declaration.
 * Stripe is dynamically imported at runtime only when STRIPE_SECRET_KEY is configured.
 * This declaration satisfies TypeScript without requiring the full stripe package.
 */
declare module 'stripe' {
  // --- Refunds ---
  interface Refund {
    id: string;
    [key: string]: unknown;
  }

  interface Refunds {
    create(params: Record<string, unknown>): Promise<Refund>;
  }

  // --- Customers ---
  interface Customer {
    id: string;
    [key: string]: unknown;
  }

  interface Customers {
    create(params: Record<string, unknown>): Promise<Customer>;
  }

  // --- Checkout ---
  interface CheckoutSession {
    id: string;
    url: string | null;
    [key: string]: unknown;
  }

  interface CheckoutSessions {
    create(params: Record<string, unknown>): Promise<CheckoutSession>;
  }

  interface Checkout {
    sessions: CheckoutSessions;
  }

  // --- Subscriptions ---
  interface SubscriptionItem {
    id: string;
    price: {
      id: string;
      recurring?: { interval: string };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  interface Subscription {
    id: string;
    status: string;
    metadata?: Record<string, string>;
    items: { data: SubscriptionItem[] };
    cancel_at_period_end?: boolean;
    current_period_start?: number;
    current_period_end?: number;
    customer?: string;
    [key: string]: unknown;
  }

  interface Subscriptions {
    create(params: Record<string, unknown>): Promise<Subscription>;
    cancel(id: string): Promise<Subscription>;
    retrieve(id: string): Promise<Subscription>;
    update(id: string, params: Record<string, unknown>): Promise<Subscription>;
  }

  // --- Events ---
  interface StripeEventObject {
    id?: string;
    status?: string;
    customer?: string | unknown;
    subscription?: string | unknown;
    metadata?: Record<string, string>;
    items?: { data?: SubscriptionItem[] };
    cancel_at_period_end?: boolean;
    current_period_start?: number;
    current_period_end?: number;
    period_start?: number;
    period_end?: number;
    parent?: {
      subscription_details?: {
        subscription?: string | { id: string };
        [key: string]: unknown;
      };
    };
    [key: string]: unknown;
  }

  interface StripeEvent {
    id: string;
    type: string;
    data: { object: StripeEventObject };
  }

  interface Webhooks {
    constructEvent(body: string, signature: string, secret: string): StripeEvent;
  }

  // --- Main class ---
  class Stripe {
    constructor(secretKey: string, options?: Record<string, unknown>);
    refunds: Refunds;
    subscriptions: Subscriptions;
    customers: Customers;
    checkout: Checkout;
    webhooks: Webhooks;
  }

  export default Stripe;
}
