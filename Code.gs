const RUNTIME = Object.freeze({
  poolSheet: 'TASK POOL',
  checklistSheet: 'CHECKLIST',
  configurationSheet: 'CONFIGURATION',
  instructionSheet: 'INSTRUCTIONS',
  checklistHeaderRow: 6,
  checklistFirstRow: 7,
  yes: 'YES',
  no: 'NO',
  statuses: Object.freeze(['READY', 'WAITING', 'INACTIVE', 'DONE'])
});

let RUNTIME_SPREADSHEET_CONTEXT_ = null;

function withRuntimeSpreadsheet_(spreadsheet, callback) {
  const previous = RUNTIME_SPREADSHEET_CONTEXT_;
  RUNTIME_SPREADSHEET_CONTEXT_ = spreadsheet;
  try {
    return callback();
  } finally {
    RUNTIME_SPREADSHEET_CONTEXT_ = previous;
  }
}

function runtimeSpreadsheet_() {
  const spreadsheet = RUNTIME_SPREADSHEET_CONTEXT_ || SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('No runtime spreadsheet context is available.');
  return spreadsheet;
}

function runtimeLock_() {
  return LockService.getScriptLock();
}

function runtimeToast_(message, title, seconds) {
  try {
    runtimeSpreadsheet_().toast(message, title || 'CHECKLIST', seconds || 4);
  } catch (ignored) {
    console.warn(String(message));
  }
}

const AUTOMOTIVE_INTEGRATION_CATALOG = Object.freeze([
  Object.freeze({code: 'T14', name: 'Turn14 Distribution'}),
  Object.freeze({code: 'MEYER', name: 'Meyer Distributing'}),
  Object.freeze({code: 'KEYSTONE', name: 'Keystone Automotive Operations'}),
  Object.freeze({code: 'ATD', name: 'American Tire Distributors (ATD)'}),
  Object.freeze({code: 'WHEEL_PROS', name: 'Wheel Pros'}),
  Object.freeze({code: 'APG', name: 'APG Wholesale – ex. Premier Performance'}),
  Object.freeze({code: 'DIX', name: 'Dix Performance North'}),
  Object.freeze({code: 'MOTOR_STATE', name: 'Motor State Distributing'})
]);

const PAYMENT_GATEWAY_CATALOG = Object.freeze([
  Object.freeze({code: 'ACIMA', name: 'Acima'}),
  Object.freeze({code: 'PAYTOMORROW', name: 'Paytomorrow'}),
  Object.freeze({code: 'AFFIRM', name: 'Affirm'}),
  Object.freeze({code: 'XPAYMENTS', name: 'X-Payments'}),
  Object.freeze({code: 'SQUARE', name: 'Square'}),
  Object.freeze({code: 'BRAINTREE', name: 'Braintree'}),
  Object.freeze({code: 'AMAZON', name: 'Amazon'}),
  Object.freeze({code: 'STRIPE', name: 'Stripe'}),
  Object.freeze({code: 'PAYPAL', name: 'PayPal'})
]);

const CARRIER_CATALOG = Object.freeze([
  Object.freeze({code: 'DHL', name: 'DHL'}),
  Object.freeze({code: 'CANADA_POST', name: 'CanadaPost'}),
  Object.freeze({code: 'UPS', name: 'UPS'}),
  Object.freeze({code: 'FEDEX', name: 'FedEx'}),
  Object.freeze({code: 'USPS', name: 'USPS'}),
  Object.freeze({code: 'AUSTRALIA_POST', name: 'Australia Post'})
]);

const TAX_SERVICE_CATALOG = Object.freeze([
  Object.freeze({code: 'TAXJAR', name: 'TaxJar'}),
  Object.freeze({code: 'AVATAX', name: 'AvaTax'})
]);

const SOURCE_TYPE_CATALOG = Object.freeze(['manual', 'csv', 'supplier_feed']);

const SOURCE_TASK_RULES = Object.freeze({
  import: Object.freeze([
    '01-08', '01-09', '01-18', '01-19', '03-13',
    '06-01', '06-02', '06-03', '06-04', '06-05', '06-06', '06-07',
    '06-08', '06-09', '06-10', '06-11', '06-12', '06-13', '06-14',
    '06-15', '06-17', '06-18', '06-19', '15-01', '15-02', '15-04', '16-01'
  ]),
  supplierFeed: Object.freeze(['06-20', '15-03', '16-02']),
  automotiveIntegration: Object.freeze(['01-06', '01-17', '06-16'])
});

const CONFIGURATION_TASK_RULES = Object.freeze({
  fitmentRequired: Object.freeze(['04-INT-12', '06-19', '07-06', '13-04', '14-05', '15-07']),
  fitmentOptional: Object.freeze(['05-05', '07-PRODUCT-11']),
  flatRate: Object.freeze(['11-02']),
  supplierRate: Object.freeze(['04-INT-13', '11-03']),
  freeShipping: Object.freeze(['11-04', '13-10'])
});

const CONFIGURATION_UI = Object.freeze({
  version: 'AUTOMOTIVE_CONFIG_FORMULA_V2',
  integrationHeaderRow: 4,
  integrationFirstRow: 5,
  integrationLastRow: 12,
  paymentHeaderRow: 14,
  paymentFirstRow: 15,
  paymentLastRow: 23,
  carrierHeaderRow: 25,
  carrierFirstRow: 26,
  carrierLastRow: 31,
  taxHeaderRow: 33,
  taxFirstRow: 34,
  taxLastRow: 35,
  otherFirstRow: 37,
  otherLastRow: 45
});

const CHECKLIST_UI_VERSION = 'AUTOMOTIVE_FORMULA_V6';

const CHECKLIST_STYLE = Object.freeze({
  title: '#214F87',
  header: '#3875BC',
  section: '#D8E8F7',
  metadata: '#F4F7F9',
  border: '#BFBFBF',
  font: 'Arial'
});

function onOpen() {
  try {
    cleanupLegacyChecklistHeader_();
  } catch (error) {
    console.warn('Legacy checklist header was not cleared: ' + formatRuntimeError_(error));
  }
  try {
    upgradeFormulaChecklistIfNeeded_();
  } catch (error) {
    console.warn('Formula checklist was not upgraded: ' + formatRuntimeError_(error));
  }
  SpreadsheetApp.getUi().createMenu('CHECKLIST')
    .addItem('Open checklist', 'openChecklist')
    .addItem('Open configuration', 'openChecklistConfiguration')
    .addItem('Rebuild from configuration', 'saveChecklistConfiguration')
    .addItem('Restore canonical checklist', 'restoreCanonicalChecklist')
    .addItem('Install formula checklist', 'migrateMasterToFormulaChecklist')
    .addSeparator()
    .addItem('Create onboarding project', 'promptCreateOnboardingProject')
    .addToUi();
}

function upgradeFormulaChecklistIfNeeded_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) return;
  const sheet = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  if (!sheet || sheet.getRange('A6').getDisplayValue() !== 'Task') return;
  if (sheet.getRange('A1').getNote() === CHECKLIST_UI_VERSION) return;
  return withRuntimeSpreadsheet_(spreadsheet, function () {
    return rebuildChecklistFromConfiguration_(true);
  });
}

function cleanupLegacyChecklistHeader_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) return;
  const sheet = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  if (!sheet) return;
  sheet.getRange('A2:G2').breakApart().clearContent().clearDataValidations().clearFormat();
}

function openChecklist() {
  const sheet = ensureChecklistSheet_();
  runtimeSpreadsheet_().setActiveSheet(sheet);
}

function openChecklistConfiguration() {
  const sheet = ensureConfigurationSheet_();
  runtimeSpreadsheet_().setActiveSheet(sheet);
}

function installChecklistWorkspace() {
  rebuildChecklistFromConfiguration_(true);
  renderEnglishInstructions_(runtimeSpreadsheet_());
  runtimeSpreadsheet_().setActiveSheet(ensureChecklistSheet_());
  runtimeToast_('Workspace is ready.');
}

function refreshInstructionSheet() {
  return renderEnglishInstructions_(runtimeSpreadsheet_());
}

function saveChecklistConfiguration() {
  rebuildChecklistFromConfiguration_(true);
  runtimeSpreadsheet_().setActiveSheet(ensureChecklistSheet_());
  runtimeToast_('Configuration saved and checklist rebuilt.');
}

function restoreCanonicalChecklist() {
  rebuildChecklistFromConfiguration_(true);
  runtimeSpreadsheet_().setActiveSheet(ensureChecklistSheet_());
  runtimeToast_('Canonical checklist restored.');
}

function migrateMasterToFormulaChecklist() {
  return migrateSpreadsheetToFormulaChecklist_(runtimeSpreadsheet_());
}

function migrateMasterById() {
  return migrateSpreadsheetToFormulaChecklist_(SpreadsheetApp.openById('1J_ZOrvOkijBczUgvsULNNQ9OJHoOhukmuDdgI3Varow'));
}

function migrateSpreadsheetToFormulaChecklist_(spreadsheet) {
  return withRuntimeSpreadsheet_(spreadsheet, function () {
  const checklist = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  if (checklist) {
    const timestamp = Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), 'yyyy-MM-dd HHmmss');
    const backup = checklist.copyTo(spreadsheet).setName('CHECKLIST RECOVERY ' + timestamp);
    backup.hideSheet();
  }
  rebuildChecklistFromConfiguration_(true);
  renderEnglishInstructions_(spreadsheet);
  spreadsheet.setActiveSheet(ensureChecklistSheet_());
  runtimeToast_('Formula checklist installed. A hidden recovery copy was preserved.');
  return {ok: true, spreadsheetId: spreadsheet.getId(), taskCount: Object.keys(readChecklistState_(ensureChecklistSheet_())).length};
  });
}

function authorizeCentralProjectRuntime() {
  const spreadsheet = runtimeSpreadsheet_();
  const trigger = installCentralProjectTrigger_(spreadsheet);
  return {ok: true, triggerId: trigger.getUniqueId()};
}

function onEdit(e) {
  if (!e || !e.range) return;
  return withRuntimeSpreadsheet_(e.source || e.range.getSheet().getParent(), function () {
    const sheet = e.range.getSheet();
    if (sheet.getName() === RUNTIME.configurationSheet && isConfigurationInput_(e.range)) {
      rebuildChecklistFromConfiguration_(true);
      runtimeToast_('Configuration saved and checklist rebuilt.');
      return;
    }
    if (sheet.getName() !== RUNTIME.checklistSheet || e.range.getRow() < RUNTIME.checklistFirstRow) return;
    if (checklistEditTouchesProtectedData_(e.range)) {
      rebuildChecklistFromConfiguration_(true);
      runtimeToast_('Protected checklist data was restored from the canonical model.');
      return;
    }
    if (checklistEditIsCommentOnly_(e.range)) return;
    if (checklistEditTouchesApplicable_(e.range) && !checklistApplicableValuesAreValid_(e.range)) {
      rebuildChecklistFromConfiguration_(true);
      runtimeToast_('Applicable must be YES or NO. The checklist was restored.');
      return;
    }
    SpreadsheetApp.flush();
    const reverted = reconcileInvalidDoneValues_(sheet);
    SpreadsheetApp.flush();
    refreshChecklistProtection_(sheet);
    if (reverted) runtimeToast_('Done is available only for READY tasks. The change was reverted.');
  });
}

function checklistEditTouchesProtectedData_(range) {
  const firstColumn = range.getColumn();
  const lastColumn = firstColumn + range.getNumColumns() - 1;
  return firstColumn <= 1 || lastColumn >= 5;
}

function checklistEditIsCommentOnly_(range) {
  return range.getColumn() === 3 && range.getNumColumns() === 1;
}

function checklistEditTouchesApplicable_(range) {
  const firstColumn = range.getColumn();
  const lastColumn = firstColumn + range.getNumColumns() - 1;
  return firstColumn <= 4 && lastColumn >= 4;
}

function checklistApplicableValuesAreValid_(range) {
  const firstColumn = range.getColumn();
  const applicableOffset = 4 - firstColumn;
  if (applicableOffset < 0 || applicableOffset >= range.getNumColumns()) return true;
  return range.getDisplayValues().every(function (row) {
    const value = String(row[applicableOffset] || '').trim().toUpperCase();
    return value === RUNTIME.yes || value === RUNTIME.no;
  });
}

function centralProjectOnEdit(e) {
  return onEdit(e);
}

function isConfigurationInput_(range) {
  if (range.getColumn() !== 2 || range.getNumColumns() !== 1) return false;
  const row = range.getRow();
  return configurationCatalogSections_().some(function (section) {
    return row >= section.firstRow && row < section.firstRow + section.catalog.length;
  }) || (row >= 37 && row <= 45);
}

function rebuildChecklistFromConfiguration_(preserveState) {
  const lock = runtimeLock_();
  lock.waitLock(30000);
  try {
    const spreadsheet = runtimeSpreadsheet_();
    const checklist = ensureChecklistSheet_();
    const previous = preserveState ? readChecklistState_(checklist) : {};
    const config = readConfigurationSheet_();
    const tasks = mergeTaskStateForRebuild_(instantiateModel_(config), previous);
    validateTaskGraph_(tasks);
    writeCanonicalPool_(spreadsheet, tasks);
    writeFormulaChecklist_(checklist, tasks);
    protectPoolSheet_(spreadsheet);
    protectConfigurationSheet_(ensureConfigurationSheet_());
    refreshChecklistProtection_(checklist);
    removeLegacyRuntimeSheets_(spreadsheet);
    checklist.getRange('A1').setNote(CHECKLIST_UI_VERSION);
    return {ok: true, taskCount: tasks.length};
  } finally {
    lock.releaseLock();
  }
}

function removeLegacyRuntimeSheets_(spreadsheet) {
  ['_RUNTIME_DATA', '_TRANSLATIONS'].forEach(function (name) {
    const sheet = spreadsheet.getSheetByName(name);
    if (sheet && spreadsheet.getSheets().length > 1) spreadsheet.deleteSheet(sheet);
  });
}

function readChecklistState_(sheet) {
  if (!sheet || sheet.getLastRow() < RUNTIME.checklistFirstRow) return {};
  const rows = sheet.getRange(
    RUNTIME.checklistFirstRow,
    1,
    sheet.getLastRow() - RUNTIME.checklistFirstRow + 1,
    Math.max(10, sheet.getLastColumn())
  ).getValues();
  const state = {};
  rows.forEach(function (row) {
    const newId = String(row[5] || '').trim();
    const oldId = String(row[0] || '').trim();
    const isNew = /^\d{2}-/.test(newId);
    const id = isNew ? newId : oldId;
    if (!id || !/^\d{2}-/.test(id)) return;
    // New layout: B Done, C Comment, D Applicable, F Task ID.
    // Old layout fallback: A Task ID, D Applicable, E Done, F Comment.
    state[id] = isNew
      ? {done: row[1] === true, comment: String(row[2] || ''), localApplicable: normalizeApplicability_(row[3])}
      : {done: row[4] === true, comment: String(row[5] || ''), localApplicable: normalizeApplicability_(row[3])};
  });
  return state;
}

function ensureChecklistSheet_() {
  const spreadsheet = runtimeSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  if (!sheet) sheet = spreadsheet.insertSheet(RUNTIME.checklistSheet);
  if (sheet.getMaxColumns() < 11) sheet.insertColumnsAfter(sheet.getMaxColumns(), 11 - sheet.getMaxColumns());
  if (sheet.getMaxRows() < 1000) sheet.insertRowsAfter(sheet.getMaxRows(), 1000 - sheet.getMaxRows());

  sheet.getRange('A1:J1').breakApart();
  sheet.getRange('A1:G1').merge().setValue('INTERNAL AUTOMOTIVE ONBOARDING CHECKLIST')
    .setBackground(CHECKLIST_STYLE.title).setFontColor('#ffffff').setFontFamily(CHECKLIST_STYLE.font)
    .setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(1, 36);
  renderProjectInformation_(sheet);
  sheet.getRange('A6:K6').setValues([[
    'Task', 'Done', 'Comment', 'Applicable', 'Status', 'Task ID', 'Waiting for',
    'Parent ID', 'Dependencies', 'Effective applicability', 'Ancestor IDs'
  ]]).setBackground(CHECKLIST_STYLE.header).setFontColor('#ffffff').setFontFamily(CHECKLIST_STYLE.font)
    .setFontSize(12).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(6, 30);
  sheet.setFrozenRows(RUNTIME.checklistHeaderRow);
  sheet.setHiddenGridlines(true);
  sheet.setColumnWidth(1, 440);
  sheet.setColumnWidth(2, 70);
  sheet.setColumnWidth(3, 360);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 95);
  sheet.setColumnWidth(7, 240);
  sheet.showColumns(1, 7);
  sheet.hideColumns(8, 4);
  sheet.setTabColor(CHECKLIST_STYLE.header);

  const filter = sheet.getFilter();
  if (!filter) sheet.getRange(RUNTIME.checklistHeaderRow, 1, sheet.getMaxRows() - RUNTIME.checklistHeaderRow + 1, 7).createFilter();
  ensureChecklistFormatting_(sheet);
  return sheet;
}

function readProjectInformation_(sheet) {
  return {
    clientStore: sheet.getRange('B3').getValue(),
    responsibleEngineer: sheet.getRange('E3').getValue(),
    launchDate: sheet.getRange('G3').getValue(),
    onboardingTicket: sheet.getRange('B4').getValue(),
    currentStatus: sheet.getRange('E4').getValue(),
    jiraTicket: sheet.getRange('B5').getValue()
  };
}

function renderProjectInformation_(sheet) {
  const values = readProjectInformation_(sheet);
  sheet.getRange('A2:G5').breakApart().clearDataValidations().clearFormat();
  sheet.getRange('A2:G2').clearContent();
  sheet.getRange('A3:G5').clearContent();
  ['B3:C3', 'B4:C4', 'E4:G4', 'B5:G5'].forEach(function (a1) { sheet.getRange(a1).merge(); });
  sheet.getRange('A3:G5').setBackground(CHECKLIST_STYLE.metadata).setFontFamily(CHECKLIST_STYLE.font)
    .setFontSize(10).setWrap(true).setVerticalAlignment('middle');
  sheet.getRangeList(['A3', 'D3', 'F3', 'A4', 'D4', 'A5']).setFontWeight('bold');
  sheet.getRange('A3').setValue('Client / Store');
  sheet.getRange('D3').setValue('Responsible engineer:');
  sheet.getRange('F3').setValue('Launch date');
  sheet.getRange('A4').setValue('Onboarding ticket');
  sheet.getRange('D4').setValue('Current status:');
  sheet.getRange('A5').setValue('Jira ticket');
  sheet.getRange('B3').setValue(values.clientStore);
  sheet.getRange('E3').setValue(values.responsibleEngineer);
  sheet.getRange('G3').setValue(values.launchDate).setNumberFormat('yyyy-mm-dd');
  sheet.getRange('B4').setValue(values.onboardingTicket);
  sheet.getRange('E4').setValue(values.currentStatus);
  sheet.getRange('B5').setValue(values.jiraTicket);
  sheet.setRowHeights(3, 3, 28);
}

function clearProjectInformationValues_(sheet) {
  sheet.getRangeList(['B3', 'E3', 'G3', 'B4', 'E4', 'B5']).clearContent();
}

function writeFormulaChecklist_(sheet, tasks) {
  const displayRows = [];
  let section = '';
  tasks.forEach(function (task) {
    if (task.section !== section) {
      section = task.section;
      displayRows.push({section: section});
    }
    displayRows.push({task: task});
  });

  const neededLastRow = RUNTIME.checklistFirstRow + displayRows.length - 1;
  if (sheet.getMaxRows() < neededLastRow) sheet.insertRowsAfter(sheet.getMaxRows(), neededLastRow - sheet.getMaxRows());
  const clearRows = sheet.getMaxRows() - RUNTIME.checklistFirstRow + 1;
  sheet.showRows(RUNTIME.checklistFirstRow, clearRows);
  sheet.getRange(RUNTIME.checklistFirstRow, 1, clearRows, 11)
    .clearDataValidations().clearContent().clearFormat();

  const lastRow = neededLastRow;
  const byId = indexById_(tasks);
  const ancestors = function (task) {
    const result = [];
    let parent = task.parent;
    while (parent && result.indexOf(parent) < 0) {
      result.push(parent);
      parent = byId[parent] ? byId[parent].parent : '';
    }
    return result.join(', ');
  };
  const values = displayRows.map(function (item, index) {
    const row = RUNTIME.checklistFirstRow + index;
    if (item.section) return [item.section, '', '', '', '', '', '', '', '', '', ''];
    const task = item.task;
    return [
      task.title,
      Boolean(task.done),
      task.commentValue || '',
      task.localApplicable,
      statusFormula_(row, lastRow),
      task.id,
      waitingFormula_(row, lastRow),
      task.parent || '',
      task.dependencies.join(', '),
      effectiveApplicableFormula_(row, lastRow),
      ancestors(task)
    ];
  });
  sheet.getRange(RUNTIME.checklistFirstRow, 1, values.length, 11).setValues(values).setVerticalAlignment('middle');
  sheet.getRange(RUNTIME.checklistFirstRow, 1, values.length, 11).setFontFamily(CHECKLIST_STYLE.font).setFontSize(10);
  sheet.getRange(RUNTIME.checklistFirstRow, 6, values.length, 6).setNumberFormat('@');

  const applicableRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([RUNTIME.yes, RUNTIME.no], true)
    .setAllowInvalid(false)
    .build();
  const taskRange = sheet.getRange(RUNTIME.checklistFirstRow, 2, values.length, 1);
  taskRange.insertCheckboxes();
  sheet.getRange(RUNTIME.checklistFirstRow, 4, values.length, 1).setDataValidation(applicableRule);

  const sectionDoneRanges = [];
  const sectionApplicableRanges = [];
  displayRows.forEach(function (item, index) {
    const row = RUNTIME.checklistFirstRow + index;
    if (item.section) {
      const sectionRange = sheet.getRange(row, 1, 1, 7);
      sectionRange.setBackground(CHECKLIST_STYLE.section).setFontColor('#000000')
        .setFontFamily(CHECKLIST_STYLE.font).setFontSize(12).setFontWeight('bold');
      sectionRange.setBorder(true, null, null, null, null, null,
        CHECKLIST_STYLE.header, SpreadsheetApp.BorderStyle.SOLID_THICK);
      sectionRange.setBorder(null, null, true, null, null, null,
        CHECKLIST_STYLE.border, SpreadsheetApp.BorderStyle.SOLID);
      sheet.setRowHeight(row, 30);
      sectionDoneRanges.push('B' + row);
      sectionApplicableRanges.push('D' + row);
    }
  });
  if (sectionDoneRanges.length) {
    sheet.getRangeList(sectionDoneRanges).clearDataValidations().clearContent();
    sheet.getRangeList(sectionApplicableRanges).clearDataValidations().clearContent();
  }
  sheet.getRange(RUNTIME.checklistFirstRow, 1, values.length, 1).setWrap(true);
  sheet.getRange(RUNTIME.checklistFirstRow, 3, values.length, 1).setWrap(true);
  sheet.getRange(RUNTIME.checklistFirstRow, 7, values.length, 1).setWrap(true);
  ensureChecklistFormatting_(sheet);
}

function formulaLookupRange_(lastRow) {
  return '$F$' + RUNTIME.checklistFirstRow + ':$F$' + lastRow;
}

function effectiveApplicableFormula_(row, lastRow) {
  const ids = formulaLookupRange_(lastRow);
  const applicable = '$D$' + RUNTIME.checklistFirstRow + ':$D$' + lastRow;
  return '=IF($F' + row + '="","",IF($D' + row + '="NO","NO",IF($K' + row + '="","YES",' +
    'IF(SUMPRODUCT(N(COUNTIF(TRIM(SPLIT($K' + row + ',",")),' + ids + ')>0),N(' +
    applicable + '="NO"))>0,"NO","YES"))))';
}

function unresolvedDependencyExpression_(row, lastRow) {
  const ids = formulaLookupRange_(lastRow);
  const done = '$B$' + RUNTIME.checklistFirstRow + ':$B$' + lastRow;
  const effective = '$J$' + RUNTIME.checklistFirstRow + ':$J$' + lastRow;
  return 'SUMPRODUCT(N(COUNTIF(TRIM(SPLIT($I' + row + ',",")),' + ids + ')>0),' +
    'N(' + effective + '="YES"),N(' + done + '<>TRUE))';
}

function statusFormula_(row, lastRow) {
  const unresolved = unresolvedDependencyExpression_(row, lastRow);
  return '=IF($F' + row + '="","",IF($J' + row + '="NO","INACTIVE",IF($B' + row + ',"DONE",' +
    'IF($I' + row + '="","READY",IF(' + unresolved + '=0,"READY","WAITING")))))';
}

function waitingFormula_(row, lastRow) {
  const ids = formulaLookupRange_(lastRow);
  const done = '$B$' + RUNTIME.checklistFirstRow + ':$B$' + lastRow;
  const effective = '$J$' + RUNTIME.checklistFirstRow + ':$J$' + lastRow;
  return '=IF($E' + row + '<>"WAITING","",IF($I' + row + '="","",LET(deps,TRIM(SPLIT($I' + row + ',",")),' +
    'IFERROR(TEXTJOIN(", ",TRUE,FILTER(' + ids + ',COUNTIF(deps,' + ids + ')>0,' +
    effective + '="YES",' + done + '<>TRUE)),""))))';
}

function readChecklistExecutionState_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), RUNTIME.checklistFirstRow);
  const values = sheet.getRange(RUNTIME.checklistFirstRow, 2, lastRow - RUNTIME.checklistFirstRow + 1, 9).getValues();
  const state = {tasks: [], byId: {}};
  values.forEach(function (row, index) {
    const id = String(row[4] || '').trim();
    if (!id) return;
    const task = {
      row: RUNTIME.checklistFirstRow + index,
      done: row[0] === true,
      id: id,
      dependencies: String(row[7] || '').split(',').map(function (value) { return value.trim(); }).filter(Boolean),
      effectiveApplicable: String(row[8] || '')
    };
    state.tasks.push(task);
    state.byId[id] = task;
  });
  return state;
}

function taskCanBeDoneFromState_(task, byId) {
  if (!task || task.effectiveApplicable !== RUNTIME.yes) return false;
  return task.dependencies.every(function (id) {
    const dependency = byId[id];
    return !dependency || dependency.effectiveApplicable !== RUNTIME.yes || dependency.done;
  });
}

function reconcileInvalidDoneValues_(sheet) {
  const state = readChecklistExecutionState_(sheet);
  const invalid = state.tasks.filter(function (task) {
    return task.done && !taskCanBeDoneFromState_(task, state.byId);
  });
  if (invalid.length) {
    sheet.getRangeList(invalid.map(function (task) { return 'B' + task.row; })).setValue(false);
  }
  return invalid.length;
}

function ensureChecklistFormatting_(sheet) {
  const range = sheet.getRange(RUNTIME.checklistFirstRow, 1, sheet.getMaxRows() - RUNTIME.checklistFirstRow + 1, 7);
  const rule = function (status, color, fontColor, strike) {
    let builder = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$E' + RUNTIME.checklistFirstRow + '="' + status + '"')
      .setBackground(color)
      .setRanges([range]);
    if (fontColor) builder = builder.setFontColor(fontColor);
    if (strike) builder = builder.setStrikethrough(true);
    return builder.build();
  };
  sheet.setConditionalFormatRules([
    rule('READY', '#EAF3FB', '#000000', false),
    rule('WAITING', '#FFF4D6', '#000000', false),
    rule('INACTIVE', CHECKLIST_STYLE.metadata, '#737C8C', true),
    rule('DONE', CHECKLIST_STYLE.section, '#214F87', false)
  ]);
}

function refreshChecklistProtection_(sheet) {
  const editable = [sheet.getRange('A3:G5')];
  const lastRow = Math.max(sheet.getLastRow(), RUNTIME.checklistFirstRow);
  const rowCount = lastRow - RUNTIME.checklistFirstRow + 1;
  const rows = sheet.getRange(RUNTIME.checklistFirstRow, 2, rowCount, 5).getDisplayValues();
  let taskBlockStart = 0;
  const flushTaskBlock = function (endRow) {
    if (!taskBlockStart) return;
    editable.push(sheet.getRange(taskBlockStart, 3, endRow - taskBlockStart, 2));
    taskBlockStart = 0;
  };
  rows.forEach(function (row, index) {
    const sheetRow = RUNTIME.checklistFirstRow + index;
    const status = String(row[3] || '');
    const id = String(row[4] || '');
    if (!id) {
      flushTaskBlock(sheetRow);
      return;
    }
    if (!taskBlockStart) taskBlockStart = sheetRow;
    if (status === 'READY' || status === 'DONE') editable.push(sheet.getRange(sheetRow, 2));
  });
  flushTaskBlock(RUNTIME.checklistFirstRow + rowCount);
  enforceSheetProtection_(sheet, 'CHECKLIST_STRUCTURE_DO_NOT_EDIT', editable);
}

function ensureConfigurationSheet_() {
  const spreadsheet = runtimeSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(RUNTIME.configurationSheet);
  if (!sheet) sheet = spreadsheet.insertSheet(RUNTIME.configurationSheet);
  if (sheet.getMaxColumns() < 3) sheet.insertColumnsAfter(sheet.getMaxColumns(), 3 - sheet.getMaxColumns());
  if (sheet.getMaxRows() < 50) sheet.insertRowsAfter(sheet.getMaxRows(), 50 - sheet.getMaxRows());
  if (sheet.getRange('A1').getNote() !== CONFIGURATION_UI.version) {
    const current = sheet.getLastRow() >= CONFIGURATION_UI.otherLastRow
      ? readConfigurationSheet_()
      : defaultConfiguration_();
    renderConfigurationSheet_(sheet, current);
  }
  protectConfigurationSheet_(sheet);
  return sheet;
}

function renderConfigurationSheet_(sheet, config) {
  sheet.getRange('A1:C1').breakApart().merge().setValue(RUNTIME.configurationSheet)
    .setBackground(CHECKLIST_STYLE.title).setFontColor('#ffffff').setFontFamily(CHECKLIST_STYLE.font)
    .setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A3:C3').setValues([['Parameter', 'Value', 'Format / purpose']])
    .setBackground(CHECKLIST_STYLE.header).setFontColor('#ffffff').setFontFamily(CHECKLIST_STYLE.font)
    .setFontSize(12).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A4:C50').clear();
  configurationCatalogSections_().forEach(function (section) {
    sheet.getRange(section.headerRow, 1, 1, 3)
      .setValues([[section.label, 'Enabled', 'System code']])
      .setBackground(CHECKLIST_STYLE.section).setFontColor('#000000').setFontWeight('bold');
    sheet.getRange(section.firstRow, 1, section.catalog.length, 3)
      .setValues(section.catalog.map(function (item) { return [item.name, false, item.code]; }));
    sheet.getRange(section.firstRow, 2, section.catalog.length, 1).insertCheckboxes();
    sheet.getRange(section.firstRow, 1, section.catalog.length, 1).setFontWeight('bold');
    sheet.getRange(section.firstRow, 3, section.catalog.length, 1).setFontColor('#5F6368').setNumberFormat('@');
  });
  sheet.getRange('A37:C45').setValues([
    ['Source: manual', false, 'Manual creation'],
    ['Source: CSV', false, 'Enables import tasks'],
    ['Source: supplier feed', false, 'Enables import and service-feed tasks'],
    ['Shipping: flat rate', false, 'Enables flat-rate tasks'],
    ['Shipping: supplier rate', false, 'Enables supplier-rate tasks'],
    ['Shipping: free shipping', false, 'Enables free-shipping tasks'],
    ['Shipping: pickup', false, 'Enables pickup tasks'],
    ['Multiple sources overlap', false, 'Enables source coordination tasks'],
    ['MMY / fitment applies', false, 'Controls existing fitment tasks']
  ]);
  sheet.getRange('B37:B45').insertCheckboxes();
  sheet.getRange('A37:A45').setFontWeight('bold');
  sheet.getRange('A4:C45').setVerticalAlignment('top').setFontFamily(CHECKLIST_STYLE.font).setFontSize(10);
  sheet.getRange('A1').setNote(CONFIGURATION_UI.version);
  writeConfigurationValues_(sheet, config);
  sheet.setHiddenGridlines(true);
  sheet.setFrozenRows(3);
  sheet.setColumnWidth(1, 320);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 420);
  sheet.setTabColor(CHECKLIST_STYLE.header);
}

function configurationCatalogSections_() {
  return [
    {key: 'integrations', label: 'Automotive integrations', catalog: AUTOMOTIVE_INTEGRATION_CATALOG, headerRow: 4, firstRow: 5},
    {key: 'payment_gateways', label: 'Payment gateways', catalog: PAYMENT_GATEWAY_CATALOG, headerRow: 14, firstRow: 15},
    {key: 'carriers', label: 'Carriers', catalog: CARRIER_CATALOG, headerRow: 25, firstRow: 26},
    {key: 'tax_services', label: 'Tax services', catalog: TAX_SERVICE_CATALOG, headerRow: 33, firstRow: 34}
  ];
}

function readConfigurationSheet_() {
  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.configurationSheet);
  if (!sheet) return defaultConfiguration_();
  const selected = {};
  configurationCatalogSections_().forEach(function (section) {
    const flags = sheet.getRange(section.firstRow, 2, section.catalog.length, 1).getValues();
    selected[section.key] = section.catalog.filter(function (item, index) {
      return flags[index][0] === true;
    }).map(function (item) { return {code: item.code, name: item.name}; });
  });
  const values = sheet.getRange('B37:B45').getValues();
  const sourceTypes = [];
  if (values[0][0] === true) sourceTypes.push('manual');
  if (values[1][0] === true) sourceTypes.push('csv');
  if (values[2][0] === true) sourceTypes.push('supplier_feed');
  const shippingMethods = [];
  if (values[3][0] === true) shippingMethods.push('flat_rate');
  if (values[4][0] === true) shippingMethods.push('supplier_rate');
  if (values[5][0] === true) shippingMethods.push('free_shipping');
  if (values[6][0] === true) shippingMethods.push('pickup');
  return normalizeConfiguration_({
    integrations: selected.integrations,
    payment_gateways: selected.payment_gateways,
    carriers: selected.carriers,
    tax_services: selected.tax_services,
    sourceTypes: sourceTypes,
    shippingMethods: shippingMethods,
    sourceOverlap: values[7][0] === true,
    fitment: values[8][0] === true
  });
}

function writeConfigurationValues_(sheet, config) {
  configurationCatalogSections_().forEach(function (section) {
    const selected = {};
    (config[section.key] || []).forEach(function (item) { selected[item.code] = true; });
    sheet.getRange(section.firstRow, 2, section.catalog.length, 1)
      .setValues(section.catalog.map(function (item) { return [Boolean(selected[item.code])]; }));
  });
  const sources = config.sourceTypes || [];
  const shipping = config.shippingMethods || [];
  sheet.getRange('B37:B45').setValues([
    [sources.indexOf('manual') >= 0], [sources.indexOf('csv') >= 0], [sources.indexOf('supplier_feed') >= 0],
    [shipping.indexOf('flat_rate') >= 0], [shipping.indexOf('supplier_rate') >= 0],
    [shipping.indexOf('free_shipping') >= 0], [shipping.indexOf('pickup') >= 0],
    [Boolean(config.sourceOverlap)], [Boolean(config.fitment)]
  ]);
}

function defaultConfiguration_() {
  return {
    integrations: [], payment_gateways: [], carriers: [], tax_services: [],
    shippingMethods: [], sourceTypes: ['manual'], sourceOverlap: false, fitment: false
  };
}

function normalizeConfiguration_(input) {
  const config = defaultConfiguration_();
  ['integrations', 'payment_gateways', 'carriers', 'tax_services'].forEach(function (key) {
    config[key] = (Array.isArray(input[key]) ? input[key] : []).map(function (item) {
      return {code: normalizeCode_(item.code), name: String(item.name || item.code || '').trim()};
    }).filter(function (item) { return item.code && item.name; });
  });
  config.shippingMethods = unique_((input.shippingMethods || []).map(String));
  config.sourceTypes = unique_((input.sourceTypes || ['manual']).map(String)).filter(function (value) {
    return SOURCE_TYPE_CATALOG.indexOf(value) >= 0;
  });
  config.sourceOverlap = Boolean(input.sourceOverlap) && config.sourceTypes.length >= 2;
  config.fitment = Boolean(input.fitment);
  config.carriers.forEach(function (item) {
    const key = 'carrier:' + item.code;
    if (config.shippingMethods.indexOf(key) < 0) config.shippingMethods.push(key);
  });
  return config;
}

function instantiateModel_(config) {
  const collections = {
    integrations: config.integrations,
    payment_gateways: config.payment_gateways,
    carriers: config.carriers,
    tax_services: config.tax_services
  };
  const templates = RUNTIME_MODEL.tasks;
  const byTemplate = {};
  templates.forEach(function (task) { byTemplate[task.id] = task; });
  const instances = [];
  templates.forEach(function (template) {
    if (template.scope === 'REPEAT') {
      (collections[template.collection] || []).forEach(function (item) { instances.push(createInstance_(template, item)); });
    } else {
      instances.push(createInstance_(template, null));
    }
  });

  function resolveReference(ref, owner) {
    const target = byTemplate[ref];
    if (!target || target.scope !== 'REPEAT') return [ref];
    if (owner.collection && owner.collection === target.collection) return [instantiateId_(ref, owner.instanceCode)];
    if (owner.templateId === '10-92' && target.collection === 'integrations') {
      return config.integrations.some(function (item) { return item.code === 'T14'; }) ? [instantiateId_(ref, 'T14')] : [];
    }
    return (collections[target.collection] || []).map(function (item) { return instantiateId_(ref, item.code); });
  }

  instances.forEach(function (task) {
    const configured = configuredLocalApplicability_(task, config);
    if (configured) {
      task.defaultApplicable = configured;
      task.systemApplicable = true;
    }
    task.parent = task.parentTemplate ? (resolveReference(task.parentTemplate, task)[0] || '') : '';
    task.dependencies = unique_([].concat.apply([], task.dependencyTemplates.map(function (ref) {
      return resolveReference(ref, task);
    }))).filter(function (id) { return Boolean(byTemplate[id] || instances.some(function (item) { return item.id === id; })); });
    task.configurationApplicable = configuredTaskApplicable_(task, config);
    if (!task.configurationApplicable) task.defaultApplicable = RUNTIME.no;
  });
  return instances;
}

function createInstance_(template, item) {
  const code = item ? item.code : '';
  const label = item ? item.name : '';
  return {
    id: item ? instantiateId_(template.id, code) : template.id,
    templateId: template.id,
    section: template.section,
    title: item ? replacePlaceholder_(template.en, label) : template.en,
    parentTemplate: template.parent || '',
    dependencyTemplates: template.dependencies || [],
    defaultApplicable: template.defaultApplicable,
    comment: template.comment || '',
    scope: template.scope,
    collection: template.collection || '',
    instanceCode: code
  };
}

function configuredTaskApplicable_(task, config) {
  const sources = config.sourceTypes || [];
  const importSelected = sources.indexOf('csv') >= 0 || sources.indexOf('supplier_feed') >= 0;
  const supplierFeedSelected = sources.indexOf('supplier_feed') >= 0;
  const configured = configuredLocalApplicability_(task, config);
  if (String(task.section).indexOf('5. SOURCE COORDINATION') === 0) return config.sourceOverlap && sources.length >= 2;
  if (configured === RUNTIME.no) return false;
  if (!config.fitment && (String(task.section).indexOf('8. MMY / FITMENT QA') === 0 ||
      CONFIGURATION_TASK_RULES.fitmentOptional.indexOf(task.templateId) >= 0)) return false;
  if (task.collection === 'integrations') return supplierFeedSelected;
  if (SOURCE_TASK_RULES.automotiveIntegration.indexOf(task.templateId) >= 0) {
    return supplierFeedSelected && config.integrations.length > 0;
  }
  if (SOURCE_TASK_RULES.supplierFeed.indexOf(task.templateId) >= 0) return supplierFeedSelected;
  if (SOURCE_TASK_RULES.import.indexOf(task.templateId) >= 0) return importSelected;
  return true;
}

function configuredLocalApplicability_(task, config) {
  const id = task.templateId || task.id;
  const shipping = config.shippingMethods || [];
  const yesNo = function (value) { return value ? RUNTIME.yes : RUNTIME.no; };
  if (CONFIGURATION_TASK_RULES.fitmentRequired.indexOf(id) >= 0) return yesNo(config.fitment);
  if (CONFIGURATION_TASK_RULES.flatRate.indexOf(id) >= 0) return yesNo(shipping.indexOf('flat_rate') >= 0);
  if (CONFIGURATION_TASK_RULES.supplierRate.indexOf(id) >= 0) return yesNo(shipping.indexOf('supplier_rate') >= 0);
  if (CONFIGURATION_TASK_RULES.freeShipping.indexOf(id) >= 0) return yesNo(shipping.indexOf('free_shipping') >= 0);
  return '';
}

function mergeTaskStateForRebuild_(tasks, previousById) {
  tasks.forEach(function (task) {
    const old = previousById[task.id];
    task.localApplicable = task.systemApplicable
      ? task.defaultApplicable
      : (old ? old.localApplicable : task.defaultApplicable);
    task.done = task.localApplicable === RUNTIME.yes && old ? Boolean(old.done) : false;
    task.commentValue = old ? old.comment : task.comment;
  });
  return tasks;
}

function validateTaskGraph_(tasks) {
  const byId = indexById_(tasks);
  const errors = [];
  tasks.forEach(function (task) {
    if (task.parent && !byId[task.parent]) errors.push(task.id + ' has missing parent ' + task.parent);
    task.dependencies.forEach(function (id) { if (!byId[id]) errors.push(task.id + ' has missing dependency ' + id); });
  });
  detectCycles_(tasks, function (task) { return task.dependencies; }).forEach(function (cycle) {
    errors.push('Dependency cycle: ' + cycle.join(' -> '));
  });
  detectCycles_(tasks, function (task) { return task.parent ? [task.parent] : []; }).forEach(function (cycle) {
    errors.push('Parent cycle: ' + cycle.join(' -> '));
  });
  if (errors.length) throw new Error(errors.join('\n'));
  return {ok: true, taskCount: tasks.length};
}

function writeCanonicalPool_(spreadsheet, tasks) {
  let sheet = spreadsheet.getSheetByName(RUNTIME.poolSheet);
  if (!sheet) sheet = spreadsheet.insertSheet(RUNTIME.poolSheet);
  if (sheet.getMaxColumns() < 8) sheet.insertColumnsAfter(sheet.getMaxColumns(), 8 - sheet.getMaxColumns());
  const rows = [['Task ID', 'Task', 'Parent ID', 'Dependencies', 'Applicable', 'Section', 'Scope', 'Collection']]
    .concat(tasks.map(function (task) {
      return [task.id, task.title, task.parent || '', task.dependencies.join(', '), task.localApplicable,
        task.section, task.scope, task.collection || ''];
    }));
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).breakApart().clearContent().clearDataValidations();
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  sheet.getRange(1, 1, rows.length, 8).setValues(rows).setVerticalAlignment('middle')
    .setFontFamily(CHECKLIST_STYLE.font).setFontSize(10);
  sheet.getRange(1, 1, rows.length, 4).setNumberFormat('@');
  sheet.getRange(1, 1, 1, 8).setBackground(CHECKLIST_STYLE.header).setFontColor('#ffffff')
    .setFontSize(12).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor(CHECKLIST_STYLE.header);
  if (!sheet.isSheetHidden()) sheet.hideSheet();
}

function protectPoolSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(RUNTIME.poolSheet);
  if (sheet) enforceSheetProtection_(sheet, 'CANONICAL_TASK_POOL_DO_NOT_EDIT', []);
}

function protectConfigurationSheet_(sheet) {
  const editable = configurationCatalogSections_().map(function (section) {
    return sheet.getRange(section.firstRow, 2, section.catalog.length, 1);
  });
  editable.push(sheet.getRange('B37:B45'));
  enforceSheetProtection_(sheet, 'CONFIGURATION_STRUCTURE_DO_NOT_EDIT', editable);
}

function enforceSheetProtection_(sheet, description, unprotectedRanges) {
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  let protection = protections.filter(function (item) { return item.getDescription() === description; })[0];
  if (!protection) protection = sheet.protect().setDescription(description);
  protection.setWarningOnly(false);
  protection.setUnprotectedRanges(unprotectedRanges || []);
  if (protection.canDomainEdit()) protection.setDomainEdit(false);
  return protection;
}

function normalizeApplicability_(value) {
  return String(value || '').trim().toUpperCase() === RUNTIME.no ? RUNTIME.no : RUNTIME.yes;
}

function indexById_(tasks) {
  const out = {};
  tasks.forEach(function (task) { out[task.id] = task; });
  return out;
}

function unique_(values) {
  return values.filter(function (value, index) { return values.indexOf(value) === index; });
}

function normalizeCode_(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
}

function replacePlaceholder_(text, label) {
  return String(text || '').replace(/\{[^}]+\}/g, label);
}

function instantiateId_(templateId, code) {
  const parts = String(templateId).split('-');
  if (parts.length > 2) parts[1] = code;
  return parts.join('-');
}

function detectCycles_(tasks, edgesFn) {
  const byId = indexById_(tasks);
  const visiting = {};
  const visited = {};
  const cycles = [];
  function visit(id, path) {
    if (visiting[id]) {
      cycles.push(path.slice(path.indexOf(id)).concat(id));
      return;
    }
    if (visited[id] || !byId[id]) return;
    visiting[id] = true;
    (edgesFn(byId[id]) || []).forEach(function (next) { visit(next, path.concat(id)); });
    visiting[id] = false;
    visited[id] = true;
  }
  tasks.forEach(function (task) { visit(task.id, []); });
  return cycles;
}

function formatRuntimeError_(error) {
  return error && error.message ? error.message : String(error || 'Unknown error');
}
