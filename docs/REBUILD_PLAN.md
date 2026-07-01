# Portal-v2 Rebuild Plan

Rebuild of the Code Zero Labs Portal UI on the shadcn dashboard UI kit, while **keeping all
existing functionality** — Firebase auth, Firestore data, Stripe billing, CRM rules, and the
proposal system.

This is a **domain-first rebuild**, not a CSS refactor: the backend/domain layer is preserved and
the UI layer is rebuilt with modern kit patterns (shadcn Sidebar shell, TanStack Table, Recharts,
shadcn `Form`).

---

## Source projects

| Project | Path | Role |
|---|---|---|
| Existing portal | `../Portal` | Source of truth for domain logic + functionality |
| UI kit | `../UI Kit/shadcn-ui-kit-dashboard-main` | UI foundation (components, shell, theming) |
| New build | `./` (`Portal-v2`) | Target rebuild |

### Stack

| | Portal (old) | Portal-v2 (new) |
|---|---|---|
| Next.js | 15.1 | 16.0 |
| React | 19 | 19 |
| Tailwind | v3 (`tailwind.config.ts`) | v4 (`@import "tailwindcss"`, OKLCH tokens) |
| Tables | Custom | TanStack Table |
| Charts | Custom SVG | Recharts + shadcn `Chart` |
| TipTap | v2 | **v2 (pinned)** — v3 migration deferred |
| Shell | Custom dark-glass `WorkspaceShellLayout` | shadcn `Sidebar` (`PortalShell`) |

---

## Architecture split

### Preserve (copied from Portal, largely unchanged)

- `types/` — all domain types
- `lib/` — `auth`, `env`, `firebase`, `firestore`, `stripe`, `schemas`, `crm`, `tasks`, plus all
  business logic (`proposal-*`, `account-*`, `admin-dashboard-*`, `package-tier-limits`, etc.)
- `server/` — `actions/`, `firestore/`, `stripe/`, `auth/`, `proposal/`, `catalog/`, `storage/`
- `app/api/` — auth session/logout, health, Stripe, webhooks, public proposal endpoints
- `middleware.ts` — cookie-based auth gate
- Firebase config — `firestore.rules`, `firebase.json`, `.firebaserc`, `functions/`

**Do not rewrite:** Stripe sync/webhooks, proposal acceptance side effects, the block document model,
or Firestore access. These are integration-heavy and battle-tested.

### Rebuild (new, using the UI kit)

- App shell (shadcn Sidebar + header), wired to real Firebase session
- All page layouts and compositions
- Forms → shadcn `Form` + React Hook Form + existing Zod schemas
- Lists/tables → TanStack Table
- Dashboards → Recharts
- Public proposal viewer styling (keep the block renderer logic)

### Proposal system — special case

~45 components + extensive `lib` code. **Do not** rebuild the block editor on the kit's TipTap v3
editor in early phases. Keep Portal's TipTap v2 editor + block logic; reskin the surrounding chrome
(toolbars, panels, dialogs). A TipTap v2 → v3 migration is a later, optional effort.

---

## Business rules that must not break

1. **Proposal lifecycle** — `draft → published → viewed → accepted/declined/expired`; public share
   tokens at `/p/[token]`; optional password gate (PBKDF2 + unlock cookie); rate-limited engagement
   tracking.
2. **Block document model** — 18 block types (packages, agreement, payment, signature, etc.) with
   catalog-linked pricing, 12/24-month terms, upfront costs ($1,999 AUD default for 12-month).
3. **Acceptance side effects** — signed agreement snapshot → Firebase Storage; linked opportunity →
   `won`; lead → contact promotion; subscription price persistence.
4. **Stripe sync** — webhook idempotency, CRM email matching, subscription schedules with future
   start dates, catalog activation creates Stripe products/prices.
5. **CRM model** — leads vs contacts vs account-only rows; account grouping by encoded company name;
   staff-provisioned portal access.
6. **Authorization** — middleware cookie check; staff layout gate; `requireStaffSession()` in
   actions; Firestore rules (admin vs team nuance).
7. **Localization** — AUD/en-AU defaults; per-user timezone/locale/currency affecting proposal dates.

---

## Phase 0 — Foundation ✅ COMPLETE

Bootable app where the kit UI and Portal backend coexist.

**Delivered**
- Kit copied as base; removed 73 demo pages, CDN `assetPrefix`/GA/iframe scripts, `proxy.ts`, and
  v3-only TipTap/AI demo components (`components/ui/custom`).
- Domain layer copied from Portal (`types`, `server`, `lib`, `hooks`, `middleware.ts`,
  `instrumentation.ts`, `app/api`, Firebase config, `functions/`). Kit's `fonts.ts`/`utils.ts`/
  `globals.css`/`themes.css` kept intact to preserve the kit look.
- One pure helper carried over for a domain dependency: `components/proposal/embed-video.ts`.
- `package.json` merged: kit UI stack + Portal backend deps (firebase, firebase-admin, stripe,
  @vercel/blob, sanitize-html); **TipTap pinned to v2**; `typecheck` script; node `>=20.9`.
- `next.config.ts`: Portal security headers + Firebase image domains + 2 MB server-action limit.
- `tsconfig.json`: excludes `functions/`. `.env.example` + `.env.local` copied.
- Kit shell rebuilt as props-driven and wired to the real session:
  - `components/layout/portal-shell.tsx` — `SidebarProvider` + `AppSidebar` + `SiteHeader`
  - `app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `header/index.tsx`, `header/user-menu.tsx`
  - `lib/session-user-view.ts` — serializable display projection of `PortalUser`
  - `components/auth/logout-button.tsx` — Firebase sign-out + session-cookie clear
- Routes: `/` (session redirect), `/login`, `/forgot-password`, `/admin` (+staff gate),
  `/dashboard`, `/customer` (shared customer shell), `/p/[token]` (public placeholder).

**Verification**
- `npx tsc --noEmit` — clean.
- `npm install` — 962 packages, success.
- Dev server ready on Turbopack; routes confirmed:
  `/` → 307 `/login`; `/login`, `/forgot-password`, `/p/[token]` → 200;
  `/admin`, `/dashboard`, `/customer` → 307 `/login?next=…`; `/api/health` → 200 JSON.

**Environment notes / follow-ups**
- `.env.local` points `GOOGLE_APPLICATION_CREDENTIALS` at a local service-account JSON in
  `~/Downloads`. Ensure that file exists (or use `FIREBASE_SERVICE_ACCOUNT_JSON`) for full login.
  The app degrades gracefully without it (redirects to login).
- Next 16 warns that `middleware.ts` should become `proxy.ts`. Still works; rename in a later phase.

---

## Phase 1 — Shell + settings (est. 2–3 weeks)

- Polish staff sidebar + header (real user menu, logout, theme switcher).
- Customer workspace shell parity.
- Settings section using the kit's settings sub-nav layout
  (`../UI Kit/.../app/dashboard/(auth)/pages/settings/layout.tsx`): company, profile, locality,
  integrations.
- Keep role gates unchanged (`admin`/`team` vs `customer`).
- Decide: implement or hide placeholder settings pages (team, notifications, billing, voice-ai,
  platforms) — recommend hiding from nav until built.

Routes: `/admin/settings/*` (company, profile, locality, integrations live).

---

## Phase 2 — CRM (est. 3–4 weeks)

| Page | Kit reference | Portal logic to wire |
|---|---|---|
| Customers list | `crm/components/leads.tsx` | `server/firestore/crm-customers.ts` |
| Customer detail | CRM detail patterns | tabs: notes, activities, billing, proposals, tasks |
| Accounts | table + grouping | `lib/account-key.ts` |
| Opportunities board | `apps/kanban/` | `@dnd-kit` + stage rules (`lib/crm/opportunity-stages`) |
| Tasks board | `apps/kanban/` | column normalization (`lib/tasks/task-board-columns`) |

- Introduce a single reusable `DataTable` (TanStack Table) for all list pages.

Routes: `/admin/customers`, `/admin/accounts`, `/admin/opportunities`, `/admin/tasks` + detail pages.

---

## Phase 3 — Operations (est. 3–4 weeks)

- Service catalog CRUD + Stripe sync UI (`server/stripe/catalog-service-stripe-sync.ts`).
- Subscriptions: create / pause / resume / cancel (`server/actions/subscriptions-crm.ts`).
- Templates hub (proposal + contract templates).
- Admin dashboard KPIs + Recharts (`lib/admin-dashboard-*`).

Routes: `/admin/subscriptions`, `/admin/services/*`, `/admin/templates/*`, `/admin` dashboard.

---

## Phase 4 — Proposals (est. 4–6 weeks) ⚠️ highest risk

- Proposal hub + builder chrome (keep the block editor logic + server actions).
- Template editor/preview.
- Public viewer `/p/[token]` reskin — **keep the URL identical**.
- Signature modal, package selection, payment blocks.
- Heavy end-to-end regression testing of the acceptance flow.

Routes: `/admin/proposals/*`, `/p/[token]`.

---

## Phase 5 — Customer portal + polish (est. 1–2 weeks)

- Customer dashboard, Stripe billing portal button, invoice/payment lists, shared proposals.
- Error/empty states from the kit.
- Remove any remaining old shell/CSS artifacts.
- Production cutover planning.

**Total estimate:** ~14–20 weeks for one developer (proposals + Stripe acceptance carry the most risk).

---

## Efficiency wins to bake in

- One shared `DataTable` (TanStack Table + server pagination) instead of ~10 custom list panels.
- Standard shadcn `Form` pattern for every form (reuse existing Zod schemas + server actions).
- Single nav/breadcrumb config source.
- Shared status badges (proposals, subscriptions, opportunities).
- Add Firestore composite indexes where queries need them (`firestore.indexes.json` is currently empty).
- A proposal block registry (block type → component map) shared by editor and public viewer.

---

## Risk register

| Risk | Mitigation |
|---|---|
| No automated tests in Portal | Add Playwright E2E for critical flows before Phase 4 |
| Proposal/Stripe acceptance complexity | Keep domain logic; reskin only; test heavily |
| TipTap v2 vs kit v3 | Keep v2 pinned; defer migration |
| Broken public proposal links | Keep `/p/[token]` URL identical |
| Auth/session cookie regressions | API routes + cookie names copied verbatim |
| `@hookform/resolvers` v5 vs Portal v3 | Validate zodResolver usage as forms are migrated |
| Scope creep on placeholder pages | Explicitly exclude reports/team/notifications from v1 |

---

## Suggested testing before/with Phase 4

- E2E: login → create customer → publish proposal → public accept → Stripe webhook handling.
- Unit: `lib/proposal-packages-totals.ts`, opportunity/task stage normalization, acceptance CRM
  side effects.
