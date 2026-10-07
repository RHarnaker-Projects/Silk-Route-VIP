# Hosting, repository and account access

## Existing hosting

Hosting was verified on 30 September 2026 that the Sites project is active and public, its latest saved version is 18, and the custom domain is `https://silkroute.vip`. Both root and `www` domain connections have active SSL. The local source has not been compared with live version 18.

The non-secret project identifier in `.openai/hosting.json` is `appgprj_6a78ca63bc0081919782c2f2d06b38a8`. The files configure a Cloudflare-compatible worker build for Sites. This does not establish ownership of a separate Cloudflare account.

The hosting access configuration lists Zaid as the only owner, with no editors. File delivery does not grant hosting or domain administration. Zaid must separately decide what access Haydn needs and grant it through the relevant provider. No ownership, permissions, DNS records or deployment settings were changed while packaging.

## Repository

No standalone Silk Route GitHub repository was found during the handover check. This package supplies the reviewed source and current runtime assets directly, without Git history or repository credentials. A dedicated repository and any collaborator permissions would need to be arranged separately.

## Access to arrange separately

| Resource | Evidence in files | Owner action |
|---|---|---|
| Sites hosting | `.openai/hosting.json`, Sites build config and worker | Zaid confirms whether editor access is needed and grants it separately. |
| Domain/DNS | Canonical domain `silkroute.vip`; live status supplied above | Identify the registrar and DNS account, then arrange the required access. Those account identities are not established by this package. |
| Google Places | Worker reads `GOOGLE_MAPS_SERVER_KEY`; no value included | Arrange Google Cloud project/API/billing access and securely configure the runtime secret. Existing secret presence was not inspected. |
| Google Analytics | Public measurement ID `G-1WHT1TL6EY` in `analytics.js` | Grant property access separately if reporting is part of the handover. Consent-gated tracking is limited to the apex and `www` hosts in source. |
| Client media/creation records | Existing `assets/source/*/SOURCES.md` and README provenance | Arrange original Drive/photographer or generation-account access if future video production is needed. No account/session data is included. |

The public booking number in the source/README is `+27 74 537 7310`. Confirm control of that business channel and the final commercial details before changing booking operations. The existing [launch checklist](../LAUNCH_LEGAL_CHECKLIST.md) records client-owned details requiring review; its presence does not prove those steps are still outstanding.

Follow [setup](SETUP.md) for local builds and [media](MEDIA.md) for what the file package contains.
