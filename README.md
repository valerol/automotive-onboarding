# Automotive Onboarding Runtime

Container-bound Google Apps Script for the canonical spreadsheet `Automotive Onboarding — Master`.

## Canonical live master

- Spreadsheet: [Automotive Onboarding — Master](https://docs.google.com/spreadsheets/d/1J_ZOrvOkijBczUgvsULNNQ9OJHoOhukmuDdgI3Varow/edit)
- Shared Drive folder: [X-Cart Support Team / Automotive Onboarding](https://drive.google.com/drive/folders/17Jp97WeO1sT0Yr7mOTSJOd5mz0sZGvte)
- Bound Apps Script: [Automotive Onboarding](https://script.google.com/home/projects/11zFoNe6_rezHdfUeKLlwACaihbLDUafAIaOgYYLykKZ0i0nbJk7l7kqy/edit)

The Shared Drive owns the master and its bound script. The previous externally
owned spreadsheet is retained only as a migration backup and must not be used
to create new onboarding projects or receive future `clasp` deployments.

## Files

- `Code.gs` — runtime, dependency enforcement, capabilities/gates, branch instantiation, validation, and the native Google Sheets workspace.
- `RuntimeModel.gs` — the 299 operator task templates reconstructed from spreadsheet revision 162. The 13 internal graph nodes are not operator tasks.
- `RuntimeMigrations.gs` — runtime/model compatibility checks and sequential, preservation-checked migrations.
- `ProjectFactory.gs` — data-only project creation, central triggers, metadata, and the project registry.
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
9. Reload the spreadsheet and select **CHECKLIST → Authorize and diagnose**. If the runtime displays an authorization window, select **Grant access**, approve access in Google, then run **Authorize and diagnose** again.
10. Confirm that the diagnostic reports access to `TASK POOL`, `_RUNTIME_DATA`, and the runtime lock.
11. Run `installChecklistWorkspace` once from the Apps Script editor, or select **CHECKLIST → Open checklist** after reloading the spreadsheet.

Configuration is stored in each project's `_RUNTIME_DATA!D1:E1`; English task display data remains in `A:B`. Runtime properties and caches live in the central script and are namespaced by Spreadsheet ID.

## Workspace

- `CHECKLIST` is the full-width working tab. It contains a persistent native filter. Users edit only `Applicable`, `DONE`, and `Comment`.
- `CONFIGURATION` is the structured project-configuration tab. In data-only projects every supported edit is saved and rebuilds the checklist automatically.
- `INSTRUCTIONS` is the operator-facing quick start, configuration map, state reference, and safe-edit guide. It is regenerated in English by the runtime.
- `TASK POOL` is the protected technical state and graph tab. Its protection warns against direct edits; Google Sheets owners can still override any protection, so routine work must happen in `CHECKLIST`.
- `_RUNTIME_DATA` remains hidden.

## GitHub / clasp setup

The repository is the source of truth. To bind another checkout to the canonical Apps Script project:

1. Copy `.clasp.json.example` to `.clasp.json`.
2. Replace `PASTE_SCRIPT_ID_HERE` with the canonical Script ID shown above (or copy it from **Apps Script → Project Settings → IDs**).
3. Run `npm install`, then authenticate locally with `npx clasp login`.
4. Use `npm run status` before `npm run push`.

`.clasp.json` contains a project identifier rather than credentials, but it is ignored by Git to avoid accidentally binding a fork to the live project. Never commit `.clasprc.json`; it contains OAuth credentials.

## Edit performance

Normal edits no longer call the full checklist rebuild:

- a comment resolves its stable Task ID and writes one pool cell;
- DONE and user-controlled applicability read the pool once, calculate the graph in memory, and write only changed rows;
- formatting, conditional formatting, filters, checkboxes, and validations are not recreated by the fast path;
- a central script lock serializes short edits, while per-spreadsheet cached Task ID row maps are versioned and verified before use.

A full `refreshChecklist_()` remains available for configuration, language/model changes, explicit refresh, migration, and incompatible sheet layouts. See [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) for the baseline call path and measurement boundaries.

## Safe live update

Back up the central master, run `npm test`, verify `clasp show-file-status`, and
deploy only the reviewed commit to the master's Script ID. Existing data-only
projects immediately use the updated handler on their next edit; they do not
receive code copies and do not need separate authorization or `clasp` updates.
Schema migrations remain explicit and must preserve configuration, DONE, and
comments by stable Task ID.

The factory requires full Google Sheets and Drive scopes to initialize a copied spreadsheet. No OAuth client secret or token belongs in this repository.

## Multiple onboarding projects

Keep one central master. Use **Create onboarding project** for each project. The factory creates a data-only spreadsheet, initializes its independent task state, installs a central `onEdit` trigger, and records its Trigger ID in `PROJECTS`. Project users do not authorize Apps Script; the trigger runs as the account that created it.

One central script supports up to 20 installable project triggers for its owner. Detailed creation and recovery instructions are in [`docs/PROJECT_FACTORY.md`](docs/PROJECT_FACTORY.md).

## Configuration model

Automotive integrations, payment gateways, carriers, and tax services are selected with checkboxes from fixed catalogs in `CONFIGURATION`.

### Applying catalog selections

Checkboxes and supported values in `CONFIGURATION` are applied automatically by the central installable trigger. The central master also retains its menu command for administrative use.

After a successful rebuild:

1. repeatable service tasks are inserted into their thematic sections rather than appended as one block;
2. integration tasks appear in Sections 2 and 4, payment tasks in Sections 2 and 10, carrier tasks in Sections 2 and 11, and tax-access tasks in Section 2;
3. selected automotive-integration branches are generated but remain `INACTIVE` unless `supplier_feed` is one of the selected source types;
4. E2E branches are generated only when at least one payment gateway and at least one shipping method are selected;
5. existing `DONE` and comment values are preserved for stable Task IDs that remain in the rebuilt model.

To verify a selection, search `CHECKLIST` for the service name or generated Task ID instead of looking only at the top or bottom of the sheet. A changed total task count is expected when repeatable service or E2E branches are added or removed; source types, overlap, and fitment can change applicability without necessarily changing the row count.

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

QA products are recorded in the task `Comment` field. The runtime creates one system QA sample branch. E2E scenarios are generated automatically from the selected payment gateways, shipping methods, and tax services. The minimum scenario set covers every selected payment gateway, shipping method, and tax service at least once.

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
5. Set a parent task to `NO`: its child rows must become `INACTIVE` and their checked `DONE` values must be cleared.
6. Confirm that the checklist language is fixed to English.
7. Confirm that task `01-05` is shown as `01-05`, not as a JavaScript date, and can be changed between `YES` and `NO` from the sidebar.

## Important

The live spreadsheet already contains the corrected formula fallback. Do not apply project configuration until the instance lists are known: saving configuration replaces placeholder rows with operational instances.
