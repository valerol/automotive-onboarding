# Onboarding project factory

## Architecture

There is one control spreadsheet and one container-bound Apps Script project.
That script is the central runtime for every onboarding project.

The factory creates a new Google Spreadsheet, copies only the sheets and their
data/formatting, resets operational state, and installs `centralProjectOnEdit`
for the new spreadsheet. The new spreadsheet has no bound Apps Script project.
The installable trigger belongs to the account that runs the factory and runs
under that account, so project operators do not authorize the runtime.

Runtime properties and caches are stored in the central script and namespaced
by Spreadsheet ID. Projects therefore share code but never share configuration,
DONE values, comments, filters, indexes, or migration markers.

## Required authorization

The owner of the central master grants Sheets, Drive, and trigger-management
access once. Creating a project may ask that owner to approve a newly added
scope after a deployment. Other project users receive access only to the data
spreadsheet and are not asked to authorize Apps Script.

After the trigger scope is first deployed, run `authorizeCentralProjectRuntime`
once from the master Apps Script editor and approve the requested permissions.

## Create a project

1. Open the central master.
2. Select **ЧЕКЛИСТ → Создать onboarding-проект**.
3. Enter the project name.
4. Paste the destination folder URL/ID, or leave it blank. If the master's
   parent folder is not exposed to the executing account, the project remains
   in that account's **My Drive** root. In the live deployment this is the
   `valerol@x-cart.com` account.
5. Open the returned spreadsheet and work in `ЧЕКЛИСТ`. Use the dropdown in
   `D2` for status filtering. Supported edits in `КОНФИГУРАЦИЯ` are saved and
   rebuild the checklist automatically.

The `ПРОЕКТЫ` registry stores the Spreadsheet ID, URL, central Trigger ID,
runtime version, and status `CENTRAL_ACTIVE`.

## Important limits

Google allows 20 installable triggers per user per script. This implementation
uses one trigger per project, so one central master supports at most 20 active
projects for its owner. Split projects between additional central masters only
when that limit is reached.

## Master copies

Do not copy the master. A second master would create a second runtime and split
trigger ownership and version control. Keep one central master and create only
data-only onboarding projects from it.

## Recovery

If initialization or trigger installation fails, the newly created partial
spreadsheet is moved to Drive trash and the failed registry entry is recorded
as `RESET_FAILED_TRASHED`. The source master is never modified by the copy.
