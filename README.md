# Automotive Onboarding Runtime

Container-bound Google Apps Script for the spreadsheet `Automotive Onboarding — prototype`.

## Files

- `Code.gs` — runtime, dependency enforcement, capabilities/gates, branch instantiation, validation, and sidebar API.
- `RuntimeModel.gs` — the 299 operator task templates reconstructed from spreadsheet revision 162. The 13 internal graph nodes are not operator tasks.
- `Sidebar.html` — English/Russian task UI and structured project configuration.
- `appsscript.json` — V8 manifest.

## Installation

1. Open the spreadsheet.
2. Select **Extensions → Apps Script**.
3. Replace the existing `Code.gs` with this package's `Code.gs`.
4. Add a script file named `RuntimeModel` and paste `RuntimeModel.gs`.
5. Add an HTML file named `Sidebar` and paste `Sidebar.html`.
6. Open **Project Settings**, enable display of `appsscript.json`, and replace it with this package's manifest.
7. Save the project.
8. Run `onOpen` once from the editor.
9. Reload the spreadsheet and select **Automotive Runtime → Authorize and diagnose**. If the runtime displays an authorization window, select **Grant access**, approve access in Google, then run **Authorize and diagnose** again.
10. Confirm that the diagnostic reports access to `ПУЛ ТАСКОВ`, `_TRANSLATIONS`, and the document lock.
11. Open **Automotive Runtime → Open runtime**.

The runtime uses only the current spreadsheet. Configuration is stored in `_TRANSLATIONS!D1:E1`; task translations remain in `A:C`. It does not use `PropertiesService`, Drive, URL fetches, or external storage. The manifest requests only current-spreadsheet and container-UI scopes.

## GitHub / clasp setup

The repository is the source of truth. To bind it to the existing Apps Script project:

1. Copy `.clasp.json.example` to `.clasp.json`.
2. Replace `PASTE_SCRIPT_ID_HERE` with the Script ID from **Apps Script → Project Settings → IDs**.
3. Run `npm install`, then authenticate locally with `npx clasp login`.
4. Use `npm run status` before `npm run push`.

`.clasp.json` contains a project identifier rather than credentials, but it is ignored by Git to avoid accidentally binding a fork to the live project. Never commit `.clasprc.json`; it contains OAuth credentials.

## Configuration model

Repeat collections are entered as `CODE|Display name`:

- integrations;
- payment gateways;
- carriers;
- tax services;
- QA products;
- E2E scenarios.

Saving configuration rebuilds repeatable branches and preserves state for Task IDs that still exist. The following static rules are enforced:

- `Dependencies` is AND;
- inactive direct members are excluded from direct AND membership;
- `Parent ID` cascades only `INACTIVE`;
- `INACTIVE` does not produce capabilities;
- checkout requires any verified payment method, any verified shipping method, tax readiness, and completed checkout verification;
- launch requires all declared payment and shipping methods;
- pickup is verified by `11-11 + 11-12`; `12-29` separately verifies checkout;
- empty payment, shipping, QA-product, or E2E-scenario sets produce `BLOCKED` where the capability is mandatory;
- premature `DONE` is rejected and reset;
- dependency and parent cycles are rejected.

## First smoke test

1. Configure one payment gateway and pickup as the only shipping method.
2. Leave `11-11`, `11-12`, and `12-29` open: checkout must remain waiting.
3. Complete `11-11` and `11-12`: shipping availability passes, while checkout remains waiting for `12-29`.
4. Attempt to complete a waiting task: the checkbox must be reset.
5. Set a parent task to `НЕТ`: its child rows must become `INACTIVE` and their checked `DONE` values must be cleared.
6. Switch EN/RU in the sidebar: task titles must change without reading external storage.

## Important

The live spreadsheet already contains the corrected formula fallback. Do not apply project configuration until the instance lists are known: saving configuration replaces placeholder rows with operational instances.
