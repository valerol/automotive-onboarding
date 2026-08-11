# Automotive Onboarding Runtime

Container-bound Google Apps Script for the spreadsheet `Automotive Onboarding — prototype`.

## Files

- `Code.gs` — runtime, dependency enforcement, capabilities/gates, branch instantiation, validation, and the native Google Sheets workspace.
- `RuntimeModel.gs` — the 299 operator task templates reconstructed from spreadsheet revision 162. The 13 internal graph nodes are not operator tasks.
- `Sidebar.html` — retained only as a legacy compatibility file; the working interface is no longer a sidebar.
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
9. Reload the spreadsheet and select **ЧЕКЛИСТ → Проверить доступ**. If the runtime displays an authorization window, select **Grant access**, approve access in Google, then run **Проверить доступ** again.
10. Confirm that the diagnostic reports access to `ПУЛ ТАСКОВ`, `_TRANSLATIONS`, and the document lock.
11. Run `installChecklistWorkspace` once from the Apps Script editor, or select **ЧЕКЛИСТ → Открыть чеклист** after reloading the spreadsheet.

The runtime uses only the current spreadsheet. Configuration is stored in `_TRANSLATIONS!D1:E1`; task translations remain in `A:C`. It does not use `PropertiesService`, Drive, URL fetches, or external storage. The manifest requests only current-spreadsheet and container-UI scopes.

## Workspace

- `ЧЕКЛИСТ` is the full-width working tab. It contains a persistent native filter. Users edit only `Актуален`, `DONE`, and `Комментарий`.
- `КОНФИГУРАЦИЯ` is the structured project-configuration tab. Use **ЧЕКЛИСТ → Сохранить конфигурацию и пересобрать** after making changes.
- `ПУЛ ТАСКОВ` is the protected technical state and graph tab. Its protection warns against direct edits; Google Sheets owners can still override any protection, so routine work must happen in `ЧЕКЛИСТ`.
- `_TRANSLATIONS` remains hidden.

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
- task IDs, parent IDs, and dependency IDs are always read and written as text, so values such as `01-05` cannot be converted to dates by Google Sheets.

## First smoke test

1. Configure one payment gateway and pickup as the only shipping method.
2. Leave `11-11`, `11-12`, and `12-29` open: checkout must remain waiting.
3. Complete `11-11` and `11-12`: shipping availability passes, while checkout remains waiting for `12-29`.
4. Attempt to complete a waiting task: the checkbox must be reset.
5. Set a parent task to `НЕТ`: its child rows must become `INACTIVE` and their checked `DONE` values must be cleared.
6. Switch EN/RU in the sidebar: task titles must change without reading external storage.
7. Confirm that task `01-05` is shown as `01-05`, not as a JavaScript date, and can be changed between `ДА` and `НЕТ` from the sidebar.

## Important

The live spreadsheet already contains the corrected formula fallback. Do not apply project configuration until the instance lists are known: saving configuration replaces placeholder rows with operational instances.
