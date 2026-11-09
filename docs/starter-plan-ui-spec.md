# Starter Plan UI specification

Tracks #84 and #83. This is a design/acceptance specification, not implemented UI.

## Admin: Plans > Starter Plans
- List: name, enabled, duration, data allowance, service capabilities, assignment policy, reservation TTL, assigned/activated/expired counts, last modified.
- Create/edit: plan name, price fixed to 0 (read-only Free), duration in minutes, quota in GiB or unlimited, DNS/SNI/route options, region, status.
- Policy editor: audience (new verified users), assignment trigger (email verification default, registration or first login optional), activation trigger (user click default, first DNS use optional, immediate optional), priority, reservation TTL (7 days default), enabled.
- Warn on overlapping default policies and explain priority. Require confirmation to disable a live policy; disable affects future assignments only.
- Archive rather than destructive delete. Audit actor and change timestamp.
- Localize all labels and errors in English and Persian, RTL-aware.

## User dashboard
- After verification: show a reserved trial card with plan details, activation CTA, reservation expiry, and instructions for DNS/PS5 setup.
- On activation: disable CTA while pending, show provisioning state; after activation show countdown, usage and expiry.
- Expired/cancelled/claimed: show status, no second activation.
- Market: zero-priced plans display Free/رایگان; distinguish manual free claim from auto-reserved starter offer.
- Do not show payment method, wallet debit, card-to-card receipt, or checkout for zero-price activation.

## Contract dependencies
Implement against backend endpoints once finalized; see Wraplink/backend #90 and #88. Server is authoritative for eligibility, plan state, and countdown timestamps.

## Acceptance
- English/Persian; mobile/desktop; accessible loading/empty/error/success states.
- Refresh and multiple clicks cannot duplicate claim.
- User who verifies but does not activate retains the full configured trial duration until reservation TTL.
- Correctly display policy disabled, reservation expired, already claimed, provisioning pending, and usage exhausted.
