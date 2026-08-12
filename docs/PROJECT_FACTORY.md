# Project factory

The master spreadsheet creates independent onboarding spreadsheets while all automation remains in the master Apps Script project.

## Creation flow

1. Open the master spreadsheet.
2. Choose `CHECKLIST -> Create onboarding project`.
3. Enter the project name.
4. Enter a target Google Drive folder link or ID, or leave it blank to use the master's current folder.
5. The factory creates a data-only spreadsheet, resets CONFIGURATION, generates the formula checklist and protected TASK POOL, writes INSTRUCTIONS, installs a central `onEdit` trigger, and adds a row to PROJECTS.

The account running the menu command creates and owns the new spreadsheet. That account must be allowed to add files to the target folder. Contributors with edit access to the master can run the command, but the first execution under each account may require Google authorization depending on the domain policy.

## Runtime behavior

The installed trigger runs only when Done or Applicable changes (to refresh checkbox protection), or when CONFIGURATION changes (to rebuild service branches). Native filters and Comment edits do not invoke Apps Script.

The central Apps Script project can have at most 20 installed triggers. Delete obsolete project triggers before creating more projects or split projects across additional central runtimes.

## Files excluded from copies

PROJECTS, legacy runtime/translation tabs, and timestamped recovery tabs are not copied into child projects.
