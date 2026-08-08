# OPM Flow Assist browser automation

This directory defines the browser-side integration boundary. The web app must never contain OPM credentials or depend on brittle DOM selectors directly.

## Runtime contract

The content script/extension adapter should implement:

- `isConnected()` — confirm the active tab is an OPM entry page and the user session is valid.
- `getOptions()` — read the currently available dropdown options from the OPM page.
- `fill(entry)` — select each dropdown and fill time/work-done fields for exactly one ticket.
- `save()` — click Save, wait for the OPM response/validation, and return an optional OPM reference.

## Required behavior

1. Process tickets strictly one at a time.
2. Do not submit if any required option is not found.
3. Wait for dependent dropdowns to finish loading before selecting the next field.
4. Verify Save succeeded before moving to the next ticket.
5. Return a structured error on validation/session/selector failures.
6. Never store or transmit OPM passwords.

The exact DOM selectors must be captured from the authenticated OPM entry page before implementing the content script. Do not guess selectors from screenshots.
