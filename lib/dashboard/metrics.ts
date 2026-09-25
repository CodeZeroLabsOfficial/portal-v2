import type { CustomerRecord } from "@/types/customer";
import type { InvoiceRecord } from "@/types/invoice";
import type { PaymentRecord } from "@/types/payment";
import type { SubscriptionRecord } from "@/types/subscription";
import type { SupportTicketRecord } from "@/types/support-ticket";
import type { TaskRecord } from "@/types/task";

/** Contacts use the sky CRM type badge (`crmType === "contact"`). */
export function isCrmContact(c: CustomerRecord): boolean {
  return c.crmType === "contact";
}

export function countCrmContacts(customers: CustomerRecord[]): number {
  return customers.filter(isCrmContact).length;
}

/** Same recurring statuses as the admin subscriptions table (Active / Trialing badges). */
export function isBillableSubscriptionStatus(status: SubscriptionRecord["status"]): boolean {
  return status === "active" || status === "trialing";
}

export function countActiveSubscriptions(subscriptions: SubscriptionRecord[]): number {
  return subscriptions.filter((s) => isBillableSubscriptionStatus(s.status)).length;
}

export function succeededPaymentsInRange(
  payments: PaymentRecord[],
  startMs: number,
  endMs: number,
): PaymentRecord[] {
  return payments.filter(
    (p) =>
      p.status === "succeeded" &&
      typeof p.createdAt === "number" &&
      p.createdAt >= startMs &&
      p.createdAt <= endMs,
  );
}

export function sumPaymentAmountMinor(payments: PaymentRecord[]): number {
  return payments.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0);
}

export function paidInvoicesInRange(
  invoices: InvoiceRecord[],
  startMs: number,
  endMs: number,
): InvoiceRecord[] {
  return invoices.filter(
    (inv) =>
      inv.status === "paid" &&
      typeof inv.paidAt === "number" &&
      inv.paidAt >= startMs &&
      inv.paidAt <= endMs,
  );
}

export function sumInvoiceAmountDueMinor(invoices: InvoiceRecord[]): number {
  return invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
}

/** Unconverted CRM lead (excludes account-only shells and archived rows). */
export function isCrmLead(c: CustomerRecord): boolean {
  return c.crmType === "lead" && c.status !== "archived";
}

export function countActiveLeads(customers: CustomerRecord[]): number {
  return customers.filter(isCrmLead).length;
}

export function leadsCreatedInRange(
  customers: CustomerRecord[],
  startMs: number,
  endMs: number,
): number {
  return customers.filter(
    (c) => isCrmLead(c) && c.createdAt >= startMs && c.createdAt <= endMs,
  ).length;
}

export function summarizePaidInvoiceRevenue(
  invoices: InvoiceRecord[],
  startMs: number,
  endMs: number,
): { amountMinor: number } {
  const slice = paidInvoicesInRange(invoices, startMs, endMs);
  return { amountMinor: sumInvoiceAmountDueMinor(slice) };
}

export function summarizeSucceededPaymentsInRange(
  payments: PaymentRecord[],
  startMs: number,
  endMs: number,
): { amountMinor: number } {
  const slice = succeededPaymentsInRange(payments, startMs, endMs);
  return { amountMinor: sumPaymentAmountMinor(slice) };
}

export function isTaskOpenStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized !== "done" &&
    normalized !== "completed" &&
    normalized !== "cancelled" &&
    normalized !== "canceled" &&
    normalized !== "closed"
  );
}

export function isTicketOpenStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized !== "resolved" &&
    normalized !== "closed" &&
    normalized !== "done" &&
    normalized !== "cancelled" &&
    normalized !== "canceled"
  );
}

function startOfCalendarWeekMs(d: Date): number {
  const cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayOfWeek = cursor.getDay();
  const toMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  cursor.setDate(cursor.getDate() + toMonday);
  cursor.setHours(0, 0, 0, 0);
  return cursor.getTime();
}

function endOfCalendarWeekMs(weekStartMs: number): number {
  return weekStartMs + 7 * 86400000 - 1;
}

export function countTasksDueAndOverdue(
  tasks: TaskRecord[],
  now: Date,
): { dueThisWeek: number; overdue: number } {
  const nowMs = now.getTime();
  const weekStart = startOfCalendarWeekMs(now);
  const weekEnd = endOfCalendarWeekMs(weekStart);
  let dueThisWeek = 0;
  let overdue = 0;
  for (const task of tasks) {
    if (!isTaskOpenStatus(task.status)) {
      continue;
    }
    const due = task.dueAt;
    if (due === undefined || !Number.isFinite(due)) {
      continue;
    }
    if (due < nowMs) {
      overdue += 1;
    } else if (due >= weekStart && due <= weekEnd) {
      dueThisWeek += 1;
    }
  }
  return { dueThisWeek, overdue };
}

export function countOpenTicketsByUrgency(tickets: SupportTicketRecord[]): {
  critical: number;
  high: number;
  medium: number;
} {
  const open = tickets.filter((ticket) => isTicketOpenStatus(ticket.status));
  let critical = 0;
  let high = 0;
  let medium = 0;
  for (const ticket of open) {
    if (ticket.urgency === "critical") {
      critical += 1;
    } else if (ticket.urgency === "high") {
      high += 1;
    } else {
      medium += 1;
    }
  }
  return { critical, high, medium };
}

export function countOpenTickets(tickets: SupportTicketRecord[]): number {
  const buckets = countOpenTicketsByUrgency(tickets);
  return buckets.critical + buckets.high + buckets.medium;
}
