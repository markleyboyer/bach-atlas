# Bach Listening Atlas

An interactive Bach catalogue and personal listening journal, designed for GitHub Pages.

## Use

Expand branches by genre, instrumentation, decade, or key. Double-down and double-up controls expand or collapse an entire subtree. Expand a work to find its recording links, a short opening excerpt when available, and your listening journal.

The excerpt is up to 60 seconds from the first musical section listed on the official All of Bach page. It is a recognition aid, not a claim that the opening represents an entire large work. The music plays in the official YouTube embed; audio is not copied or hosted in this repository. Use the full-performance link if an embed is unavailable in your browser or region.

## Publish with GitHub Pages

1. Create a repository named `bach-atlas` on your GitHub account. A public repository works with GitHub Free. Initialize it with a README so there is a `main` branch.
2. Upload the files in this folder to the repository root, replacing the initial README with this one. Keep `index.html`, `app.js`, `catalogue.js`, `recordings.js`, `styles.css`, and `.nojekyll` together.
3. In the repository, open Settings → Pages. Set Source to **Deploy from a branch**, choose **main** and **/(root)**, and save.
4. GitHub displays the published address when deployment completes. For `markleyboyer/bach-atlas`, it will normally be `https://markleyboyer.github.io/bach-atlas/`.

GitHub preserves the code and data history. Commit changes to update the site. No build service, API key, or paid hosting is required for this static version.

## Your journal

Journal entries save in this browser's local storage, under stable BWV entry identifiers. Reordering, filtering, and site code updates do not erase them. They are not uploaded to GitHub. Browser-data clearing, private browsing, or a different device/browser can make these entries unavailable.

Use **Back up journal** to download a portable JSON copy. **Restore journal** imports that copy into another browser. Import merges entries; matching BWV entries in the backup replace the existing notes for those entries. The backup may contain personal comments, so keep it outside the public repository. Cross-device automatic synchronization is not implemented in this version.

If you entered notes in the earlier ChatGPT view, back up that journal and restore it in the hosted site. The two views have different browser storage locations.

## Files and future editing

- `index.html`: controls and catalogue shell.
- `styles.css`: visual styling and compact arrow controls.
- `app.js`: hierarchy, sample playback, search, and journal behavior.
- `catalogue.js`: catalogue facts and editorial significance selections.
- `recordings.js`: verified official performance links, video identifiers, performer credits, and excerpt boundaries.
- `DATA_SOURCES.md`: provenance and scope.

Preview from a local HTTP server, for example `python -m http.server 8080`. Open `http://localhost:8080`. YouTube can refuse playback from a directly opened `file://` document; hosted HTTP/HTTPS use is preferable.

## Scope

The 1,548 catalogue rows include versions, reconstructions, historical appendix entries, and separately listed parts. They are not 1,548 distinct authenticated compositions. Catalogue authenticity and survival labels reflect what the public source flags, not a fresh scholarly assessment. Composition dates are approximate in many cases. Stars and diamonds are editorial priorities.

All of Bach coverage is incomplete. Entries without a matched performance explicitly say so. When a version is linked to a recording of the base BWV number, that relationship is labelled rather than presented as an exact match.

## Optional private cloud journal

Firebase preparation lives on `firebase-sync`. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for configuration and end-to-end checks. Sync is inactive until the public web config and owner-only Firestore rules are completed. Run `node tests/journal-sync.cjs` for journal regression and cloud-bridge checks.
