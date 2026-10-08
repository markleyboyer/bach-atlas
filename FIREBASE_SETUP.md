# Firebase sync setup (not yet activated)

Project: `bachatlas-253a3`. Code is staged on `firebase-sync`; main remains the working local-only atlas. Configuration and rules must be completed before merging.

1. In Firebase Project settings > General, add a Web app named Bach Atlas (or use an existing web app). Copy its public `firebaseConfig` values into `firebase-config.js`. No Analytics or Firebase Hosting is required. Do not share service-account keys.
2. In Authentication > Sign-in method, enable Google and choose the support email. In Authentication > Settings > Authorized domains add `markleyboyer.github.io` (hostname only). Add any later custom hostname as well.
3. Create Cloud Firestore in production mode. Choose the location carefully; it cannot be changed later. The included `firestore.rules` restrict access to the verified Google account `mark@bateshollow.com`, within that account’s own user path. Publish these rules in Firestore > Rules.
4. Merge this branch into main once configuration is ready. Enable GitHub Pages from main / root if it is not already enabled. Open https://markleyboyer.github.io/bach-atlas/ on both devices and sign in with the same Google account.
5. Export the current local journal first. After sign-in, use **Copy local journal to cloud · missing works only** to copy local entries. Existing cloud works are preserved. Local and cloud journals remain separate; signing out restores the original local journal.

## Verification before calling setup complete

On desktop, change one work's rating. Confirm **Synced**, then check it on the phone. Change the phone comment and check desktop. Edit different fields of the same work on both devices and verify both survive. Only simultaneous edits to the same field use last-write-wins. Expand a branch and check that an incoming update leaves it expanded. Verify a different account cannot read or write this journal. Confirm pending/offline changes reach the other device after reconnecting. Reload both devices and check persisted entries.

The web SDK uses persistent local Firestore cache, including pending writes. Use a trusted browser: this cache remains on the device after sign-out. The UI explicitly distinguishes cached/pending changes from confirmed sync. Sign-out waits for pending writes; when offline it can remain pending until connectivity returns. Export a backup if needed. Google sign-in uses a popup; allow popups if the phone browser blocks it.

A restored JSON backup is local-only; restore while signed out, then copy missing works. Remote updates change journal controls without rebuilding the catalogue tree. Each edit writes only changed fields so a note edit does not overwrite a rating from another device.

SDK: Firebase JavaScript 12.19.0, loaded as browser modules. No secrets, backend service account, or paid hosting setup is included. End-to-end Firebase verification requires the completed project configuration and published rules.
