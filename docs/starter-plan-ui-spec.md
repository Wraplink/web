# Starter Plan UI — implemented scope and verification

Tracks #83 and #84. Backend contract implemented in Wraplink/backend PR #91 (merged).

## Implemented in this branch
- Admin starter-plan policy list, creation and enabled toggle, linked from Admin Plans.
- Admin policy uses published, active, zero-price plans; priority, duration and reservation TTL; currently global region, email-verification assignment and manual activation only.
- User dashboard starter-trial card: reserved/active/expired/cancelled/failed states, manual activation, countdown and bilingual messages.
- Market: zero-priced plans display Free / رایگان and use direct claim API rather than basket/payment; lifetime claimed plan codes are compared case-insensitively.
- Claim eligibility and duplicate prevention are enforced by backend, not only by disabled UI buttons.

## API contract
- GET /api/v1/me/starter-claims
- POST /api/v1/me/starter-claims/{claimID}/activate
- GET /api/v1/me/free-plans/claims
- POST /api/v1/me/free-plans/claim
- GET /api/v1/admin/starter-policies/
- POST /api/v1/admin/starter-policies/
- PATCH /api/v1/admin/starter-policies/{policyID}

## Not implemented or not yet verified
- Editing existing policy details beyond enabled toggle.
- Additional assignment triggers (registration/first login), first-use or immediate activation, region-specific policy, and policy audit/history.
- Admin analytics for assigned/activated/expired counts.
- Browser E2E in a deployed environment, mobile/accessibility audit, DNS/Edge entitlement propagation, and access revocation after expiration.
- A private test-plan or production-write testing mode (explicitly not requested).

## Deployment and testing
- GitHub Actions CI passed for commit 71d48df (run 43018832674).
- Backend free-plan staging smoke test is in backend PR #92; it explicitly rejects production endpoints.
- There is no separate staging environment. Do not run destructive test scripts against production or claim full E2E verification from CI alone.
- On production, restrict checks to read-only endpoints unless separately authorized for a specific disposable account and plan.
