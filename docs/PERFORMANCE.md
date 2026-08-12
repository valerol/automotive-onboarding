# Performance model

Task status is calculated by protected Google Sheets formulas, not by Apps Script.

| Operator action | Apps Script call | Result |
|---|---:|---|
| Change native filter | No | Google Sheets filters existing rows |
| Edit Comment | No | Cell value changes only |
| Change Done on a TODO task | Yes, lightweight | Sheets recalculates formulas; script refreshes which Done cells are protected |
| Change Applicable | Yes, lightweight | Sheets recalculates formulas; script refreshes which Done cells are protected |
| Change CONFIGURATION | Yes, full rebuild | Service branches and formulas are regenerated |
| Restore canonical checklist | Yes, full rebuild | Missing rows and formulas are restored |

This removes the former full runtime graph recalculation from ordinary checklist edits. Filtering is entirely native and has no network or Apps Script round trip.
