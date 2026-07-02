"use client";

import * as React from "react";

import { loadStripeJs } from "@/lib/stripe/load-stripe-js";
import type { StripeCardElement, StripeInstance } from "@/lib/stripe/stripe-js-types";

export interface UseStripeCardElementOptions {
  /** When false, card element is torn down. */
  active: boolean;
  publishableKey: string | null | undefined;
  /** DOM id for the mount target (must be unique per instance). */
  mountElementId: string;
}

export interface UseStripeCardElementResult {
  cardReady: boolean;
  cardError: string | null;
  setCardError: React.Dispatch<React.SetStateAction<string | null>>;
  stripeRef: React.MutableRefObject<StripeInstance | null>;
  cardRef: React.MutableRefObject<StripeCardElement | null>;
}

/**
 * Mounts and destroys a Stripe Card element on a fixed DOM id.
 * Shared by subscription create and proposal public checkout.
 */
export function useStripeCardElement({
  active,
  publishableKey,
  mountElementId
}: UseStripeCardElementOptions): UseStripeCardElementResult {
  const [cardReady, setCardReady] = React.useState(false);
  const [cardError, setCardError] = React.useState<string | null>(null);
  const stripeRef = React.useRef<StripeInstance | null>(null);
  const cardRef = React.useRef<StripeCardElement | null>(null);

  React.useEffect(() => {
    if (!active || !publishableKey?.trim()) return;
    const key = publishableKey.trim();
    let cancelled = false;

    async function mountCardElement() {
      if (cardRef.current) return;
      const mountTarget = document.getElementById(mountElementId);
      if (!mountTarget) return;

      await loadStripeJs();
      if (cancelled) return;
      if (!window.Stripe) {
        setCardError("Stripe.js is unavailable.");
        return;
      }

      stripeRef.current = window.Stripe(key);
      const elements = stripeRef.current.elements();
      const card = elements.create("card", { hidePostalCode: true });
      card.mount(mountTarget);
      cardRef.current = card;
      setCardReady(true);
    }

    void mountCardElement().catch((e) => {
      const message = e instanceof Error ? e.message : "Could not initialise card entry.";
      if (!message.includes(mountElementId)) {
        setCardError(message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [active, mountElementId, publishableKey]);

  React.useEffect(() => {
    if (active) return;
    if (cardRef.current) {
      cardRef.current.destroy();
      cardRef.current = null;
    }
    stripeRef.current = null;
    setCardReady(false);
  }, [active]);

  return {
    cardReady,
    cardError,
    setCardError,
    stripeRef,
    cardRef
  };
}
