const STRIPE_JS_SRC = "https://js.stripe.com/v3/";

let loadPromise: Promise<void> | null = null;

/** Idempotent loader for Stripe.js v3 (shared by subscription + proposal checkout). */
export function loadStripeJs(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Stripe.js can only load in the browser."));
  }
  if (window.Stripe) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${STRIPE_JS_SRC}"]`);
    if (existing) {
      if (window.Stripe) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Stripe.js failed to load.")), {
        once: true
      });
      return;
    }
    const script = document.createElement("script");
    script.src = STRIPE_JS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Stripe.js failed to load."));
    document.head.appendChild(script);
  });

  return loadPromise;
}
