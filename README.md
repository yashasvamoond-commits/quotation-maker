# Quotation Generator · MOOND LAW OFFICES

A responsive, installable quotation app pre-filled with the MOOND LAW OFFICES letterhead and the two sample matters from the supplied quotation. Create, duplicate and edit quotations; change the office profile; add fee milestones; and download a contract-style, legal-paper PDF. Drafts are stored only in the browser's local storage.

## Run locally

```sh
npm install
npm run dev
```

For a production build, run `npm run build` and deploy the generated `dist/` directory to any HTTPS static host. The included service worker caches the app shell for offline use after the first visit. PDF generation is local to the device.

## Install on a phone

- **Android:** Open the deployed HTTPS app in Chrome and choose **Install app** / **Add to Home screen** (or use the in-app install prompt when offered).
- **iPhone / iPad:** Open the deployed HTTPS app in Safari, tap **Share**, then **Add to Home Screen**.

This creates a home-screen web app that runs on both platforms without an app-store account. No native store binary is included; app-store publishing would require separate Apple/Google developer accounts, signing and review.

## Included features

- Two editable example quotations transcribed from the attached PDF (Bengaluru and Pimpri Chinchwad).
- Office-profile editor for the firm's name, advocate, credentials, chamber address and contact details.
- New and duplicate quotation drafts, editable client/matter details, adjustable payment milestones and automatic totals.
- Live document preview and one-tap PDF generation on **US Legal portrait (8.5 × 14 in)** paper, including engagement terms and signature/acceptance lines.
- Offline app shell and locally saved drafts. Clear browser storage only after backing up any drafts you need to keep.

The fee quotation is a template; review and adapt the scope, exclusions and terms for each engagement before signature. This application does not provide legal advice.
