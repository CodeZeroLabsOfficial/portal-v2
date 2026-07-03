# Proposal rebuild — functionality parity checklist

Run before merging builder cutover or after block registry migrations.

## Builder shell

- [ ] `/admin/proposals/[id]` opens fullscreen builder (outline | canvas | inspector)
- [ ] `/admin/templates/[id]` and `/admin/templates/contracts/[id]` use same shell
- [ ] Mobile: outline and inspector accessible via sheets
- [ ] Breadcrumb + back navigation works for CRM customer context

## Block editing (all 18 types)

- [ ] Root, section, column, and agreement nesting unchanged
- [ ] Proposal, template, and contract-template insert menus filter correctly
- [ ] Bubble toolbars use kit-aligned typography (no arbitrary `text-[Npx]` in `components/features/proposal/**`)

## Save / publish / delete

- [ ] Proposal save + publish + send (CRM actions)
- [ ] Template save + publish stage + delete (ConfirmDialog + toast)
- [ ] Contract template save + delete

## Public viewer (`/p/[token]`)

- [ ] Password gate
- [ ] Package selection + agreement signing
- [ ] Engagement tracking
- [ ] Stripe / acceptance side effects unchanged

## Automated checks

```bash
npm run typecheck
npm run test:unit
```

## E2E (recommended — Playwright not yet configured)

1. Publish proposal from builder
2. Open public link (incognito)
3. Accept / sign path completes

Add Playwright when CI supports browser tests for this repo.
