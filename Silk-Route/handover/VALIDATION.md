# Packaging and verification

Prepared on 30 September 2026 from the local Silk Route project. The source files and supplied runtime media are unchanged; handover documentation and manifests are new.

Verification used a clean dependency install in the isolated handover copy, Node 22.22.3 and npm 10.9.8. The following completed successfully:

- `npm ci` using the supplied lockfile.
- `npm run check`: nine pages, shared assets, metadata and enquiry fields.
- `node --test scripts/analytics.test.mjs`: all three tests passed.
- `npm run build`: static production build passed.
- `npm run build:sites`: worker and client builds passed; preparation embedded all nine pages.

All 13 current frontend asset references are present. The additional SVG mark required by the existing site check is included. Both current hero films, all eight WebP vehicle photographs and public social-preview assets are supplied. The final archive is checked against the manifest for entry names, lengths and SHA-256 hashes; every supplied source/runtime file must match its recorded source hash. The JSON and CSV manifests list all other archive files and intentionally exclude themselves.

The package was assembled from an explicit allowlist. Excluded: `.env` and `.dev.vars` files (including `.env.example`), credential files, Git history, browser profiles/cookies/caches, local hosting state, `node_modules`, build outputs, logs, personal files and unrelated projects. Credential-file contents were not opened. The original project was not changed.

Raw originals and historical production media are excluded from this runtime handover: photographer JPEGs, source plates, alternate films, historical masters, storyboards, contact sheets, social drafts and temporary assemblies. Existing source/licensing notes remain included. These exclusions do not prevent either verified website build; media-editing scripts need the excluded inputs for future rerenders. See [media](MEDIA.md).

No deployment, account permission change or email was performed. Live version equivalence, account ownership transfer and runtime Google secret configuration were not verified by packaging. See [hosting and access](HOSTING_AND_ACCESS.md).
