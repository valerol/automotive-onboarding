# Runtime performance diagnosis

## Baseline execution paths

The original checklist edit handler called `updateTaskFromSidebar()` and then
`refreshChecklist_()` for every editable cell. `updateTaskFromSidebar()` itself
recalculated the runtime and returned `getRuntimeState()`, which recalculated it
again, read it again, and validated it. `refreshChecklist_()` then recalculated
and read the pool once more before rebuilding the visible sheet.

Minimum baseline work for one edit, before branches caused by invalid `DONE`
values:

| Edit | Full graph recalculations | Full operational-state reads | Visible checklist rebuild |
| --- | ---: | ---: | --- |
| Comment | 3 | 6 | Yes |
| DONE off | 3 | 6 | Yes |
| DONE on | 4 | 8 | Yes |
| User applicability | 3 | 6 | Yes |
| Language | 1 | 2 | Yes |
| Manual refresh | 1 | 2 | Yes |
| Configuration save | 3 plus pool rebuild | 7 | Yes |

Each operational-state read performed both `getValues()` and
`getDisplayValues()` over the entire ten-column pool. A visible rebuild showed
all rows, cleared all content, formatting, and validations, wrote every row,
recreated applicability validations and DONE checkboxes section by section,
and reapplied row visibility. This explains the approximately ten-second
latency for a single checkbox.

## Fast path

- Comment: resolve `Task ID -> pool row`, verify the ID at that row, and write
  one comment cell. No graph calculation or visible-sheet rebuild.
- DONE/applicability: read the ten-column pool once, calculate the complete
  graph in memory, reject invalid completion, converge invalid downstream DONE
  values, and write only changed task rows.
- The visible checklist receives only changed status/applicability/DONE/waiting
  cells. It is not cleared and its formatting, filters, conditional formatting,
  checkboxes, and validations are not recreated.
- Source/configuration rules remain in `configuredTaskApplicable_()` and
  `configuredLocalApplicability_()`; the fast path does not create tasks.
- A central script lock serializes edits. The comment path holds it only around row
  verification and one write. No Apps Script Library is used.

## Indexes and invalidation

The runtime builds `byId`, pool-row, reverse-dependency, and child indexes in
memory. Pool and checklist row maps are cached per document. The cache is
invalidated by configuration/pool rebuilds, and a full checklist refresh writes
the current fast-path and model versions. A missing/mismatched version or a
row/Task-ID mismatch falls back to a full refresh or rejects the edit with an
explicit refresh instruction.

## Measurement

`createRuntimeTimer_()` measures read, calculation, pool-write,
checklist-write, and finalize stages in memory. It emits one compact warning
only when a fast edit exceeds three seconds; it does not persist detailed logs.

`npm test` measures the pure in-memory graph locally. That benchmark validates
algorithmic cost only. The sub-second comment and one-to-three-second DONE
targets must still be measured in the live spreadsheet using Apps Script
Executions after the safe deployment procedure; local Node.js timings do not
include Google Sheets service latency.
