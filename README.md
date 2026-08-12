# Automotive Onboarding

Google Sheets checklist backed by one central Apps Script project.

## Architecture

- `RuntimeModel.gs` is the canonical, operator-inaccessible task template.
- `TASK POOL` is a protected generated copy of the instantiated canonical list.
- `CHECKLIST` is the operator workspace.
- `CONFIGURATION` selects integrations, payment gateways, carriers, tax services, sources, shipping options, and fitment.
- `PROJECTS` is the master registry of generated onboarding spreadsheets.

The checklist uses spreadsheet formulas for `Applicable`, `Status`, and `Waiting for`. Normal task work does not ask Apps Script to recalculate the dependency graph. Apps Script is used only to rebuild service branches after a configuration change, restore the canonical list, create a project, and refresh checkbox protection.

## Checklist columns

1. Task
2. Done
3. Comment
4. Applicable
5. Status
6. Task ID
7. Waiting for

Use the standard Google Sheets filter dropdowns in row 6. Filtering is local to Google Sheets and never executes Apps Script.

## Status rules

- `INACTIVE`: the task or an ancestor has `Applicable = NO`.
- `DONE`: an applicable task is completed.
- `WAITING`: at least one applicable dependency is not done.
- `READY`: applicable, not done, and all applicable dependencies are done.

`READY` checkboxes can be selected and `DONE` checkboxes can be cleared. Done cells for `WAITING` and `INACTIVE` rows are protected. Task names, IDs, dependencies, formulas, and complete rows cannot be deleted or edited by operators. Comment and Applicable remain editable.

## Configuration and service branches

Changing an input checkbox in `CONFIGURATION` rebuilds the generated sheets while preserving Done, Comment, and operator-controlled Applicable values by stable Task ID. Only service branches are generated:

- automotive integrations;
- payment gateways;
- carriers;
- tax services.

QA product combinations and E2E combinations are not generated. Capabilities, gates, translations, language switching, legacy sidebar, custom status-filter logic, and sequential migrations have been removed.

## Recovery

Use `CHECKLIST -> Restore canonical checklist` if a formula or row is missing. The command reconstructs the checklist from `RuntimeModel.gs` and the current configuration while preserving task state by Task ID.

`migrateMasterToFormulaChecklist()` creates a hidden timestamped copy of the current CHECKLIST before installing this architecture.

## Creating projects

In the master spreadsheet choose `CHECKLIST -> Create onboarding project`, enter a name, and optionally enter a Google Drive folder link or ID. The central runtime creates a data-only spreadsheet, initializes a clean checklist, installs its edit trigger, and records it in `PROJECTS`.

Operators do not authorize Apps Script for ordinary checklist edits. The central runtime owner authorizes project creation and triggers. Google Apps Script currently limits this architecture to 20 installed project triggers per central script.

## Development

```bash
npm test
```

Deploy the Apps Script files with clasp, then run `migrateMasterToFormulaChecklist` once in the master project.
