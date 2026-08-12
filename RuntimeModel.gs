const RUNTIME_MODEL = Object.freeze({
  "version": "2.0.0",
  "sourceRevision": "162",
  "tasks": [
    {
      "id": "01-01",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm automotive integrations",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "Output: final list of integrations used in the project.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-02",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm catalog source",
      "parent": "",
      "dependencies": [
        "01-01"
      ],
      "defaultApplicable": "YES",
      "comment": "Confirm the source or combination of sources used for catalog data.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-03",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm pricing source",
      "parent": "",
      "dependencies": [
        "01-01"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined pricing and stock item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-04",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm stock source",
      "parent": "",
      "dependencies": [
        "01-01"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined pricing and stock item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-05",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Receive final brands list",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-06",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm provider-side brand approval requirements",
      "parent": "",
      "dependencies": [
        "01-01",
        "01-05"
      ],
      "defaultApplicable": "YES",
      "comment": "Section 1 confirms which approvals are required; Section 2 verifies that they were actually granted.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-07",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm product categories",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-08",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm categories excluded from import",
      "parent": "01-01",
      "dependencies": [
        "01-07"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined exclusions item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-09",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm brands excluded from import",
      "parent": "01-01",
      "dependencies": [
        "01-05"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined exclusions item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-10",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm MMY or YMM requirement",
      "parent": "",
      "dependencies": [
        "01-02"
      ],
      "defaultApplicable": "YES",
      "comment": "The task remains applicable even when the answer is No; downstream fitment tasks are then set to inactive.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-11",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm VIN Lookup requirement",
      "parent": "",
      "dependencies": [
        "01-02"
      ],
      "defaultApplicable": "YES",
      "comment": "The task remains applicable even when the answer is No.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-12",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm pricing rules",
      "parent": "",
      "dependencies": [
        "01-03"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from pricing and markup rules.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-13",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm markup rules",
      "parent": "",
      "dependencies": [
        "01-03"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from pricing and markup rules.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-14",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm inventory tracking rules",
      "parent": "",
      "dependencies": [
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "Confirm rules and exceptions; this is not a manual check of every product.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-15",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm out-of-stock product display behavior",
      "parent": "",
      "dependencies": [
        "01-14"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-16",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm backorder behavior",
      "parent": "",
      "dependencies": [
        "01-14"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only if backorders are applicable.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-17",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm automotive stock source handling rules",
      "parent": "",
      "dependencies": [
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-18",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm stock import settings",
      "parent": "",
      "dependencies": [
        "01-17"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined stock and price import settings item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-19",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm price import settings",
      "parent": "",
      "dependencies": [
        "01-03",
        "01-12",
        "01-13"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined stock and price import settings item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-20",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm product variations display mode",
      "parent": "",
      "dependencies": [
        "01-02"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only if product options or variants are applicable.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-21",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm shipping requirements",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-22",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm tax requirements",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-23",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm payment methods",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-24",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Document custom requirements",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "DONE is valid when requirements are documented or their absence is confirmed.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "01-25",
      "section": "1. SCOPE AND REQUIREMENTS CONFIRMED",
      "en": "Confirm planned launch date",
      "parent": "",
      "dependencies": [],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "02-INT-00",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: request missing access from customer",
      "parent": "",
      "dependencies": [
        "01-01"
      ],
      "defaultApplicable": "NO",
      "comment": "Conditional. Clone once per integration only when access is missing; replace INT with a unique code.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-INT-01",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: receive credentials through Secure Credentials Form",
      "parent": "",
      "dependencies": [
        "01-01",
        "02-INT-00"
      ],
      "defaultApplicable": "YES",
      "comment": "Branch root for this integration. Clone once per confirmed integration.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-INT-02",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: verify access",
      "parent": "02-INT-01",
      "dependencies": [
        "02-INT-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-INT-03",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: verify account is active",
      "parent": "02-INT-01",
      "dependencies": [
        "02-INT-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-INT-04",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: verify required brand approvals are granted",
      "parent": "02-INT-01",
      "dependencies": [
        "01-06",
        "02-INT-02"
      ],
      "defaultApplicable": "YES",
      "comment": "Set inactive when the integration has no provider-side brand approval requirement.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-INT-05",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: test API credentials successfully",
      "parent": "02-INT-01",
      "dependencies": [
        "02-INT-02",
        "02-INT-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-INT-06",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Integration}: configure additional FTP import",
      "parent": "02-INT-01",
      "dependencies": [
        "02-INT-02"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when an additional FTP import is required.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "02-PAY-00",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Payment gateway}: request missing access from customer",
      "parent": "",
      "dependencies": [
        "01-23"
      ],
      "defaultApplicable": "NO",
      "comment": "Conditional. Clone once per gateway only when access is missing.",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "02-PAY-01",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Payment gateway}: receive credentials through Secure Credentials Form",
      "parent": "",
      "dependencies": [
        "01-23",
        "02-PAY-00"
      ],
      "defaultApplicable": "YES",
      "comment": "Branch root. Clone once per confirmed payment gateway.",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "02-PAY-02",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Payment gateway}: test credentials successfully",
      "parent": "02-PAY-01",
      "dependencies": [
        "02-PAY-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "02-SHIP-00",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Carrier}: request missing access from customer",
      "parent": "",
      "dependencies": [
        "01-21"
      ],
      "defaultApplicable": "NO",
      "comment": "Conditional. Clone once per carrier only when access is missing.",
      "scope": "REPEAT",
      "collection": "carriers"
    },
    {
      "id": "02-SHIP-01",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Carrier}: receive credentials through Secure Credentials Form",
      "parent": "",
      "dependencies": [
        "01-21",
        "02-SHIP-00"
      ],
      "defaultApplicable": "YES",
      "comment": "Branch root. Clone once per confirmed carrier.",
      "scope": "REPEAT",
      "collection": "carriers"
    },
    {
      "id": "02-SHIP-02",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Carrier}: test credentials successfully",
      "parent": "02-SHIP-01",
      "dependencies": [
        "02-SHIP-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "carriers"
    },
    {
      "id": "02-TAX-00",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Tax service}: request missing access from customer",
      "parent": "",
      "dependencies": [
        "01-22"
      ],
      "defaultApplicable": "NO",
      "comment": "Conditional. Clone once per tax service only when access is missing.",
      "scope": "REPEAT",
      "collection": "tax_services"
    },
    {
      "id": "02-TAX-01",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Tax service}: receive credentials through Secure Credentials Form",
      "parent": "",
      "dependencies": [
        "01-22",
        "02-TAX-00"
      ],
      "defaultApplicable": "YES",
      "comment": "Branch root. Clone once per confirmed tax service.",
      "scope": "REPEAT",
      "collection": "tax_services"
    },
    {
      "id": "02-TAX-02",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "{Tax service}: test credentials successfully",
      "parent": "02-TAX-01",
      "dependencies": [
        "02-TAX-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "tax_services"
    },
    {
      "id": "02-90",
      "section": "2. ACCESS AND ACCOUNTS",
      "en": "Verify that no employee personal or temporary credentials are used",
      "parent": "",
      "dependencies": [
        "02-INT-01",
        "02-PAY-01",
        "02-SHIP-01",
        "02-TAX-01"
      ],
      "defaultApplicable": "YES",
      "comment": "After instantiation, Dependencies must list every applicable credential-receipt task.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-01",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Select primary category source",
      "parent": "",
      "dependencies": [
        "01-01",
        "01-02",
        "01-03",
        "01-04",
        "01-05",
        "01-06",
        "01-07",
        "01-08",
        "01-09",
        "01-10",
        "01-11",
        "01-12",
        "01-13",
        "01-14",
        "01-15",
        "01-16",
        "01-17",
        "01-18",
        "01-19",
        "01-20",
        "01-21",
        "01-22",
        "01-23",
        "01-24",
        "01-25"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-02",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Import or create categories",
      "parent": "",
      "dependencies": [
        "03-01"
      ],
      "defaultApplicable": "YES",
      "comment": "One outcome; import and manual creation are alternative methods, so the item is not split.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-03",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Disable unnecessary categories",
      "parent": "",
      "dependencies": [
        "03-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-04",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Verify categories match selected brands and catalog scope",
      "parent": "",
      "dependencies": [
        "03-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-05",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Remove empty technical categories",
      "parent": "",
      "dependencies": [
        "03-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-06",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Resolve obvious duplicate categories",
      "parent": "",
      "dependencies": [
        "03-02"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive completion criterion replacing 'No obvious duplicate categories'.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-07",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Verify category hierarchy",
      "parent": "",
      "dependencies": [
        "03-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-08",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Verify category names",
      "parent": "",
      "dependencies": [
        "03-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-09",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Verify storefront category navigation",
      "parent": "",
      "dependencies": [
        "03-07",
        "03-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-10",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Confirm product-to-category mapping rules",
      "parent": "",
      "dependencies": [
        "03-01",
        "01-07"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-11",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Remove or disable demo categories",
      "parent": "",
      "dependencies": [
        "01-01",
        "01-02",
        "01-03",
        "01-04",
        "01-05",
        "01-06",
        "01-07",
        "01-08",
        "01-09",
        "01-10",
        "01-11",
        "01-12",
        "01-13",
        "01-14",
        "01-15",
        "01-16",
        "01-17",
        "01-18",
        "01-19",
        "01-20",
        "01-21",
        "01-22",
        "01-23",
        "01-24",
        "01-25"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when demo categories exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-12",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Remove or disable demo products",
      "parent": "",
      "dependencies": [
        "01-01",
        "01-02",
        "01-03",
        "01-04",
        "01-05",
        "01-06",
        "01-07",
        "01-08",
        "01-09",
        "01-10",
        "01-11",
        "01-12",
        "01-13",
        "01-14",
        "01-15",
        "01-16",
        "01-17",
        "01-18",
        "01-19",
        "01-20",
        "01-21",
        "01-22",
        "01-23",
        "01-24",
        "01-25"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when demo products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-13",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Verify Imported Categories structure mapping to store categories",
      "parent": "",
      "dependencies": [
        "03-02",
        "03-10"
      ],
      "defaultApplicable": "YES",
      "comment": "Category mapping verification.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "03-14",
      "section": "3. CATALOG ARCHITECTURE",
      "en": "Hide Shop by Brand block",
      "parent": "",
      "dependencies": [
        "01-05"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when the store sells one brand.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "04-INT-01",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: establish a successful connection",
      "parent": "",
      "dependencies": [
        "02-INT-05"
      ],
      "defaultApplicable": "YES",
      "comment": "Branch root. Clone the complete Section 4 block once per confirmed integration.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-02",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: retrieve available brands",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-03",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: select import brands",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-02",
        "01-05",
        "01-09",
        "02-INT-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-04",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: enable required categories",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-07",
        "01-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-05",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: select warehouses",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-17"
      ],
      "defaultApplicable": "YES",
      "comment": "Set inactive when the integration has no warehouse selection.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-06",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure pricing rules",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-12",
        "01-13",
        "01-19"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-07",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: verify MAP / MSRP rules",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-06"
      ],
      "defaultApplicable": "YES",
      "comment": "Set inactive when MAP / MSRP is not applicable.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-08",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure stock rules",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-14",
        "01-17",
        "01-18"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-09",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure product visibility rules",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-08",
        "01-15",
        "01-16"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-10",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure image import",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-11",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure description import",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-12",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure fitment import",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-10"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when fitment import is required for this integration.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-13",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure supplier shipping rates",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-21"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when supplier shipping rates are applicable.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-14",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure order export / fulfillment",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-01",
        "01-24"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when order export or fulfillment is applicable.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-15",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: configure cron and import schedule",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-03",
        "04-INT-04",
        "04-INT-05",
        "04-INT-06",
        "04-INT-07",
        "04-INT-08",
        "04-INT-09",
        "04-INT-10",
        "04-INT-11",
        "04-INT-12",
        "04-INT-13",
        "04-INT-14"
      ],
      "defaultApplicable": "YES",
      "comment": "Inactive optional dependencies count as not required.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-16",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: complete the latest import successfully",
      "parent": "04-INT-01",
      "dependencies": [
        "03-03",
        "03-04",
        "03-05",
        "03-06",
        "03-07",
        "03-08",
        "03-09",
        "03-10",
        "03-11",
        "03-12",
        "03-13",
        "03-14",
        "04-INT-15"
      ],
      "defaultApplicable": "YES",
      "comment": "A completed import may still contain item-level errors that require review.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-17",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: review import errors",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-16"
      ],
      "defaultApplicable": "YES",
      "comment": "DONE means errors were reviewed; resolution is handled later where required.",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-19",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: verify repeated import does not create duplicates",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-17"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "04-INT-20",
      "section": "4. AUTOMOTIVE INTEGRATION CONFIGURATION",
      "en": "{Integration}: verify repeated import does not restore excluded products",
      "parent": "04-INT-01",
      "dependencies": [
        "04-INT-17",
        "01-08",
        "01-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "integrations"
    },
    {
      "id": "05-01",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for product title",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-02",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for description",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-03",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for images",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-04",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for categories",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-05",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for fitment",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-06",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for price",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-07",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Define priority source for stock",
      "parent": "",
      "dependencies": [
        "01-02",
        "01-03",
        "01-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-08",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Verify one import does not overwrite correct data from another",
      "parent": "",
      "dependencies": [
        "05-01",
        "05-02",
        "05-03",
        "05-04",
        "05-05",
        "05-06",
        "05-07"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-09",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Verify related import schedules do not conflict",
      "parent": "",
      "dependencies": [
        "04-INT-15"
      ],
      "defaultApplicable": "YES",
      "comment": "After instantiation, replace 04-INT-15 with the schedule task for every applicable integration.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-10",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Configure sufficient intervals between related imports",
      "parent": "",
      "dependencies": [
        "05-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-11",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Verify a product available from multiple suppliers is handled correctly",
      "parent": "",
      "dependencies": [
        "05-06",
        "05-07",
        "05-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-12",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Verify the same SKU from multiple sources is handled correctly",
      "parent": "",
      "dependencies": [
        "05-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "05-13",
      "section": "5. MULTIPLE-SOURCE CONFLICT RULES",
      "en": "Verify the same MPN from multiple sources is handled correctly",
      "parent": "",
      "dependencies": [
        "05-08"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined SKU / MPN item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-01",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify all approved brands are imported",
      "parent": "",
      "dependencies": [
        "04-INT-17"
      ],
      "defaultApplicable": "YES",
      "comment": "After instantiation, depend on the reviewed import for every applicable integration.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-02",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify all approved categories are imported",
      "parent": "",
      "dependencies": [
        "04-INT-17",
        "03-03",
        "03-04",
        "03-05",
        "03-06",
        "03-07",
        "03-08",
        "03-09",
        "03-10",
        "03-11",
        "03-12",
        "03-13",
        "03-14"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-03",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Compare imported product count with expected count",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-04",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Resolve unexplained product count differences",
      "parent": "",
      "dependencies": [
        "06-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-05",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Check missing brands separately",
      "parent": "",
      "dependencies": [
        "06-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-06",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Investigate import errors",
      "parent": "",
      "dependencies": [
        "04-INT-17"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-07",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Resolve or document every investigated import error",
      "parent": "",
      "dependencies": [
        "06-06"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-08",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify there are no mass duplicate products",
      "parent": "",
      "dependencies": [
        "06-03",
        "05-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-09",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify there are no mass products without price",
      "parent": "",
      "dependencies": [
        "06-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-10",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify there are no mass products without category",
      "parent": "",
      "dependencies": [
        "06-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-11",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify there are no mass products without brand",
      "parent": "",
      "dependencies": [
        "06-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-12",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify there are no mass products without images",
      "parent": "",
      "dependencies": [
        "06-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-13",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify there are no invalid zero or negative prices",
      "parent": "",
      "dependencies": [
        "06-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-14",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify stock statuses match provider data",
      "parent": "",
      "dependencies": [
        "06-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-15",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify disabled and out-of-stock logic works",
      "parent": "",
      "dependencies": [
        "06-14",
        "01-15",
        "01-16"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-16",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify only authorized brands are present in automotive integration catalogs",
      "parent": "",
      "dependencies": [
        "06-01",
        "02-INT-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-17",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify MAP pricing works",
      "parent": "",
      "dependencies": [
        "06-09",
        "04-INT-07"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when MAP pricing applies.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-18",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify options and variants are imported correctly",
      "parent": "",
      "dependencies": [
        "06-03",
        "01-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when options or variants apply.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-19",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Verify fitment is imported",
      "parent": "",
      "dependencies": [
        "06-03",
        "04-INT-12"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when fitment import applies.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "06-20",
      "section": "6. CATALOG IMPORT COMPLETED",
      "en": "Complete a repeated scheduled import successfully",
      "parent": "",
      "dependencies": [
        "06-07",
        "05-10"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-02",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include at least five products from every main supplier",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "Record the selected product IDs in the comment or linked project evidence.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-03",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include at least three products from every key brand",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "Record the selected product IDs in the comment or linked project evidence.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-04",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a product with multiple images",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-05",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a product with options or variants",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when variants exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-06",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a product with MMY fitment",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when fitment products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-07",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a product without fitment",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-08",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include an out-of-stock product",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-09",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a MAP product",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when MAP products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-10",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a discounted product",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when discounted products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-11",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include an oversized or freight product",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when oversized or freight products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-12",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a product available from multiple suppliers",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when multiple-supplier products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "07-13",
      "section": "7. CATALOG QA SAMPLING",
      "en": "Include a product in a deeply nested category",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-01",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify the vehicle database is imported",
      "parent": "",
      "dependencies": [
        "06-19"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-02",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify Make selector works",
      "parent": "",
      "dependencies": [
        "08-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-03",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify Model selector works",
      "parent": "",
      "dependencies": [
        "08-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-04",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify Year selector works",
      "parent": "",
      "dependencies": [
        "08-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-05",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify Submodel or engine selector works",
      "parent": "",
      "dependencies": [
        "08-04"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate only when Submodel or engine is used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-06",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify a matching vehicle displays compatible products",
      "parent": "",
      "dependencies": [
        "08-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-07",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify a non-matching vehicle does not display an incompatible product",
      "parent": "",
      "dependencies": [
        "08-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-08",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify fitment is displayed on applicable product pages",
      "parent": "",
      "dependencies": [
        "08-06"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-09",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify the selected vehicle persists between pages",
      "parent": "",
      "dependencies": [
        "08-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-10",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify Clear vehicle works",
      "parent": "",
      "dependencies": [
        "08-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-11",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify Change vehicle works",
      "parent": "",
      "dependencies": [
        "08-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-12",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify MMY works on desktop",
      "parent": "",
      "dependencies": [
        "08-02",
        "08-03",
        "08-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-13",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify MMY works on mobile",
      "parent": "",
      "dependencies": [
        "08-02",
        "08-03",
        "08-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-14",
      "section": "8. MMY / FITMENT QA",
      "en": "Check at least five different vehicles",
      "parent": "",
      "dependencies": [
        "08-06",
        "08-07"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-15",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify universal products are handled correctly",
      "parent": "",
      "dependencies": [
        "08-06"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "08-16",
      "section": "8. MMY / FITMENT QA",
      "en": "Verify products with multiple fitments are handled correctly",
      "parent": "",
      "dependencies": [
        "08-06"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-01",
      "section": "9. STORE CONFIGURATION",
      "en": "Complete the store profile",
      "parent": "",
      "dependencies": [
        "01-01",
        "01-02",
        "01-03",
        "01-04",
        "01-05",
        "01-06",
        "01-07",
        "01-08",
        "01-09",
        "01-10",
        "01-11",
        "01-12",
        "01-13",
        "01-14",
        "01-15",
        "01-16",
        "01-17",
        "01-18",
        "01-19",
        "01-20",
        "01-21",
        "01-22",
        "01-23",
        "01-24",
        "01-25"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-02",
      "section": "9. STORE CONFIGURATION",
      "en": "Verify company name, address, and phone",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-03",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure localization",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-04",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure currency",
      "parent": "",
      "dependencies": [
        "09-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-05",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure weight and dimension units",
      "parent": "",
      "dependencies": [
        "09-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-06",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure zones",
      "parent": "",
      "dependencies": [
        "09-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-07",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure taxes",
      "parent": "",
      "dependencies": [
        "09-06",
        "01-22"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-08",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure email notifications",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-09",
      "section": "9. STORE CONFIGURATION",
      "en": "Verify customer email delivery",
      "parent": "",
      "dependencies": [
        "09-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-10",
      "section": "9. STORE CONFIGURATION",
      "en": "Verify administrator order notification delivery",
      "parent": "",
      "dependencies": [
        "09-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-11",
      "section": "9. STORE CONFIGURATION",
      "en": "Configure the correct store email address",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-12",
      "section": "9. STORE CONFIGURATION",
      "en": "Publish legal pages",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-13",
      "section": "9. STORE CONFIGURATION",
      "en": "Publish shipping policy",
      "parent": "",
      "dependencies": [
        "09-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-14",
      "section": "9. STORE CONFIGURATION",
      "en": "Publish return policy",
      "parent": "",
      "dependencies": [
        "09-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-15",
      "section": "9. STORE CONFIGURATION",
      "en": "Publish privacy policy",
      "parent": "",
      "dependencies": [
        "09-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "09-16",
      "section": "9. STORE CONFIGURATION",
      "en": "Publish terms",
      "parent": "",
      "dependencies": [
        "09-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "10-PAY-01",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: connect in production mode",
      "parent": "",
      "dependencies": [
        "02-PAY-02"
      ],
      "defaultApplicable": "YES",
      "comment": "Template root. Clone the complete block once per confirmed payment gateway; replace PAY with a unique code. For each gateway, determine which status transitions and functions are supported; set unsupported checks to INACTIVE.",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-02",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: test a successful payment",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-03",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: test a failed payment",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-04",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: verify the order is created in X-Cart",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-05",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: verify the transaction is saved correctly",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-06",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: verify order status changes correctly",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02",
        "10-PAY-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-07",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: test capture",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02"
      ],
      "defaultApplicable": "YES",
      "comment": "Set inactive for this payment gateway when capture is not supported or not used.",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-08",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: test void",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02"
      ],
      "defaultApplicable": "NO",
      "comment": "Set inactive for this payment gateway when void is not supported or not used.",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-09",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: test refund",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02"
      ],
      "defaultApplicable": "YES",
      "comment": "Set inactive for this payment gateway when refund is not supported or not used.",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-10",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: verify customer payment or order email is received",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-11",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: verify administrator notification is received",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-04"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-PAY-12",
      "section": "10. PAYMENTS",
      "en": "{Payment gateway}: disable test mode before launch",
      "parent": "10-PAY-01",
      "dependencies": [
        "10-PAY-02",
        "10-PAY-03",
        "10-PAY-07",
        "10-PAY-08",
        "10-PAY-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "payment_gateways"
    },
    {
      "id": "10-90",
      "section": "10. PAYMENTS",
      "en": "Disable unused test payment methods",
      "parent": "",
      "dependencies": [
        "10-PAY-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "10-91",
      "section": "10. PAYMENTS",
      "en": "Disable unused offline payment methods",
      "parent": "",
      "dependencies": [
        "10-PAY-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "10-92",
      "section": "10. PAYMENTS",
      "en": "Verify Turn14 receives a test order",
      "parent": "",
      "dependencies": [
        "10-PAY-04",
        "04-INT-14"
      ],
      "defaultApplicable": "NO",
      "comment": "System-controlled: active when T14|Turn14 is configured in Automotive integrations.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-01",
      "section": "11. SHIPPING",
      "en": "Configure shipping origin",
      "parent": "",
      "dependencies": [
        "01-21",
        "09-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-CAR-01",
      "section": "11. SHIPPING",
      "en": "{Carrier}: connect the carrier account",
      "parent": "",
      "dependencies": [
        "02-SHIP-02",
        "11-01"
      ],
      "defaultApplicable": "YES",
      "comment": "Template root. Clone once per confirmed carrier; replace CAR with a unique code.",
      "scope": "REPEAT",
      "collection": "carriers"
    },
    {
      "id": "11-CAR-02",
      "section": "11. SHIPPING",
      "en": "{Carrier}: verify calculated rates are returned successfully",
      "parent": "11-CAR-01",
      "dependencies": [
        "11-CAR-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "REPEAT",
      "collection": "carriers"
    },
    {
      "id": "11-02",
      "section": "11. SHIPPING",
      "en": "Configure flat rates",
      "parent": "",
      "dependencies": [
        "11-01"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when flat rates are used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-03",
      "section": "11. SHIPPING",
      "en": "Verify supplier shipping rates work",
      "parent": "",
      "dependencies": [
        "04-INT-13"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when supplier rates are used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-04",
      "section": "11. SHIPPING",
      "en": "Verify free shipping rules",
      "parent": "",
      "dependencies": [
        "11-01"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when free shipping rules are used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-05",
      "section": "11. SHIPPING",
      "en": "Verify weight and dimensions are passed correctly",
      "parent": "",
      "dependencies": [
        "09-05",
        "11-CAR-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-06",
      "section": "11. SHIPPING",
      "en": "Verify residential and commercial rules",
      "parent": "",
      "dependencies": [
        "11-CAR-02"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when these rules apply.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-07",
      "section": "11. SHIPPING",
      "en": "Verify shipping for oversized products",
      "parent": "",
      "dependencies": [
        "11-05"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when oversized products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-08",
      "section": "11. SHIPPING",
      "en": "Verify shipping for freight products",
      "parent": "",
      "dependencies": [
        "11-05"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when freight products exist.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-09",
      "section": "11. SHIPPING",
      "en": "Verify shipping for multiple products from one supplier",
      "parent": "",
      "dependencies": [
        "11-CAR-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-10",
      "section": "11. SHIPPING",
      "en": "Verify shipping for a mixed cart from different suppliers",
      "parent": "",
      "dependencies": [
        "11-CAR-02"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when multiple suppliers are used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-11",
      "section": "11. SHIPPING",
      "en": "Verify shipping method names are customer-friendly",
      "parent": "",
      "dependencies": [
        "11-CAR-02",
        "11-02",
        "11-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "11-12",
      "section": "11. SHIPPING",
      "en": "Disable test and unavailable shipping methods",
      "parent": "",
      "dependencies": [
        "11-11"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-01",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Install logo",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-02",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Install favicon",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-03",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Apply corporate colors",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-04",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Install banner or record approval for no banner",
      "parent": "",
      "dependencies": [
        "09-01"
      ],
      "defaultApplicable": "YES",
      "comment": "Alternative outcomes; one task because both satisfy the same acceptance criterion.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-05",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Add company information",
      "parent": "",
      "dependencies": [
        "09-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-06",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check website load speed",
      "parent": "",
      "dependencies": [
        "12-01",
        "12-02",
        "12-03",
        "12-04",
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-07",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify homepage has a clear informative H1",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-08",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify key landing pages have H1 tags",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined H1 / duplicate H2 item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-09",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Remove duplicate H2 tags from key landing pages",
      "parent": "",
      "dependencies": [
        "12-08"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined H1 / duplicate H2 item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-10",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Set descriptive meta titles and descriptions for key pages",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-11",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Configure clean canonical URLs",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-12",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Optimize robots.txt",
      "parent": "",
      "dependencies": [
        "12-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined robots.txt and sitemap.xml item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-13",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Optimize sitemap.xml",
      "parent": "",
      "dependencies": [
        "12-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Split from the original combined robots.txt and sitemap.xml item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-14",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify image alt text is used effectively",
      "parent": "",
      "dependencies": [
        "12-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-15",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify promotional text is confined to logical locations",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-16",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Install and configure Rich Snippets",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when applicable.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-17",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Configure category pages to display 20–24 products",
      "parent": "",
      "dependencies": [
        "03-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-18",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify category images are appropriately sized",
      "parent": "",
      "dependencies": [
        "03-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-19",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check homepage",
      "parent": "",
      "dependencies": [
        "12-01",
        "12-03",
        "12-04",
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-20",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check header",
      "parent": "",
      "dependencies": [
        "12-01",
        "12-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-21",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check footer",
      "parent": "",
      "dependencies": [
        "12-03",
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-22",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check main menu",
      "parent": "",
      "dependencies": [
        "03-09",
        "12-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-23",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check category pages",
      "parent": "",
      "dependencies": [
        "03-09",
        "12-17",
        "12-18"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-24",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check product pages",
      "parent": "",
      "dependencies": [
        "07-02",
        "07-03",
        "07-04",
        "07-05",
        "07-06",
        "07-07",
        "07-08",
        "07-09",
        "07-10",
        "07-11",
        "07-12",
        "07-13",
        "07-PRODUCT-13"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-25",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify search works",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-26",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify filters work",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-27",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify brand pages work",
      "parent": "",
      "dependencies": [
        "06-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-28",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify cart works",
      "parent": "",
      "dependencies": [
        "07-PRODUCT-13"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-29",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Verify checkout works",
      "parent": "",
      "dependencies": [
        "10-PAY-04",
        "11-CAR-02",
        "09-07"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-30",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check mobile layout",
      "parent": "",
      "dependencies": [
        "12-19",
        "12-20",
        "12-21",
        "12-22",
        "12-23",
        "12-24",
        "12-28",
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-31",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Remove demo content",
      "parent": "",
      "dependencies": [
        "12-19",
        "12-23",
        "12-24"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when demo content exists.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-32",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Resolve broken images",
      "parent": "",
      "dependencies": [
        "12-19",
        "12-23",
        "12-24"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive completion criterion replacing 'No broken images'.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-33",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Resolve broken links",
      "parent": "",
      "dependencies": [
        "12-19",
        "12-20",
        "12-21",
        "12-22",
        "12-23",
        "12-24"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive completion criterion replacing 'No broken links'.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-34",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Remove placeholder text",
      "parent": "",
      "dependencies": [
        "12-19",
        "12-23",
        "12-24"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive completion criterion.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-35",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Resolve visible technical errors",
      "parent": "",
      "dependencies": [
        "12-19",
        "12-23",
        "12-24",
        "12-28",
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive completion criterion.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "12-36",
      "section": "12. STOREFRONT, BRANDING & SEO QA",
      "en": "Check Contact Us page",
      "parent": "",
      "dependencies": [
        "12-05"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-01",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Standard order",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-02",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Guest checkout",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-03",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Registered customer checkout",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-04",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Order with an MMY-selected product",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when MMY applies. Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-05",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Order from one supplier",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-06",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Mixed cart from multiple suppliers",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when multiple suppliers are used. Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-07",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Out-of-state order",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-08",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Order with tax",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-09",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Order with coupon",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when coupons are in scope. Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-10",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Free shipping order",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when free shipping is configured. Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-11",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Oversized or freight order",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when oversized or freight products exist. Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-12",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Failed payment",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "13-13",
      "section": "13. END-TO-END ORDER QA",
      "en": "Execute E2E scenario: Refund or void",
      "parent": "",
      "dependencies": [
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": " Clone the 13-SCN verification block for this scenario.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-01",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Send the storefront review link to the customer",
      "parent": "",
      "dependencies": [
        "12-35"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-02",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive customer review of brands",
      "parent": "",
      "dependencies": [
        "14-01",
        "06-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-03",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive customer review of categories",
      "parent": "",
      "dependencies": [
        "14-01",
        "06-02"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-04",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive customer review of pricing",
      "parent": "",
      "dependencies": [
        "14-01",
        "06-13",
        "06-17"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-05",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive customer review of MMY",
      "parent": "",
      "dependencies": [
        "14-01",
        "08-16"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when MMY applies.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-06",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive customer review of shipping",
      "parent": "",
      "dependencies": [
        "14-01",
        "11-12"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-07",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive customer review of checkout",
      "parent": "",
      "dependencies": [
        "14-01",
        "12-29"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-08",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive the customer feedback list",
      "parent": "",
      "dependencies": [
        "14-02",
        "14-03",
        "14-04",
        "14-05",
        "14-06",
        "14-07"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-09",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Resolve all launch-blocking feedback",
      "parent": "",
      "dependencies": [
        "14-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-10",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Move non-blocking feedback to separate tasks",
      "parent": "",
      "dependencies": [
        "14-08"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "14-11",
      "section": "14. CUSTOMER ACCEPTANCE",
      "en": "Receive written launch approval",
      "parent": "",
      "dependencies": [
        "14-09",
        "14-10",
        "13-01",
        "13-02",
        "13-03",
        "13-04",
        "13-05",
        "13-06",
        "13-07",
        "13-08",
        "13-09",
        "13-10",
        "13-11",
        "13-12",
        "13-13",
        "13-SCN-11"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-01",
      "section": "15. LAUNCH GATE",
      "en": "Confirm approved brands are fully imported",
      "parent": "",
      "dependencies": [
        "06-01"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-02",
      "section": "15. LAUNCH GATE",
      "en": "Confirm all import errors have a resolved or documented disposition",
      "parent": "",
      "dependencies": [
        "06-07"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-03",
      "section": "15. LAUNCH GATE",
      "en": "Confirm scheduled imports have been verified",
      "parent": "",
      "dependencies": [
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-04",
      "section": "15. LAUNCH GATE",
      "en": "Confirm repeated imports do not damage catalog data",
      "parent": "",
      "dependencies": [
        "06-01",
        "06-02",
        "06-04",
        "06-05",
        "06-07",
        "06-08",
        "06-09",
        "06-10",
        "06-11",
        "06-12",
        "06-13",
        "06-14",
        "06-15",
        "06-16",
        "06-17",
        "06-18",
        "06-19",
        "06-20"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-05",
      "section": "15. LAUNCH GATE",
      "en": "Confirm mass pricing errors are absent or resolved",
      "parent": "",
      "dependencies": [
        "06-09",
        "06-13",
        "06-17"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-06",
      "section": "15. LAUNCH GATE",
      "en": "Confirm mass stock errors are absent or resolved",
      "parent": "",
      "dependencies": [
        "06-14",
        "06-15"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-07",
      "section": "15. LAUNCH GATE",
      "en": "Confirm MMY works correctly",
      "parent": "",
      "dependencies": [
        "08-16"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when MMY applies.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-08",
      "section": "15. LAUNCH GATE",
      "en": "Confirm payment passed end-to-end testing",
      "parent": "",
      "dependencies": [
        "10-PAY-12",
        "13-01",
        "13-02",
        "13-03",
        "13-04",
        "13-05",
        "13-06",
        "13-07",
        "13-08",
        "13-09",
        "13-10",
        "13-11",
        "13-12",
        "13-13",
        "13-SCN-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-09",
      "section": "15. LAUNCH GATE",
      "en": "Confirm shipping passed end-to-end testing",
      "parent": "",
      "dependencies": [
        "11-12",
        "13-01",
        "13-02",
        "13-03",
        "13-04",
        "13-05",
        "13-06",
        "13-07",
        "13-08",
        "13-09",
        "13-10",
        "13-11",
        "13-12",
        "13-13",
        "13-SCN-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-10",
      "section": "15. LAUNCH GATE",
      "en": "Confirm taxes are configured or customer responsibility is documented",
      "parent": "",
      "dependencies": [
        "09-07",
        "14-04"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-11",
      "section": "15. LAUNCH GATE",
      "en": "Confirm a mixed cart from multiple suppliers was tested",
      "parent": "",
      "dependencies": [
        "11-10",
        "13-06"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when multiple suppliers are used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-12",
      "section": "15. LAUNCH GATE",
      "en": "Confirm email notifications work",
      "parent": "",
      "dependencies": [
        "09-09",
        "09-10",
        "13-01",
        "13-02",
        "13-03",
        "13-04",
        "13-05",
        "13-06",
        "13-07",
        "13-08",
        "13-09",
        "13-10",
        "13-11",
        "13-12",
        "13-13",
        "13-SCN-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-13",
      "section": "15. LAUNCH GATE",
      "en": "Confirm critical storefront errors are resolved",
      "parent": "",
      "dependencies": [
        "12-35"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-14",
      "section": "15. LAUNCH GATE",
      "en": "Confirm customer launch approval is received",
      "parent": "",
      "dependencies": [
        "14-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-15",
      "section": "15. LAUNCH GATE",
      "en": "Document the backup and rollback plan",
      "parent": "",
      "dependencies": [
        "14-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "15-16",
      "section": "15. LAUNCH GATE",
      "en": "Agree the DNS and domain switch time",
      "parent": "",
      "dependencies": [
        "14-11"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive launch criterion replacing the original negative blocker condition.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-01",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Complete the first production import successfully",
      "parent": "",
      "dependencies": [
        "15-01",
        "15-02",
        "15-03",
        "15-04",
        "15-05",
        "15-06",
        "15-07",
        "15-08",
        "15-09",
        "15-10",
        "15-11",
        "15-12",
        "15-13",
        "15-14",
        "15-15",
        "15-16"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-02",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify scheduled imports at least twice",
      "parent": "",
      "dependencies": [
        "16-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-03",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Review the first real orders",
      "parent": "",
      "dependencies": [
        "15-01",
        "15-02",
        "15-03",
        "15-04",
        "15-05",
        "15-06",
        "15-07",
        "15-08",
        "15-09",
        "15-10",
        "15-11",
        "15-12",
        "15-13",
        "15-14",
        "15-15",
        "15-16"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-04",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Review payment errors",
      "parent": "",
      "dependencies": [
        "16-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-05",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Review shipping errors",
      "parent": "",
      "dependencies": [
        "16-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-06",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify email delivery",
      "parent": "",
      "dependencies": [
        "16-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-07",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify stock updates",
      "parent": "",
      "dependencies": [
        "16-01",
        "16-03"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-08",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify order export",
      "parent": "",
      "dependencies": [
        "16-03"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when order export applies.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-09",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Resolve critical onboarding tickets",
      "parent": "",
      "dependencies": [
        "16-02",
        "16-03"
      ],
      "defaultApplicable": "YES",
      "comment": "Positive completion criterion replacing 'No unresolved critical onboarding tickets'.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-10",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Resolve all launch-related issues",
      "parent": "",
      "dependencies": [
        "16-04",
        "16-05",
        "16-06",
        "16-07",
        "16-08",
        "16-09"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-11",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Receive customer confirmation that no launch blockers remain",
      "parent": "",
      "dependencies": [
        "16-10"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-12",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Transfer the store to regular Support flow",
      "parent": "",
      "dependencies": [
        "16-11"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-13",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify no unresolved critical errors remain in logs",
      "parent": "",
      "dependencies": [
        "16-10"
      ],
      "defaultApplicable": "YES",
      "comment": "Known resolved errors do not block completion.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-14",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify required workers are running",
      "parent": "",
      "dependencies": [
        "16-01"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-15",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify feeds are generated correctly",
      "parent": "",
      "dependencies": [
        "16-01"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when feeds are used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-16",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify sitemap.xml is present and generated",
      "parent": "",
      "dependencies": [
        "15-01",
        "15-02",
        "15-03",
        "15-04",
        "15-05",
        "15-06",
        "15-07",
        "15-08",
        "15-09",
        "15-10",
        "15-11",
        "15-12",
        "15-13",
        "15-14",
        "15-15",
        "15-16"
      ],
      "defaultApplicable": "YES",
      "comment": "",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-17",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify the CloudSearch index works",
      "parent": "",
      "dependencies": [
        "15-01",
        "15-02",
        "15-03",
        "15-04",
        "15-05",
        "15-06",
        "15-07",
        "15-08",
        "15-09",
        "15-10",
        "15-11",
        "15-12",
        "15-13",
        "15-14",
        "15-15",
        "15-16"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when CloudSearch is used.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-18",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify the store is indexed in Google Search Console",
      "parent": "",
      "dependencies": [
        "16-16"
      ],
      "defaultApplicable": "NO",
      "comment": "Post-launch observation. Actual indexing in Google does not block onboarding closure; sitemap submission and the indexing request are the blocking prerequisites.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-19",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify GA4 is connected",
      "parent": "",
      "dependencies": [
        "15-01",
        "15-02",
        "15-03",
        "15-04",
        "15-05",
        "15-06",
        "15-07",
        "15-08",
        "15-09",
        "15-10",
        "15-11",
        "15-12",
        "15-13",
        "15-14",
        "15-15",
        "15-16"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when GA4 is used. Split from the original combined GA4 / GTM item.",
      "scope": "STATIC",
      "collection": ""
    },
    {
      "id": "16-20",
      "section": "16. POST-LAUNCH STABILIZATION",
      "en": "Verify GA4 has no conflict with GTM",
      "parent": "",
      "dependencies": [
        "16-19"
      ],
      "defaultApplicable": "NO",
      "comment": "Activate when both GA4 and GTM are used. Split from the original combined item.",
      "scope": "STATIC",
      "collection": ""
    }
  ]
});
