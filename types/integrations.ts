/** `app_settings/integrations` — staff-managed integration credentials (publishable keys only). */
export interface PortalIntegrationsSettings {
  stripePublishableKey?: string;
  /** Reference URL pasted into the Stripe Dashboard webhook endpoint field. */
  webhookUrl?: string;
  updatedAt?: number;
}
