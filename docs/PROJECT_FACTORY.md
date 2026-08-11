# Onboarding project factory

## Architecture

The clean master is a normal Google Spreadsheet with this container-bound Apps
Script project. `ProjectFactory.gs` copies the complete spreadsheet into a
selected Drive folder. Google copies the bound script together with the
spreadsheet, so every onboarding project owns its configuration, task pool,
DONE values, comments, dynamic branches, document properties, and runtime
metadata.

The factory does not create installable triggers and the normal `onEdit` path
does not call an Apps Script Library. Existing copies therefore remain
independent and do not share runtime state.

Creating a copy resets it to the default configuration, recreates the
operational pool from the model, restores model-provided default comments,
sets every DONE value to false, removes dynamic instance branches, and renders
a clean checklist. It never modifies the source spreadsheet.

If initialization fails, the newly created partial copy is moved to Google
Drive trash so source-project data is not left in the selected folder. The
failed attempt remains visible in the registry as `RESET_FAILED_TRASHED` and
the trashed copy is recoverable through Drive.

## Required authorization

The factory needs two Google scopes that the checkbox runtime itself does not:

- full Google Sheets access, to initialize the newly copied spreadsheet;
- Google Drive access, to copy the master into the selected folder.

They are declared in `appsscript.json`. Google asks for consent when the
factory is run for the first time. No OAuth client, token, password, GitHub
credential, or Apps Script API credential is stored by the project.

## Create a clean master

1. Deploy the reviewed code to a non-production copy first.
2. Open that spreadsheet and authorize the runtime.
3. Select **ЧЕКЛИСТ → Создать чистую мастер-копию**.
4. Enter the master name and the destination Google Drive folder URL or ID.
5. Open the returned spreadsheet and run **Проверить совместимость runtime**.
6. If requested, run **Применить миграции runtime**.
7. Confirm the clean master has zero DONE values and the default configuration.

## Create an onboarding project

1. Open the clean master.
2. Select **ЧЕКЛИСТ → Создать onboarding-проект**.
3. Enter the project name and destination Google Drive folder URL or ID.
4. Open the returned URL.
5. Run **Проверить совместимость runtime** and apply a migration only if the
   check requests it.
6. Configure the project in `КОНФИГУРАЦИЯ`, then use **Сохранить конфигурацию и
   пересобрать**.

The master adds one row to `ПРОЕКТЫ` with name, Spreadsheet ID, URL, an empty
Script ID field, creation date, runtime version, and migration status. Google
does not expose the copied container-bound Script ID reliably through the
Spreadsheet or Drive services, so the field is intentionally left blank. It
can be filled manually from **Apps Script → Project Settings → IDs**.

## Versions and migrations

`RUNTIME.runtimeVersion` is the runtime schema version. `RUNTIME_MODEL.version`
is tracked separately. `RuntimeMigrations.gs` contains sequential `N → N+1`
steps; missing steps stop migration. `onOpen` reports incompatibility without
silently migrating the spreadsheet.

Migration snapshots configuration and task state by stable Task ID. When a
model refresh is required, the operational pool is rebuilt using the existing
stable-ID merge. The migration then verifies configuration, applicability,
DONE, and comments. A failed preservation check restores the snapshot and
leaves the project marked as requiring migration.

## Updating existing projects

This minimal version intentionally does not push code into existing copies.
Centralized updates would require the Apps Script API and a separate controlled
deployment identity. Keep the new code in Git, test it against a copy, then
update each bound script with `clasp` and run the documented migration. Do not
store `.clasprc.json`, OAuth tokens, or GitHub tokens in the spreadsheet or
repository.

## Recovery

Before updating a project, make a Drive copy of its spreadsheet. If migration
fails, keep the failed copy for diagnosis and continue using the pre-update
copy. The migration itself restores its in-sheet snapshot when a preservation
check fails, but the Drive copy protects against permission errors, manual
changes, and failures outside the migration code.
