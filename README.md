# Automotive Onboarding Runtime

Container-bound Google Apps Script for the spreadsheet `Automotive Onboarding — prototype`.

## Files

- `Code.gs` — runtime, dependency enforcement, capabilities/gates, branch instantiation, validation, and the native Google Sheets workspace.
- `RuntimeModel.gs` — the 299 operator task templates reconstructed from spreadsheet revision 162. The 13 internal graph nodes are not operator tasks.
- `RuntimeMigrations.gs` — runtime/model compatibility checks and sequential, preservation-checked migrations.
- `ProjectFactory.gs` — clean-master creation, independent project copies, metadata, and the central project registry.
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

## Edit performance

Normal edits no longer call the full checklist rebuild:

- a comment resolves its stable Task ID and writes one pool cell;
- DONE and user-controlled applicability read the pool once, calculate the graph in memory, and write only changed rows;
- formatting, conditional formatting, filters, checkboxes, and validations are not recreated by the fast path;
- a document lock serializes short edits, while cached Task ID row maps are versioned and verified before use.

A full `refreshChecklist_()` remains available for configuration, language/model changes, explicit refresh, migration, and incompatible sheet layouts. See [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) for the baseline call path and measurement boundaries.

## Safe live update

Do not push a new runtime directly into the working spreadsheet first.

1. Make a Google Drive copy of the working spreadsheet.
2. Bind a separate local checkout to the copy's Script ID.
3. Run `npm test`, `npm run status`, then `npm run push -- --force` against the copy.
4. Open the copy, approve the new Drive/Sheets scopes, and run **ЧЕКЛИСТ → Проверить совместимость runtime**.
5. Run **Применить миграции runtime** only when requested.
6. Verify the configuration JSON and compare DONE/comment values by Task ID before and after migration.
7. Measure a comment edit, DONE on/off, and a manual refresh in Apps Script **Executions**. Local Node.js timings do not measure Google service latency.
8. Exercise dependency unlock/relock, INACTIVE dependencies, user applicability, language change, and configuration rebuild in the copy.
9. Only after those checks pass, bind `clasp` to the live Script ID, confirm `clasp show-file-status`, push the reviewed commit, and apply the same migration procedure.

The factory requires full Google Sheets and Drive scopes to initialize a copied spreadsheet. No OAuth client secret or token belongs in this repository.

## Multiple onboarding projects

Use **Создать чистую мастер-копию** once to produce a clean, current master in a selected Drive folder. From that master, use **Создать onboarding-проект** for each independent project. The copy receives its own task pool, configuration, statuses, comments, dynamic branches, metadata, and bound script. The master records the copy in `ПРОЕКТЫ`.

The copied container-bound Script ID is intentionally left blank in the registry because Spreadsheet/Drive services do not expose it reliably. Fill it manually from **Apps Script → Project Settings → IDs** when needed. Detailed creation, migration, update, and recovery instructions are in [`docs/PROJECT_FACTORY.md`](docs/PROJECT_FACTORY.md).

## Configuration model

Automotive integrations, payment gateways, carriers, and tax services are selected with checkboxes from fixed catalogs in `КОНФИГУРАЦИЯ`.

Automotive integrations:

- `T14` — Turn14 Distribution;
- `MEYER` — Meyer Distributing;
- `KEYSTONE` — Keystone Automotive Operations;
- `ATD` — American Tire Distributors (ATD);
- `WHEEL_PROS` — Wheel Pros;
- `APG` — APG Wholesale – ex. Premier Performance;
- `DIX` — Dix Performance North;
- `MOTOR_STATE` — Motor State Distributing.

Payment gateways:

- `ACIMA` — Acima;
- `PAYTOMORROW` — Paytomorrow;
- `AFFIRM` — Affirm;
- `XPAYMENTS` — X-Payments;
- `SQUARE` — Square;
- `BRAINTREE` — Braintree;
- `AMAZON` — Amazon;
- `STRIPE` — Stripe;
- `PAYPAL` — PayPal.

Carriers:

- `DHL` — DHL;
- `CANADA_POST` — CanadaPost;
- `UPS` — UPS;
- `FEDEX` — FedEx;
- `USPS` — USPS;
- `AUSTRALIA_POST` — Australia Post.

Tax services:

- `TAXJAR` — TaxJar;
- `AVATAX` — AvaTax.

QA products are recorded in the task `Комментарий` field. The runtime creates one system QA sample branch. E2E scenarios are generated automatically from the selected payment gateways, shipping methods, and tax services. The minimum scenario set covers every selected payment gateway, shipping method, and tax service at least once.

Catalog source types do not create task instances. They only control the effective applicability of existing tasks:

- common catalog and QA tasks remain available for every source type;
- `CSV` and `supplier_feed` activate existing import tasks;
- `supplier_feed` additionally activates integration and scheduled-import tasks;
- `manual` uses the common catalog workflow, including task `03-02`, without a separate generated branch;
- source-conflict tasks become applicable only when at least two source types are selected and `Multiple sources overlap` is enabled.

Non-carrier shipping methods control existing shipping tasks and participate in automatic E2E generation:

- `flat_rate` controls `11-02`;
- `supplier_rate` controls `04-INT-13` and `11-03`;
- `free_shipping` controls `11-04` and `13-10`;
- `pickup` is verified by the existing `11-11 + 11-12` pair and is included in generated E2E coverage;
- every selected carrier automatically becomes a `carrier:<CODE>` shipping method and uses its existing access and rate-verification branches.

`MMY / fitment applies` does not create tasks. When disabled, the existing Section 8 tasks and related fitment-only checks are `INACTIVE`. When enabled, required fitment import, QA, E2E, customer-review, and launch checks are activated; optional fitment checks keep their own task-level applicability.

Applicability for tasks directly controlled by configuration is read-only in the sidebar and is re-applied during every runtime recalculation.

Saving configuration rebuilds repeatable branches and preserves state for Task IDs that still exist. The following static rules are enforced:

- `Dependencies` is AND;
- inactive direct members are excluded from direct AND membership;
- `Parent ID` cascades only `INACTIVE`;
- `INACTIVE` does not produce capabilities;
- checkout requires any verified payment method, any verified shipping method, tax readiness, and completed checkout verification;
- launch requires all declared payment and shipping methods;
- pickup is verified by `11-11 + 11-12`; `12-29` separately verifies checkout;
- empty payment or shipping sets produce `BLOCKED` where the capability is mandatory;
- an E2E scenario set is generated only when at least one payment gateway and one shipping method are selected;
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
