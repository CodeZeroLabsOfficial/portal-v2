/** Minimal Stripe.js v3 surface used by card SetupIntent flows. */

export interface StripeCardElement {
  mount: (selector: string | Element) => void;
  destroy: () => void;
}

export interface StripeElementsInstance {
  create: (type: "card", options?: Record<string, unknown>) => StripeCardElement;
}

export interface StripeSetupIntentResult {
  setupIntent?: { payment_method?: string | null };
  error?: { message?: string };
}

export interface StripeInstance {
  elements: () => StripeElementsInstance;
  confirmCardSetup: (
    clientSecret: string,
    data: { payment_method: { card: StripeCardElement; billing_details?: { name?: string } } }
  ) => Promise<StripeSetupIntentResult>;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

export {};
