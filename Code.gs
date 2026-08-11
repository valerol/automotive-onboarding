const RUNTIME = Object.freeze({
  poolSheet: 'TASK POOL',
  checklistSheet: 'CHECKLIST',
  configurationSheet: 'CONFIGURATION',
  translationsSheet: '_RUNTIME_DATA',
  instructionSheet: 'INSTRUCTIONS',
  headerRow: 6,
  firstDataRow: 7,
  firstTaskRow: 8,
  checklistHeaderRow: 6,
  checklistFirstTaskRow: 7,
  columns: Object.freeze({id: 1, task: 2, parent: 3, dependencies: 4, applicable: 5, done: 6, comment: 7, effectiveApplicable: 8, status: 9, waitingFor: 10}),
  configKey: 'AUTOMOTIVE_RUNTIME_CONFIG_V1',
  configKeyCell: 'D1',
  configValueCell: 'E1',
  fastPathVersion: 'AUTOMOTIVE_FAST_PATH_V1',
  fastPathProperty: 'AUTOMOTIVE_FAST_PATH_VERSION',
  modelVersionProperty: 'AUTOMOTIVE_MODEL_VERSION',
  rowIndexCacheKey: 'AUTOMOTIVE_ROW_INDEX_V1',
  runtimeVersion: 3,
  runtimeVersionProperty: 'AUTOMOTIVE_RUNTIME_VERSION',
  yes: 'YES',
  no: 'NO',
  statuses: Object.freeze({inactive: 'INACTIVE', done: 'DONE', blocked: 'BLOCKED', ready: 'READY', waiting: 'WAITING'})
});

const CHECKLIST_FILTER = Object.freeze({
  propertyKey: 'CHECKLIST_STATUS_FILTER_V2',
  statuses: Object.freeze(['READY', 'WAITING', 'BLOCKED', 'INACTIVE', 'DONE'])
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

function runtimeStoragePrefix_() {
  return 'SPREADSHEET:' + runtimeSpreadsheet_().getId() + ':';
}

function runtimeProperties_() {
  const properties = PropertiesService.getScriptProperties();
  const prefix = runtimeStoragePrefix_();
  return {
    getProperty: function (key) { return properties.getProperty(prefix + key); },
    setProperty: function (key, value) { properties.setProperty(prefix + key, String(value)); return this; },
    setProperties: function (values) {
      const namespaced = {};
      Object.keys(values || {}).forEach(function (key) { namespaced[prefix + key] = String(values[key]); });
      properties.setProperties(namespaced);
      return this;
    },
    deleteProperty: function (key) { properties.deleteProperty(prefix + key); return this; }
  };
}

function runtimeCache_() {
  const cache = CacheService.getScriptCache();
  const prefix = runtimeStoragePrefix_();
  return {
    get: function (key) { return cache.get(prefix + key); },
    put: function (key, value, expiration) { cache.put(prefix + key, value, expiration); },
    remove: function (key) { cache.remove(prefix + key); }
  };
}

function runtimeLock_() {
  return LockService.getScriptLock();
}

function runtimeToast_(message, title, seconds) {
  try {
    runtimeSpreadsheet_().toast(message, title, seconds);
  } catch (ignored) {
    console.warn(String(title || 'Automotive Runtime') + ': ' + String(message));
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

// Source selection never creates task instances. It only controls the
// effective applicability of existing static or integration tasks.
const SOURCE_TASK_RULES = Object.freeze({
  import: Object.freeze([
    '01-08', '01-09', '01-18', '01-19', '03-13',
    '06-01', '06-02', '06-03', '06-04', '06-05', '06-06', '06-07',
    '06-08', '06-09', '06-10', '06-11', '06-12', '06-13', '06-14',
    '06-15', '06-17', '06-18', '06-19',
    '15-01', '15-02', '15-04', '16-01'
  ]),
  supplierFeed: Object.freeze([
    '06-20', '15-03', '16-02'
  ]),
  automotiveIntegration: Object.freeze([
    '01-06', '01-17', '06-16'
  ])
});

const CONFIGURATION_TASK_RULES = Object.freeze({
  fitmentRequired: Object.freeze([
    '04-INT-12', '06-19', '07-06', '13-04', '14-05', '15-07'
  ]),
  fitmentOptional: Object.freeze([
    '05-05', '07-PRODUCT-11'
  ]),
  flatRate: Object.freeze(['11-02']),
  supplierRate: Object.freeze(['04-INT-13', '11-03']),
  freeShipping: Object.freeze(['11-04', '13-10'])
});

const QA_PRODUCT_SAMPLE = Object.freeze({
  code: 'SAMPLE',
  name: 'Product specified in Comment'
});

const SHIPPING_METHOD_LABELS = Object.freeze({
  flat_rate: Object.freeze({code: 'FLAT_RATE', name: 'Flat rate'}),
  supplier_rate: Object.freeze({code: 'SUPPLIER_RATE', name: 'Supplier rate'}),
  free_shipping: Object.freeze({code: 'FREE_SHIPPING', name: 'Free shipping'}),
  pickup: Object.freeze({code: 'PICKUP', name: 'Pickup'})
});

const CONFIGURATION_UI = Object.freeze({
  version: 'AUTOMOTIVE_CONFIG_APPLICABILITY_V6_ENGLISH',
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

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('CHECKLIST')
    .addItem('Open checklist', 'openChecklist')
    .addItem('Open configuration', 'openChecklistConfiguration')
    .addItem('Save configuration and rebuild', 'saveChecklistConfiguration')
    .addSeparator()
    .addItem('Refresh checklist', 'refreshChecklist')
    .addSubMenu(
      ui.createMenu('Status filter')
        .addItem('Select statuses…', 'openChecklistStatusFilter')
        .addItem('READY only', 'showReadyTasks')
        .addItem('All statuses', 'showAllChecklistTasks')
    )
    .addItem('Validate model', 'showRuntimeValidation')
    .addItem('Authorize and diagnose', 'authorizeAndDiagnoseRuntime')
    .addSeparator()
    .addItem('Check runtime compatibility', 'showRuntimeCompatibility')
    .addItem('Apply runtime migrations', 'migrateRuntime')
    .addItem('Create onboarding project', 'promptCreateOnboardingProject')
    .addToUi();

  try {
    const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.checklistSheet);
    if (sheet) repairChecklistFilterControl_(sheet);
  } catch (ignored) {
    // The menu must remain available even if a read-only session blocks repair.
  }

  try {
    const compatibility = getRuntimeCompatibility();
    if (!compatibility.ok) {
      runtimeToast_(
        'Runtime migration required: ' + compatibility.storedRuntimeVersion + ' → ' + compatibility.runtimeVersion,
        'Automotive Runtime',
        8
      );
    }
  } catch (ignored) {
    // Compatibility diagnostics must not prevent the spreadsheet from opening.
  }
}

function authorizeAndDiagnoseRuntime() {
  const authorization = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authorization.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
    const authorizationUrl = authorization.getAuthorizationUrl();
    if (!authorizationUrl) {
      SpreadsheetApp.getUi().alert(
        'Google reports that authorization is required, but did not provide an authorization URL. ' +
        'Run authorizeAndDiagnoseRuntime from the Apps Script editor.'
      );
      return {ok: false, stage: 'authorization', error: 'Authorization URL is unavailable.'};
    }

    const html = HtmlService.createHtmlOutput(
      '<div style="font:14px Arial,sans-serif;padding:18px;line-height:1.5">' +
        '<p>Google Sheets access has not been granted to this runtime.</p>' +
        '<p><a href="' + escapeHtmlAttribute_(authorizationUrl) + '" target="_blank" ' +
        'style="display:inline-block;padding:9px 14px;background:#1a73e8;color:#fff;' +
        'text-decoration:none;border-radius:4px">Grant access</a></p>' +
        '<p>After approving access, close this window and select ' +
        '<b>Automotive Runtime → Authorize and diagnose</b> again.</p>' +
      '</div>'
    ).setWidth(440).setHeight(220);
    SpreadsheetApp.getUi().showModalDialog(html, 'Authorize Automotive Runtime');
    return {ok: false, stage: 'authorization', error: 'Authorization required.'};
  }

  const result = getRuntimeDiagnostics();
  const lines = result.ok
    ? [
        'Access confirmed.',
        'Spreadsheet: ' + result.spreadsheetName,
        'Task pool rows: ' + result.poolRows,
        'Translation rows: ' + result.translationRows,
        'Document lock: ' + (result.documentLock ? 'available' : 'busy')
      ]
    : [
        'Runtime diagnostic failed.',
        'Stage: ' + result.stage,
        'Error: ' + result.error
      ];
  SpreadsheetApp.getUi().alert(lines.join('\n'));
  return result;
}

function authorizeCentralProjectRuntime() {
  return {
    ok: true,
    installableTriggerCount: ScriptApp.getProjectTriggers().length
  };
}

function refreshInstructionSheet() {
  return renderEnglishInstructions_(runtimeSpreadsheet_());
}

function getRuntimeDiagnostics() {
  const result = {
    ok: false,
    stage: 'start',
    spreadsheetId: '',
    spreadsheetName: '',
    poolRows: 0,
    translationRows: 0,
    documentLock: false,
    error: ''
  };

  try {
    result.stage = 'open-current-spreadsheet';
    const spreadsheet = runtimeSpreadsheet_();
    if (!spreadsheet) throw new Error('The script is not bound to an active spreadsheet.');
    result.spreadsheetId = spreadsheet.getId();
    result.spreadsheetName = spreadsheet.getName();

    result.stage = 'read-task-pool';
    const pool = spreadsheet.getSheetByName(RUNTIME.poolSheet);
    if (!pool) throw new Error('Missing sheet: ' + RUNTIME.poolSheet);
    result.poolRows = pool.getLastRow();
    pool.getRange(1, 1).getDisplayValue();

    result.stage = 'read-translations';
    const translations = spreadsheet.getSheetByName(RUNTIME.translationsSheet);
    if (!translations) throw new Error('Missing sheet: ' + RUNTIME.translationsSheet);
    result.translationRows = translations.getLastRow();
    translations.getRange(1, 1).getDisplayValue();

    result.stage = 'document-lock';
    const lock = runtimeLock_();
    result.documentLock = lock.tryLock(1000);
    if (result.documentLock) lock.releaseLock();

    result.stage = 'complete';
    result.ok = true;
  } catch (error) {
    result.error = formatRuntimeError_(error);
  }
  return result;
}

function showRuntimeSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar').setTitle('Automotive Runtime');
  SpreadsheetApp.getUi().showSidebar(html);
}

function installChecklistWorkspace() {
  const spreadsheet = runtimeSpreadsheet_();
  const checklist = ensureChecklistSheet_();
  ensureConfigurationSheet_();
  protectPoolSheet_();
  refreshChecklist_();
  spreadsheet.setActiveSheet(checklist);
  spreadsheet.toast('Workspace is ready.', 'CHECKLIST', 4);
}

function openChecklist() {
  const checklist = ensureChecklistSheet_();
  ensureConfigurationSheet_();
  protectPoolSheet_();
  refreshChecklist_();
  runtimeSpreadsheet_().setActiveSheet(checklist);
}

function openChecklistConfiguration() {
  const sheet = ensureConfigurationSheet_();
  runtimeSpreadsheet_().setActiveSheet(sheet);
}

function refreshChecklist() {
  refreshChecklist_();
  runtimeToast_('Data refreshed.', 'CHECKLIST', 3);
}

function repairRuntimeData() {
  const lock = runtimeLock_();
  lock.waitLock(30000);
  let backupName = '';
  try {
    const spreadsheet = runtimeSpreadsheet_();
    const pool = getPoolSheet_();
    backupName = 'TASK POOL RECOVERY ' + Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), 'yyyyMMdd HHmmss');
    pool.copyTo(spreadsheet).setName(backupName).hideSheet();
    const config = getRuntimeConfiguration();
    rebuildOperationalPool_(config);
    refreshChecklist_(true);
    const state = readOperationalState_(config);
    writeProjectMetadata_(spreadsheet, {
      runtimeVersion: RUNTIME.runtimeVersion,
      modelVersion: RUNTIME_MODEL.version,
      migrationStatus: 'CURRENT'
    });
    return {ok: true, taskCount: state.tasks.length, backupSheet: backupName};
  } finally {
    lock.releaseLock();
  }
}

function showReadyTasks() {
  const sheet = ensureChecklistSheet_();
  refreshChecklist_();
  showReadyTasks_(sheet);
}

function showAllChecklistTasks() {
  const sheet = ensureChecklistSheet_();
  setChecklistStatusSelection_(CHECKLIST_FILTER.statuses);
  repairChecklistFilterControl_(sheet);
  applyChecklistStatusFilter_(sheet);
  runtimeSpreadsheet_().setActiveSheet(sheet);
  sheet.getRange(RUNTIME.checklistFirstTaskRow, 1).activate();
}

function saveChecklistConfiguration() {
  try {
    const config = readConfigurationSheet_();
    saveRuntimeConfiguration(config);
    writeConfigurationSheet_(getRuntimeConfiguration());
    refreshChecklist_();
    runtimeSpreadsheet_().setActiveSheet(ensureChecklistSheet_());
    runtimeToast_('Configuration saved and tasks rebuilt.', 'CHECKLIST', 5);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Unable to save configuration:\n' + formatRuntimeError_(error));
    throw error;
  }
}

function showRuntimeValidation() {
  const result = validateRuntimeModel();
  const text = result.ok ? 'Model is valid.' : result.errors.join('\n');
  SpreadsheetApp.getUi().alert(text);
  return result;
}

function onEdit(e) {
  if (!e || !e.range) return;
  return withRuntimeSpreadsheet_(e.source || e.range.getSheet().getParent(), function () {
    return handleRuntimeEdit_(e);
  });
}

function centralProjectOnEdit(e) {
  return onEdit(e);
}

function handleRuntimeEdit_(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() === RUNTIME.checklistSheet) {
    handleChecklistEdit_(e);
    return;
  }
  if (sheet.getName() === RUNTIME.configurationSheet) {
    handleConfigurationEdit_(e);
    return;
  }
  if (sheet.getName() !== RUNTIME.poolSheet || e.range.getRow() < RUNTIME.firstTaskRow) return;
  if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) {
    recalculateRuntime();
    return;
  }

  const column = e.range.getColumn();
  if (column === RUNTIME.columns.done && String(e.value) === 'TRUE') {
    const check = canCompleteTask_(String(sheet.getRange(e.range.getRow(), RUNTIME.columns.id).getDisplayValue()));
    if (!check.allowed) {
      e.range.setValue(false);
      runtimeToast_(check.reason, 'DONE rejected', 6);
    }
  }

  if (column === RUNTIME.columns.parent || column === RUNTIME.columns.dependencies) {
    const validation = validateRuntimeModel();
    if (!validation.ok) {
      if (typeof e.oldValue !== 'undefined') e.range.setValue(e.oldValue);
      else e.range.clearContent();
      runtimeToast_(validation.errors[0], 'Invalid graph edit', 8);
    }
  }

  recalculateRuntime();
}

function handleConfigurationEdit_(e) {
  if (e.range.getRow() < 4 || e.range.getColumn() > 2) return;
  try {
    const config = readConfigurationSheet_();
    saveRuntimeConfiguration(config);
    writeConfigurationSheet_(getRuntimeConfiguration());
    refreshChecklist_();
    runtimeToast_('Configuration saved and checklist rebuilt.', 'CHECKLIST', 5);
  } catch (error) {
    if (typeof e.oldValue !== 'undefined') e.range.setValue(e.oldValue);
    else e.range.clearContent();
    runtimeToast_(formatRuntimeError_(error), 'Configuration rejected', 8);
  }
}

function handleChecklistEdit_(e) {
  const editLock = runtimeLock_();
  if (!editLock.tryLock(5000)) {
    runtimeToast_('The previous edit is still being processed. Try again.', 'CHECKLIST', 5);
    return;
  }

  try {
    const sheet = e.range.getSheet();
    if (e.range.getA1Notation() === 'D2') {
      const requested = String(e.range.getDisplayValue() || '').toUpperCase();
      setChecklistStatusSelection_(requested === 'ALL' ? CHECKLIST_FILTER.statuses : [requested]);
      repairChecklistFilterControl_(sheet);
      applyChecklistStatusFilter_(sheet);
      return;
    }
    if (e.range.getA1Notation() === 'G2') {
      const language = String(e.range.getDisplayValue()).toUpperCase();
      if (language !== 'RU' && language !== 'EN') e.range.setValue('RU');
      refreshChecklist_();
      return;
    }
    if (e.range.getRow() < RUNTIME.checklistFirstTaskRow) return;
    if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) {
      refreshChecklist_();
      runtimeToast_('Range paste was reverted. Edit one task at a time.', 'CHECKLIST', 5);
      return;
    }

    const column = e.range.getColumn();
    if ([4, 5, 6].indexOf(column) < 0) {
      refreshChecklist_();
      runtimeToast_('Only Applicable, DONE, and Comment are editable.', 'CHECKLIST', 5);
      return;
    }

    const taskId = String(sheet.getRange(e.range.getRow(), 1).getDisplayValue() || '').trim();
    if (!taskId) {
      refreshChecklist_();
      return;
    }

    try {
      if (!runtimeFastPathCompatible_()) {
        refreshChecklist_();
        return;
      }

      if (column === 6) {
        fastUpdateComment_(taskId, String(e.range.getValue() || ''));
        return;
      }

      fastUpdateChecklistTask_(sheet, taskId, {
        applicable: column === 4
          ? (String(e.range.getDisplayValue()) === RUNTIME.no ? RUNTIME.no : RUNTIME.yes)
          : undefined,
        done: column === 5 ? String(e.value) === 'TRUE' : undefined
      }, e.range.getRow());
    } catch (error) {
      if (typeof e.oldValue !== 'undefined') e.range.setValue(e.oldValue);
      else if (column === 5) e.range.setValue(false);
      else e.range.clearContent();
      runtimeToast_(formatRuntimeError_(error), 'Edit rejected', 7);
    }
  } finally {
    editLock.releaseLock();
  }
}

function runtimeFastPathCompatible_() {
  const properties = runtimeProperties_();
  return properties.getProperty(RUNTIME.fastPathProperty) === RUNTIME.fastPathVersion &&
    properties.getProperty(RUNTIME.modelVersionProperty) === RUNTIME_MODEL.version;
}

function markRuntimeFastPathCompatible_() {
  runtimeProperties_().setProperties((function () {
    const values = {};
    values[RUNTIME.fastPathProperty] = RUNTIME.fastPathVersion;
    values[RUNTIME.modelVersionProperty] = RUNTIME_MODEL.version;
    values[RUNTIME.runtimeVersionProperty] = String(RUNTIME.runtimeVersion);
    return values;
  })());
}

function invalidateRuntimeIndexes_() {
  runtimeCache_().remove(RUNTIME.rowIndexCacheKey);
}

function fastUpdateComment_(taskId, comment) {
  const pool = getPoolSheet_();
  const row = findTaskRowCached_(pool, taskId);
  if (!row || String(pool.getRange(row, RUNTIME.columns.id).getDisplayValue() || '').trim() !== taskId) {
    invalidateRuntimeIndexes_();
    throw new Error('Task row index is stale for ' + taskId + '. Run a full checklist refresh.');
  }
  pool.getRange(row, RUNTIME.columns.comment).setValue(comment);
}

function fastUpdateChecklistTask_(checklist, taskId, patch, editedRow) {
  const timer = createRuntimeTimer_('checklist-edit');
  const config = getRuntimeConfiguration();
  const state = readOperationalState_(config);
  timer.mark('read-state');
  const indexes = buildRuntimeIndexes_(state.tasks);
  const task = indexes.byId[taskId];
  if (!task) throw new Error('Unknown Task ID: ' + taskId);

  const checklistIndex = readChecklistRowIndex_(checklist);
  if (checklistIndex.byId[taskId] !== editedRow) {
    invalidateRuntimeIndexes_();
    throw new Error('Checklist row index is stale for ' + taskId + '. Run a full checklist refresh.');
  }

  const before = state.tasks.map(cloneRuntimeTask_);
  const baseline = calculateRuntimeGraph_(state.tasks.map(cloneRuntimeTask_), config);
  const baselineTask = baseline.byId[taskId];

  if (typeof patch.applicable !== 'undefined') {
    if (task.systemApplicable) {
      checklist.getRange(checklistIndex.byId[taskId], 4).setValue(task.localApplicable);
      throw new Error(taskId + ' applicability is controlled by Configuration.');
    }
    task.localApplicable = patch.applicable === RUNTIME.no ? RUNTIME.no : RUNTIME.yes;
  }

  if (typeof patch.done !== 'undefined') {
    if (patch.done && baselineTask.status !== RUNTIME.statuses.ready) {
      checklist.getRange(checklistIndex.byId[taskId], 5).setValue(Boolean(task.done));
      throw new Error(taskId + ' is not READY. Waiting for: ' + baselineTask.waitingFor);
    }
    task.done = Boolean(patch.done);
  }

  const calculated = calculateRuntimeGraph_(state.tasks, config);
  timer.mark('calculate');
  const changedIds = diffRuntimeTasks_(before, calculated.tasks);
  writeRuntimeDiff_(state.sheet, calculated.tasks, changedIds);
  timer.mark('write-pool');
  writeChecklistDiff_(checklist, checklistIndex, calculated, changedIds);
  timer.mark('write-checklist');
  updateCountersFromTasks_(state.sheet, calculated.tasks);
  applyChecklistVisibilityFromGraph_(
    checklist,
    checklistIndex,
    calculated.tasks,
    typeof patch.done !== 'undefined'
  );
  cacheRuntimeRowIndex_(calculated.tasks, checklistIndex);
  timer.mark('finalize');
  timer.finish();
}

function cloneRuntimeTask_(task) {
  const clone = {};
  Object.keys(task).forEach(function (key) {
    clone[key] = Array.isArray(task[key]) ? task[key].slice() : task[key];
  });
  return clone;
}

function buildRuntimeIndexes_(tasks) {
  const byId = {};
  const reverseDependencies = {};
  const children = {};
  const poolRowById = {};
  tasks.forEach(function (task) {
    byId[task.id] = task;
    poolRowById[task.id] = task.row;
    task.dependencies.forEach(function (dependency) {
      (reverseDependencies[dependency] || (reverseDependencies[dependency] = [])).push(task.id);
    });
    if (task.parent) (children[task.parent] || (children[task.parent] = [])).push(task.id);
  });
  return {
    byId: byId,
    poolRowById: poolRowById,
    reverseDependencies: reverseDependencies,
    children: children
  };
}

function calculateRuntimeGraph_(tasks, config) {
  const indexes = buildRuntimeIndexes_(tasks);
  const byId = indexes.byId;
  const activeMemo = {};

  tasks.forEach(function (task) {
    const configuredApplicable = configuredLocalApplicability_(task, config);
    if (configuredApplicable) task.localApplicable = configuredApplicable;
  });

  function isActive(task, trail) {
    if (Object.prototype.hasOwnProperty.call(activeMemo, task.id)) return activeMemo[task.id];
    if (task.configurationApplicable === false || task.localApplicable === RUNTIME.no) {
      return (activeMemo[task.id] = false);
    }
    if (!task.parent) return (activeMemo[task.id] = true);
    if ((trail || []).indexOf(task.id) >= 0) return (activeMemo[task.id] = false);
    const parent = byId[task.parent];
    return (activeMemo[task.id] = Boolean(parent && isActive(parent, (trail || []).concat(task.id))));
  }

  tasks.forEach(function (task) { task.active = isActive(task, []); });

  let changed = true;
  while (changed) {
    changed = false;
    const capability = evaluateCapabilities_(tasks, config);
    tasks.forEach(function (task) {
      const readiness = evaluateTaskReadiness_(task, byId, capability, config);
      if (task.done && (!task.active || readiness.level !== 'PASS')) {
        task.done = false;
        changed = true;
      }
    });
  }

  const capability = evaluateCapabilities_(tasks, config);
  tasks.forEach(function (task) {
    const readiness = evaluateTaskReadiness_(task, byId, capability, config);
    task.effectiveApplicable = task.active ? RUNTIME.yes : RUNTIME.no;
    if (!task.active) task.status = RUNTIME.statuses.inactive;
    else if (task.done) task.status = RUNTIME.statuses.done;
    else if (readiness.level === 'BLOCKED') task.status = RUNTIME.statuses.blocked;
    else if (readiness.level === 'PASS') task.status = RUNTIME.statuses.ready;
    else task.status = RUNTIME.statuses.waiting;
    task.waitingFor = task.status === RUNTIME.statuses.waiting || task.status === RUNTIME.statuses.blocked
      ? readiness.reasons.join(', ')
      : '';
  });
  return {tasks: tasks, byId: byId, indexes: indexes};
}

function diffRuntimeTasks_(before, after) {
  const beforeById = indexById_(before);
  return after.filter(function (task) {
    const old = beforeById[task.id];
    return !old || old.localApplicable !== task.localApplicable || old.done !== task.done ||
      old.effectiveApplicable !== task.effectiveApplicable || old.status !== task.status ||
      old.waitingFor !== task.waitingFor;
  }).map(function (task) { return task.id; });
}

function writeRuntimeDiff_(sheet, tasks, changedIds) {
  const changed = {};
  changedIds.forEach(function (id) { changed[id] = true; });
  const rows = tasks.filter(function (task) { return changed[task.id]; });
  writeContiguousTaskBlocks_(sheet, rows, RUNTIME.columns.applicable, 2, function (task) {
    return [task.localApplicable, Boolean(task.done)];
  });
  writeContiguousTaskBlocks_(sheet, rows, RUNTIME.columns.effectiveApplicable, 2, function (task) {
    return [task.effectiveApplicable, task.status];
  });
  writeContiguousTaskBlocks_(sheet, rows, RUNTIME.columns.waitingFor, 1, function (task) {
    return [task.waitingFor];
  }, '@');
}

function writeContiguousTaskBlocks_(sheet, tasks, column, width, valueFn, numberFormat) {
  if (!tasks.length) return;
  const ordered = tasks.slice().sort(function (a, b) { return a.row - b.row; });
  let block = [ordered[0]];
  const flush = function () {
    const range = sheet.getRange(block[0].row, column, block.length, width);
    if (numberFormat) range.setNumberFormat(numberFormat);
    range.setValues(block.map(valueFn));
  };
  for (let index = 1; index < ordered.length; index++) {
    if (ordered[index].row === ordered[index - 1].row + 1) block.push(ordered[index]);
    else { flush(); block = [ordered[index]]; }
  }
  flush();
}

function readChecklistRowIndex_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), RUNTIME.checklistFirstTaskRow);
  const rows = sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, lastRow - RUNTIME.checklistFirstTaskRow + 1, 3).getDisplayValues();
  const byId = {};
  const sectionRowById = {};
  let sectionRow = 0;
  rows.forEach(function (row, index) {
    const sheetRow = RUNTIME.checklistFirstTaskRow + index;
    const id = String(row[0] || '').trim();
    if (!id && String(row[1] || '').trim()) sectionRow = sheetRow;
    else if (id) { byId[id] = sheetRow; sectionRowById[id] = sectionRow; }
  });
  return {byId: byId, sectionRowById: sectionRowById, lastRow: lastRow};
}

function writeChecklistDiff_(sheet, checklistIndex, calculated, changedIds) {
  const tasks = changedIds.map(function (id) { return calculated.byId[id]; }).filter(function (task) {
    return task && checklistIndex.byId[task.id];
  }).map(function (task) {
    const copy = cloneRuntimeTask_(task);
    copy.row = checklistIndex.byId[task.id];
    return copy;
  });
  writeContiguousTaskBlocks_(sheet, tasks, 3, 3, function (task) {
    return [task.status, task.localApplicable, Boolean(task.done)];
  });
  writeContiguousTaskBlocks_(sheet, tasks, 7, 1, function (task) { return [task.waitingFor]; }, '@');
}

function applyChecklistVisibilityFromGraph_(sheet, checklistIndex, tasks, focusReady) {
  let selected = focusReady ? [RUNTIME.statuses.ready] : getChecklistStatusSelection_();
  if (focusReady && !tasks.some(function (task) { return task.status === RUNTIME.statuses.ready; })) {
    selected = CHECKLIST_FILTER.statuses.slice();
  }
  if (focusReady) {
    setChecklistStatusSelection_(selected);
    sheet.getRange('D2').setValue(checklistFilterSummary_(selected));
  }
  const visibleSections = {};
  const hiddenRows = [];
  tasks.forEach(function (task) {
    const row = checklistIndex.byId[task.id];
    if (!row) return;
    if (selected.indexOf(task.status) >= 0) visibleSections[checklistIndex.sectionRowById[task.id]] = true;
    else hiddenRows.push(row);
  });
  Object.keys(checklistIndex.sectionRowById).forEach(function (id) {
    const sectionRow = checklistIndex.sectionRowById[id];
    if (sectionRow && !visibleSections[sectionRow] && hiddenRows.indexOf(sectionRow) < 0) hiddenRows.push(sectionRow);
  });
  sheet.showRows(RUNTIME.checklistFirstTaskRow, checklistIndex.lastRow - RUNTIME.checklistFirstTaskRow + 1);
  setChecklistHiddenRows_(sheet, hiddenRows);
}

function updateCountersFromTasks_(sheet, tasks) {
  const counts = countStatuses_(tasks);
  sheet.getRange('B3').setValue(counts.READY || 0);
  sheet.getRange('D3').setValue(counts.INACTIVE || 0);
  sheet.getRange('B4').setValue((counts.WAITING || 0) + (counts.BLOCKED || 0));
  sheet.getRange('D4').setValue(counts.DONE || 0);
}

function cacheRuntimeRowIndex_(tasks, checklistIndex) {
  const poolById = {};
  tasks.forEach(function (task) { poolById[task.id] = task.row; });
  runtimeCache_().put(RUNTIME.rowIndexCacheKey, JSON.stringify({
    poolById: poolById,
    checklistById: checklistIndex.byId,
    modelVersion: RUNTIME_MODEL.version,
    fastPathVersion: RUNTIME.fastPathVersion
  }), 21600);
}

function findTaskRowCached_(sheet, taskId) {
  const cache = runtimeCache_();
  const raw = cache.get(RUNTIME.rowIndexCacheKey);
  if (raw) {
    try {
      const index = JSON.parse(raw);
      if (index.modelVersion === RUNTIME_MODEL.version && index.fastPathVersion === RUNTIME.fastPathVersion && index.poolById[taskId]) {
        return Number(index.poolById[taskId]);
      }
    } catch (ignored) {
      cache.remove(RUNTIME.rowIndexCacheKey);
    }
  }
  const ids = sheet.getRange(RUNTIME.firstTaskRow, RUNTIME.columns.id, Math.max(1, sheet.getLastRow() - RUNTIME.firstTaskRow + 1), 1).getDisplayValues();
  const poolById = {};
  ids.forEach(function (value, index) {
    const id = String(value[0] || '').trim();
    if (id) poolById[id] = RUNTIME.firstTaskRow + index;
  });
  cache.put(RUNTIME.rowIndexCacheKey, JSON.stringify({
    poolById: poolById,
    checklistById: {},
    modelVersion: RUNTIME_MODEL.version,
    fastPathVersion: RUNTIME.fastPathVersion
  }), 21600);
  return Number(poolById[taskId] || 0);
}

function createRuntimeTimer_(name) {
  const started = Date.now();
  let previous = started;
  const stages = {};
  return {
    mark: function (stage) {
      const now = Date.now();
      stages[stage] = now - previous;
      previous = now;
    },
    finish: function () {
      const total = Date.now() - started;
      if (total > 3000) console.warn(JSON.stringify({operation: name, totalMs: total, stages: stages}));
      return {operation: name, totalMs: total, stages: stages};
    }
  };
}

function refreshChecklist_(lockAlreadyHeld) {
  recalculateRuntime(Boolean(lockAlreadyHeld));
  const state = readOperationalState_();
  const translations = readTranslations_();
  const sheet = ensureChecklistSheet_();
  const tasks = state.tasks.map(function (task) {
    const translated = translations[task.id] || {};
    return {
      id: task.id,
      title: translated.en || task.title,
      section: task.section,
      status: task.status,
      applicable: task.localApplicable,
      done: task.done,
      comment: task.comment,
      waitingFor: task.waitingFor
    };
  });

  const displayRows = [];
  let currentSection = '';
  tasks.forEach(function (task) {
    if (task.section !== currentSection) {
      currentSection = task.section;
      displayRows.push({type: 'section', section: currentSection});
    }
    displayRows.push({type: 'task', task: task});
  });

  const availableRows = sheet.getMaxRows() - RUNTIME.checklistFirstTaskRow + 1;
  if (displayRows.length > availableRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), displayRows.length - availableRows);
  }
  const clearRows = sheet.getMaxRows() - RUNTIME.checklistFirstTaskRow + 1;
  sheet.showRows(RUNTIME.checklistFirstTaskRow, clearRows);
  const checklistBody = sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, clearRows, 7);
  checklistBody.clearDataValidations();
  checklistBody.clearContent();
  checklistBody.clearFormat();

  if (displayRows.length) {
    const values = displayRows.map(function (row) {
      if (row.type === 'section') return ['', row.section, '', '', '', '', ''];
      const task = row.task;
      return [task.id, task.title, task.status, task.applicable, Boolean(task.done), task.comment, task.waitingFor];
    });
    const target = sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, values.length, 7);
    sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, values.length, 1).setNumberFormat('@');
    sheet.getRange(RUNTIME.checklistFirstTaskRow, 7, values.length, 1).setNumberFormat('@');
    target.setValues(values).setVerticalAlignment('middle');
    sheet.getRange(RUNTIME.checklistFirstTaskRow, 2, values.length, 1).setWrap(true);
    sheet.getRange(RUNTIME.checklistFirstTaskRow, 6, values.length, 2).setWrap(true);

    let blockStart = 0;
    displayRows.forEach(function (row, index) {
      const sheetRow = RUNTIME.checklistFirstTaskRow + index;
      if (row.type === 'section') {
        if (blockStart) {
          const blockLength = sheetRow - blockStart;
          const applicableRange = sheet.getRange(blockStart, 4, blockLength, 1);
          const doneRange = sheet.getRange(blockStart, 5, blockLength, 1);
          applicableRange.setDataValidation(
            SpreadsheetApp.newDataValidation()
              .requireValueInList([RUNTIME.yes, RUNTIME.no], true)
              .setAllowInvalid(false)
              .build()
          );
          doneRange.insertCheckboxes();
        }
        blockStart = 0;
        sheet.getRange(sheetRow, 1, 1, 7)
          .setBackground('#e9edf5')
          .setFontColor('#29375f')
          .setFontWeight('bold');
        sheet.setRowHeight(sheetRow, 28);
      } else if (!blockStart) {
        blockStart = sheetRow;
      }
    });
    if (blockStart) {
      const lastTaskRow = RUNTIME.checklistFirstTaskRow + displayRows.length;
      const blockLength = lastTaskRow - blockStart;
      const applicableRange = sheet.getRange(blockStart, 4, blockLength, 1);
      const doneRange = sheet.getRange(blockStart, 5, blockLength, 1);
      applicableRange.setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList([RUNTIME.yes, RUNTIME.no], true)
          .setAllowInvalid(false)
          .build()
      );
      doneRange.insertCheckboxes();
    }
  }

  applyChecklistStatusFilter_(sheet);
  markRuntimeFastPathCompatible_();
  cacheRuntimeRowIndex_(state.tasks, readChecklistRowIndex_(sheet));
}

function showReadyTasks_(sheet) {
  setChecklistStatusSelection_([RUNTIME.statuses.ready]);
  repairChecklistFilterControl_(sheet);
  applyChecklistStatusFilter_(sheet);

  const lastRow = Math.max(sheet.getLastRow(), RUNTIME.checklistFirstTaskRow);
  const rows = sheet.getRange(
    RUNTIME.checklistFirstTaskRow,
    1,
    lastRow - RUNTIME.checklistFirstTaskRow + 1,
    3
  ).getDisplayValues();
  let firstReadyRow = 0;
  for (let index = 0; index < rows.length; index++) {
    if (String(rows[index][0]) && String(rows[index][2]) === RUNTIME.statuses.ready) {
      firstReadyRow = RUNTIME.checklistFirstTaskRow + index;
      break;
    }
  }

  SpreadsheetApp.flush();
  runtimeSpreadsheet_().setActiveSheet(sheet);
  if (firstReadyRow) {
    sheet.getRange(firstReadyRow, 1).activate();
    return;
  }

  setChecklistStatusSelection_(CHECKLIST_FILTER.statuses);
  repairChecklistFilterControl_(sheet);
  applyChecklistStatusFilter_(sheet);
  sheet.getRange(RUNTIME.checklistFirstTaskRow, 1).activate();
  runtimeToast_(
    'No new READY tasks. Tasks with all statuses are shown.',
    'CHECKLIST',
    6
  );
}

function ensureChecklistSheet_() {
  const spreadsheet = runtimeSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  const created = !sheet;
  if (!sheet) sheet = spreadsheet.insertSheet(RUNTIME.checklistSheet);
  if (sheet.getMaxColumns() < 7) sheet.insertColumnsAfter(sheet.getMaxColumns(), 7 - sheet.getMaxColumns());
  if (sheet.getMaxRows() < 1000) sheet.insertRowsAfter(sheet.getMaxRows(), 1000 - sheet.getMaxRows());

  const needsLayoutUpgrade =
    created ||
    sheet.getRange('A1').getDisplayValue() !== RUNTIME.checklistSheet ||
    sheet.getRange('C6').getDisplayValue() !== 'Status' ||
    sheet.getRange('F2').getDisplayValue() !== 'Language';

  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();

  if (needsLayoutUpgrade) {
    sheet.showRows(1, sheet.getMaxRows());
    sheet.getRange('A1:H6').breakApart();
    sheet.clear();
    sheet.getRange('A1:G1').merge().setValue(RUNTIME.checklistSheet)
      .setBackground('#29375f').setFontColor('#ffffff').setFontSize(20).setFontWeight('bold');
    sheet.setRowHeight(1, 46);
    sheet.getRange('C2').setValue('Status').setFontWeight('bold');
    sheet.getRange('D2').setValue('READY');
    sheet.getRange('F2').setValue('Language').setFontWeight('bold');
    sheet.getRange('G2').setValue('EN').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(['EN'], true).setAllowInvalid(false).build()
    );
    sheet.getRange('A3:G3').clearContent();
    sheet.setRowHeight(3, 8);
    sheet.getRange('A5:G5').merge()
      .setValue('Status filter: CHECKLIST -> Status filter. Only Applicable, DONE, and Comment can be edited.')
      .setBackground('#f4f6f8').setFontColor('#667085');
    sheet.getRange('A6:G6').setValues([['Task ID', 'Task', 'Status', 'Applicable', 'DONE', 'Comment', 'Waiting for']])
      .setBackground('#356853').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(RUNTIME.checklistHeaderRow);
    sheet.setHiddenGridlines(true);
    sheet.setColumnWidth(1, 90);
    sheet.setColumnWidth(2, 440);
    sheet.setColumnWidth(3, 100);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 70);
    sheet.setColumnWidth(6, 360);
    sheet.setColumnWidth(7, 240);
    sheet.setTabColor('#356853');
  } else {
    sheet.getRange('G2').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(['EN'], true).setAllowInvalid(false).build()
    );
    sheet.getRange('A3:G3').clearContent();
  }

  repairChecklistFilterControl_(sheet);
  sheet.showColumns(1, 7);
  if (sheet.getMaxColumns() > 7) sheet.hideColumns(8, sheet.getMaxColumns() - 7);
  ensureChecklistFormatting_(sheet);
  return sheet;
}

function ensureChecklistFormatting_(sheet) {
  const range = sheet.getRange(
    RUNTIME.checklistFirstTaskRow,
    1,
    sheet.getMaxRows() - RUNTIME.checklistFirstTaskRow + 1,
    7
  );
  const rule = function (status, color, fontColor, strike) {
    let builder = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$C' + RUNTIME.checklistFirstTaskRow + '="' + status + '"')
      .setBackground(color)
      .setRanges([range]);
    if (fontColor) builder = builder.setFontColor(fontColor);
    if (strike) builder = builder.setStrikethrough(true);
    return builder.build();
  };
  sheet.setConditionalFormatRules([
    rule('READY', '#ddefe3', '#202536', false),
    rule('WAITING', '#fff0cc', '#202536', false),
    rule('BLOCKED', '#f9d7d7', '#a52626', false),
    rule('INACTIVE', '#e8ecf1', '#737c8c', true),
    rule('DONE', '#dbe7ff', '#3c4962', false)
  ]);
}

function checklistLanguage_(sheet) {
  return 'en';
}

function openChecklistStatusFilter() {
  const selected = getChecklistStatusSelection_();
  const items = CHECKLIST_FILTER.statuses.map(function (status) {
    const checked = selected.indexOf(status) >= 0 ? ' checked' : '';
    return '<label style="display:flex;gap:10px;align-items:center;padding:7px 0">' +
      '<input type="checkbox" name="status" value="' + status + '"' + checked + '>' +
      '<span>' + status + '</span></label>';
  }).join('');

  const html = HtmlService.createHtmlOutput(
    '<!doctype html><html><head><base target="_top"><style>' +
    'body{font:14px Arial,sans-serif;color:#202124;padding:18px;margin:0}' +
    'h3{margin:0 0 8px;font-size:17px}' +
    'p{margin:0 0 12px;color:#5f6368;line-height:1.4}' +
    '.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}' +
    'button{border:1px solid #dadce0;background:#fff;border-radius:4px;padding:8px 12px;cursor:pointer}' +
    'button.primary{background:#356853;color:#fff;border-color:#356853}' +
    '#error{min-height:18px;color:#b3261e;margin-top:8px}' +
    '</style></head><body>' +
    '<h3>Status filter</h3>' +
    '<p>Select one or more statuses. Sections without matching tasks will be hidden.</p>' +
    '<div>' + items + '</div>' +
    '<div id="error"></div>' +
    '<div class="actions">' +
    '<button onclick="selectAll()">All</button>' +
    '<button onclick="onlyReady()">READY only</button>' +
    '<button class="primary" onclick="applyFilter()">Apply</button>' +
    '</div>' +
    '<script>' +
    'function boxes(){return Array.prototype.slice.call(document.querySelectorAll(\'input[name="status"]\'));}' +
    'function selectAll(){boxes().forEach(function(x){x.checked=true;});}' +
    'function onlyReady(){boxes().forEach(function(x){x.checked=x.value==="READY";});}' +
    'function applyFilter(){' +
      'var selected=boxes().filter(function(x){return x.checked;}).map(function(x){return x.value;});' +
      'if(!selected.length){document.getElementById("error").textContent="Select at least one status.";return;}' +
      'document.getElementById("error").textContent="";' +
      'google.script.run.withSuccessHandler(function(){google.script.host.close();})' +
      '.withFailureHandler(function(error){document.getElementById("error").textContent=error.message||String(error);})' +
      '.applyChecklistStatusSelection(selected);' +
    '}' +
    '</script></body></html>'
  ).setWidth(420).setHeight(430);
  SpreadsheetApp.getUi().showModalDialog(html, 'Status filter');
}

function applyChecklistStatusSelection(statuses) {
  const selected = setChecklistStatusSelection_(statuses);
  const sheet = ensureChecklistSheet_();
  repairChecklistFilterControl_(sheet);
  applyChecklistStatusFilter_(sheet);
  runtimeSpreadsheet_().setActiveSheet(sheet);
  sheet.getRange(RUNTIME.checklistFirstTaskRow, 1).activate();
  return {ok: true, selected: selected};
}

function normalizeChecklistStatusSelection_(values) {
  const requested = Array.isArray(values) ? values : [];
  return CHECKLIST_FILTER.statuses.filter(function (status) {
    return requested.map(function (value) { return String(value).toUpperCase(); }).indexOf(status) >= 0;
  });
}

function getChecklistStatusSelection_() {
  const properties = runtimeProperties_();
  const stored = properties.getProperty(CHECKLIST_FILTER.propertyKey);
  if (stored) {
    try {
      const selected = normalizeChecklistStatusSelection_(JSON.parse(stored));
      if (selected.length) return selected;
    } catch (ignored) {
      // Migrate invalid legacy state below.
    }
  }

  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.checklistSheet);
  const legacyValue = sheet ? String(sheet.getRange('D2').getDisplayValue() || '').toUpperCase() : '';
  const selected = legacyValue === 'ALL'
    ? CHECKLIST_FILTER.statuses.slice()
    : normalizeChecklistStatusSelection_(legacyValue.match(/READY|WAITING|BLOCKED|INACTIVE|DONE/g) || []);
  const migrated = selected.length ? selected : [RUNTIME.statuses.ready];
  properties.setProperty(CHECKLIST_FILTER.propertyKey, JSON.stringify(migrated));
  return migrated;
}

function setChecklistStatusSelection_(values) {
  const selected = normalizeChecklistStatusSelection_(values);
  if (!selected.length) throw new Error('Select at least one status.');
  runtimeProperties_()
    .setProperty(CHECKLIST_FILTER.propertyKey, JSON.stringify(selected));
  return selected;
}

function checklistFilterSummary_(selected) {
  return selected.length === CHECKLIST_FILTER.statuses.length ? 'ALL' : selected.join(' + ');
}

function repairChecklistFilterControl_(sheet) {
  const selected = getChecklistStatusSelection_();
  sheet.getRange('D2')
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(['ALL'].concat(CHECKLIST_FILTER.statuses), true)
        .setAllowInvalid(false)
        .build()
    )
    .setValue(checklistFilterSummary_(selected))
    .setNote(
      'Select ALL or one status. Use the central master menu for a combination of statuses.'
    );
}

function checklistStatusFilter_(sheet) {
  return getChecklistStatusSelection_();
}

function applyChecklistStatusFilter_(sheet) {
  const firstRow = RUNTIME.checklistFirstTaskRow;
  const lastRow = sheet.getLastRow();
  if (lastRow < firstRow) return;

  const rowCount = lastRow - firstRow + 1;
  sheet.showRows(firstRow, rowCount);
  const rows = sheet.getRange(firstRow, 1, rowCount, 3).getDisplayValues();
  const selected = checklistStatusFilter_(sheet);
  const hiddenRows = [];
  let sectionRow = 0;
  let sectionHasMatch = false;

  const closeSection = function () {
    if (sectionRow && !sectionHasMatch) hiddenRows.push(sectionRow);
  };

  rows.forEach(function (row, index) {
    const sheetRow = firstRow + index;
    const taskId = String(row[0] || '').trim();
    const title = String(row[1] || '').trim();
    const status = String(row[2] || '').trim();

    if (!taskId && title) {
      closeSection();
      sectionRow = sheetRow;
      sectionHasMatch = false;
      return;
    }
    if (!taskId) {
      hiddenRows.push(sheetRow);
      return;
    }

    const matches = selected.indexOf(status) >= 0;
    if (matches) sectionHasMatch = true;
    else hiddenRows.push(sheetRow);
  });
  closeSection();
  setChecklistHiddenRows_(sheet, hiddenRows);
}

function setChecklistHiddenRows_(sheet, rows) {
  if (!rows.length) return;
  const ordered = rows.slice().sort(function (a, b) { return a - b; });
  let start = ordered[0];
  let previous = ordered[0];

  for (let index = 1; index <= ordered.length; index++) {
    const current = ordered[index];
    if (index < ordered.length && current === previous + 1) {
      previous = current;
      continue;
    }
    sheet.hideRows(start, previous - start + 1);
    start = current;
    previous = current;
  }
}

function ensureConfigurationSheet_() {
  const spreadsheet = runtimeSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(RUNTIME.configurationSheet);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(RUNTIME.configurationSheet);
    sheet.setHiddenGridlines(true);
    sheet.setFrozenRows(3);
    sheet.setColumnWidth(1, 320);
    sheet.setColumnWidth(2, 140);
    sheet.setColumnWidth(3, 420);
    sheet.setTabColor('#667085');
    sheet.getRange('A1:C1').merge().setValue(RUNTIME.configurationSheet)
      .setBackground('#29375f').setFontColor('#ffffff').setFontSize(20).setFontWeight('bold');
    sheet.getRange('A3:C3').setValues([['Parameter', 'Value', 'Format / purpose']])
      .setBackground('#356853').setFontColor('#ffffff').setFontWeight('bold');
  }
  if (sheet.getRange('A1').getNote() !== CONFIGURATION_UI.version) {
    renderConfigurationSheet_(sheet, getRuntimeConfiguration());
  }
  return sheet;
}

function renderConfigurationSheet_(sheet, config) {
  sheet.getRange('A1:C1').breakApart().merge().setValue(RUNTIME.configurationSheet)
    .setBackground('#29375f').setFontColor('#ffffff').setFontSize(20).setFontWeight('bold');
  sheet.getRange('A3:C3').setValues([['Parameter', 'Value', 'Format / purpose']])
    .setBackground('#356853').setFontColor('#ffffff').setFontWeight('bold');
  sheet.getRange('A4:C50').clear();
  configurationCatalogSections_().forEach(function (section) {
    sheet.getRange(section.headerRow, 1, 1, 3)
      .setValues([[section.label, 'Enabled', 'System code']])
      .setBackground('#e9edf5')
      .setFontColor('#29375f')
      .setFontWeight('bold');
    sheet.getRange(section.firstRow, 1, section.catalog.length, 3)
      .setValues(section.catalog.map(function (item) { return [item.name, false, item.code]; }));
    sheet.getRange(section.firstRow, 2, section.catalog.length, 1).insertCheckboxes();
    sheet.getRange(section.firstRow, 1, section.catalog.length, 1).setFontWeight('bold');
    sheet.getRange(section.firstRow, 3, section.catalog.length, 1)
      .setFontColor('#667085')
      .setNumberFormat('@');
  });

  sheet.getRange('A37:C45').setValues([
    ['Source: manual', false, 'Manual creation; no additional tasks are generated'],
    ['Source: CSV', false, 'Enables the existing import tasks'],
    ['Source: supplier feed', false, 'Enables import and scheduled-feed tasks'],
    ['Shipping: flat rate', false, 'Enables the existing flat-rate setup task'],
    ['Shipping: supplier rate', false, 'Enables the existing supplier-rate tasks'],
    ['Shipping: free shipping', false, 'Enables rule verification and a free-shipping E2E scenario'],
    ['Shipping: pickup', false, 'Counts as a shipping method; no separate tasks are generated'],
    ['Multiple sources overlap', false, 'Available only when two or three sources are selected'],
    ['MMY / fitment applies', false, 'Controls the existing fitment tasks and Section 8']
  ]);
  sheet.getRange('B37:B45').insertCheckboxes();
  sheet.getRange('A37:A45').setFontWeight('bold');
  sheet.getRange('A4:C45').setVerticalAlignment('top');
  sheet.getRange('A1').setNote(CONFIGURATION_UI.version);
  writeConfigurationValues_(sheet, config);
}

function readConfigurationSheet_() {
  const sheet = ensureConfigurationSheet_();
  const selected = {};
  configurationCatalogSections_().forEach(function (section) {
    selected[section.key] = readCatalogSelection_(sheet, section);
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
  return {
    integrations: selected.integrations,
    payment_gateways: selected.payment_gateways,
    carriers: selected.carriers,
    tax_services: selected.tax_services,
    sourceTypes: sourceTypes,
    shippingMethods: shippingMethods,
    sourceOverlap: values[7][0] === true,
    fitment: values[8][0] === true
  };
}

function writeConfigurationValues_(sheet, config) {
  configurationCatalogSections_().forEach(function (section) {
    writeCatalogSelection_(sheet, section, config[section.key] || []);
  });
  const sources = config.sourceTypes || [];
  const shipping = config.shippingMethods || [];
  sheet.getRange('B37:B45').setValues([
    [sources.indexOf('manual') >= 0],
    [sources.indexOf('csv') >= 0],
    [sources.indexOf('supplier_feed') >= 0],
    [shipping.indexOf('flat_rate') >= 0],
    [shipping.indexOf('supplier_rate') >= 0],
    [shipping.indexOf('free_shipping') >= 0],
    [shipping.indexOf('pickup') >= 0],
    [Boolean(config.sourceOverlap)],
    [Boolean(config.fitment)]
  ]);
}

function configurationCatalogSections_() {
  return [
    {key: 'integrations', label: 'Automotive integrations', catalog: AUTOMOTIVE_INTEGRATION_CATALOG, headerRow: CONFIGURATION_UI.integrationHeaderRow, firstRow: CONFIGURATION_UI.integrationFirstRow},
    {key: 'payment_gateways', label: 'Payment gateways', catalog: PAYMENT_GATEWAY_CATALOG, headerRow: CONFIGURATION_UI.paymentHeaderRow, firstRow: CONFIGURATION_UI.paymentFirstRow},
    {key: 'carriers', label: 'Carriers', catalog: CARRIER_CATALOG, headerRow: CONFIGURATION_UI.carrierHeaderRow, firstRow: CONFIGURATION_UI.carrierFirstRow},
    {key: 'tax_services', label: 'Tax services', catalog: TAX_SERVICE_CATALOG, headerRow: CONFIGURATION_UI.taxHeaderRow, firstRow: CONFIGURATION_UI.taxFirstRow}
  ];
}

function readCatalogSelection_(sheet, section) {
  const flags = sheet.getRange(section.firstRow, 2, section.catalog.length, 1).getValues();
  return section.catalog.filter(function (item, index) {
    return flags[index][0] === true;
  }).map(function (item) {
    return {code: item.code, name: item.name};
  });
}

function writeCatalogSelection_(sheet, section, selectedItems) {
  const selected = {};
  selectedItems.forEach(function (item) { selected[item.code] = true; });
  sheet.getRange(section.firstRow, 1, section.catalog.length, 1)
    .setValues(section.catalog.map(function (item) { return [item.name]; }));
  sheet.getRange(section.firstRow, 2, section.catalog.length, 1)
    .setValues(section.catalog.map(function (item) { return [Boolean(selected[item.code])]; }));
  sheet.getRange(section.firstRow, 3, section.catalog.length, 1)
    .setValues(section.catalog.map(function (item) { return [item.code]; }));
}

function writeConfigurationSheet_(config) {
  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.configurationSheet);
  if (!sheet) return;
  if (sheet.getRange('A1').getNote() !== CONFIGURATION_UI.version) {
    renderConfigurationSheet_(sheet, config);
    return;
  }
  writeConfigurationValues_(sheet, config);
}

function protectPoolSheet_() {
  const spreadsheet = runtimeSpreadsheet_();
  const sheet = getPoolSheet_();
  const description = 'TECHNICAL_TASK_POOL_DO_NOT_EDIT';
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  let protection = protections.filter(function (item) { return item.getDescription() === description; })[0];
  if (!protection) protection = sheet.protect().setDescription(description);

  // Warning-only protection keeps checklist writes available to every operator.
  // The hidden tab prevents accidental direct edits without breaking the runtime.
  protection.setWarningOnly(true);
  renderEnglishPoolHeader_(sheet);
  sheet.setTabColor('#98a2b3');
  sheet.getRange('A1').setNote('Technical sheet. Use CHECKLIST for routine work.');

  if (!sheet.isSheetHidden()) {
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(spreadsheet.getNumSheets());
    const checklist = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
    if (checklist) spreadsheet.setActiveSheet(checklist);
    sheet.hideSheet();
  }
}

function renderEnglishPoolHeader_(sheet) {
  sheet.getRange('A1').setValue(RUNTIME.poolSheet);
  sheet.getRange('A3').setValue('READY');
  sheet.getRange('A4').setValue('WAITING');
  sheet.getRange('A6:J6').setValues([[
    'Task ID', 'Task', 'Parent ID', 'Dependencies', 'Applicable',
    'DONE', 'Comment', 'Effective applicability', 'Status', 'Waiting for'
  ]]);
}

function getRuntimeState(language) {
  try {
    const lang = 'en';
    recalculateRuntime();
    const state = readOperationalState_();
    const translations = readTranslations_();
    const tasks = state.tasks.map(function (task) {
      const translated = translations[task.id] || {};
      return {
        id: task.id,
        title: translated.en || task.title,
        applicable: task.localApplicable,
        done: task.done,
        comment: task.comment,
        status: task.status,
        waitingFor: task.waitingFor,
        systemControlled: Boolean(task.systemApplicable),
        section: task.section
      };
    });
    return {
      configured: isConfigured_(),
      language: lang,
      counts: countStatuses_(tasks),
      tasks: tasks,
      config: getRuntimeConfiguration(),
      validation: validateRuntimeModel()
    };
  } catch (error) {
    throw new Error('getRuntimeState failed: ' + formatRuntimeError_(error));
  }
}

function updateTaskFromSidebar(taskId, patch) {
  const sheet = getPoolSheet_();
  const row = findTaskRow_(sheet, taskId);
  if (!row) throw new Error('Unknown Task ID: ' + taskId);
  patch = patch || {};

  if (Object.prototype.hasOwnProperty.call(patch, 'applicable')) {
    const config = getRuntimeConfiguration();
    const modelTask = instantiateModel_(config).filter(function (task) { return task.id === taskId; })[0];
    if (modelTask && modelTask.systemApplicable) {
      throw new Error(taskId + ' applicability is controlled by Configuration.');
    }
    const value = patch.applicable === RUNTIME.no ? RUNTIME.no : RUNTIME.yes;
    sheet.getRange(row, RUNTIME.columns.applicable).setValue(value);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'comment')) {
    sheet.getRange(row, RUNTIME.columns.comment).setValue(String(patch.comment || ''));
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'done')) {
    if (patch.done) {
      recalculateRuntime();
      const check = canCompleteTask_(taskId);
      if (!check.allowed) throw new Error(check.reason);
    }
    sheet.getRange(row, RUNTIME.columns.done).setValue(Boolean(patch.done));
  }
  recalculateRuntime();
  return getRuntimeState(patch.language || 'en');
}

function getRuntimeConfiguration() {
  const sheet = getTranslationsSheet_();
  const stored = sheet.getRange(RUNTIME.configKeyCell + ':' + RUNTIME.configValueCell).getValues()[0];
  const key = String(stored[0] || '');
  const raw = key === RUNTIME.configKey ? String(stored[1] || '') : '';
  if (!raw) return defaultConfiguration_();
  try {
    return normalizeConfiguration_(JSON.parse(raw));
  } catch (error) {
    throw new Error('Stored runtime configuration is invalid: ' + error.message);
  }
}

function saveRuntimeConfiguration(config) {
  const normalized = normalizeConfiguration_(config || {});
  validateConfiguration_(normalized);
  const lock = runtimeLock_();
  lock.waitLock(30000);
  try {
    const sheet = getTranslationsSheet_();
    sheet.getRange(RUNTIME.configKeyCell).setValue(RUNTIME.configKey);
    sheet.getRange(RUNTIME.configValueCell).setValue(JSON.stringify(normalized));
    invalidateRuntimeIndexes_();
    rebuildOperationalPool_(normalized);
  } finally {
    lock.releaseLock();
  }
  recalculateRuntime();
  return getRuntimeState('en');
}

function recalculateRuntime(lockAlreadyHeld) {
  if (!isConfigured_()) return;
  const lock = runtimeLock_();
  const ownsLock = !lockAlreadyHeld;
  if (ownsLock && !lock.tryLock(30000)) throw new Error('Runtime is busy. Try again.');
  try {
    const sheet = getPoolSheet_();
    const state = readOperationalState_();
    if (!state.tasks.length) return;
    const config = getRuntimeConfiguration();
    let systemApplicabilityChanged = false;
    state.tasks.forEach(function (task) {
      const configuredApplicable = configuredLocalApplicability_(task, config);
      if (!configuredApplicable) return;
      if (task.localApplicable !== configuredApplicable) {
        sheet.getRange(task.row, RUNTIME.columns.applicable).setValue(configuredApplicable);
        task.localApplicable = configuredApplicable;
        systemApplicabilityChanged = true;
      }
      if (configuredApplicable === RUNTIME.no && task.done) {
        sheet.getRange(task.row, RUNTIME.columns.done).setValue(false);
        task.done = false;
        systemApplicabilityChanged = true;
      }
    });
    if (systemApplicabilityChanged) SpreadsheetApp.flush();
    const byId = indexById_(state.tasks);
    const activeMemo = {};

    function isActive(task, trail) {
      if (Object.prototype.hasOwnProperty.call(activeMemo, task.id)) return activeMemo[task.id];
      if (task.configurationApplicable === false) return (activeMemo[task.id] = false);
      if (task.localApplicable === RUNTIME.no) return (activeMemo[task.id] = false);
      if (!task.parent) return (activeMemo[task.id] = true);
      if ((trail || []).indexOf(task.id) >= 0) return (activeMemo[task.id] = false);
      const parent = byId[task.parent];
      return (activeMemo[task.id] = Boolean(parent && isActive(parent, (trail || []).concat(task.id))));
    }

    state.tasks.forEach(function (task) { task.active = isActive(task, []); });
    const capability = evaluateCapabilities_(state.tasks, config);

    const invalidDoneRows = [];
    state.tasks.forEach(function (task) {
      const readiness = evaluateTaskReadiness_(task, byId, capability, config);
      if (task.done && (!task.active || readiness.level !== 'PASS')) invalidDoneRows.push(task.row);
    });
    invalidDoneRows.forEach(function (row) { sheet.getRange(row, RUNTIME.columns.done).setValue(false); });
    if (invalidDoneRows.length) SpreadsheetApp.flush();

    const refreshed = invalidDoneRows.length ? readOperationalState_() : state;
    const refreshedById = indexById_(refreshed.tasks);
    const refreshedCapability = evaluateCapabilities_(refreshed.tasks, config);
    refreshed.tasks.forEach(function (task) {
      const original = state.tasks.filter(function (x) { return x.id === task.id; })[0];
      task.active = original ? original.active : task.localApplicable !== RUNTIME.no;
    });

    const output = refreshed.tasks.map(function (task) {
      const readiness = evaluateTaskReadiness_(task, refreshedById, refreshedCapability, config);
      let status;
      if (!task.active) status = RUNTIME.statuses.inactive;
      else if (task.done) status = RUNTIME.statuses.done;
      else if (readiness.level === 'BLOCKED') status = RUNTIME.statuses.blocked;
      else if (readiness.level === 'PASS') status = RUNTIME.statuses.ready;
      else status = RUNTIME.statuses.waiting;
      return [task.active ? RUNTIME.yes : RUNTIME.no, status, status === RUNTIME.statuses.waiting || status === RUNTIME.statuses.blocked ? readiness.reasons.join(', ') : ''];
    });

    const ranges = contiguousTaskRanges_(refreshed.tasks);
    ranges.forEach(function (block) {
      const values = output.slice(block.startIndex, block.endIndex);
      sheet.getRange(block.startRow, RUNTIME.columns.effectiveApplicable, values.length, 3).setValues(values);
    });
    updateCounters_(sheet, output);
  } finally {
    if (ownsLock) lock.releaseLock();
  }
}

function canCompleteTask_(taskId) {
  const state = readOperationalState_();
  const byId = indexById_(state.tasks);
  const task = byId[taskId];
  if (!task) return {allowed: false, reason: 'Unknown Task ID: ' + taskId};
  if (!taskIsEffectivelyApplicable_(task)) return {allowed: false, reason: taskId + ' is INACTIVE.'};
  const capability = evaluateCapabilities_(state.tasks, getRuntimeConfiguration());
  const readiness = evaluateTaskReadiness_(task, byId, capability, getRuntimeConfiguration());
  return readiness.level === 'PASS'
    ? {allowed: true, reason: ''}
    : {allowed: false, reason: taskId + ' is not READY. Waiting for: ' + readiness.reasons.join(', ')};
}

function evaluateTaskReadiness_(task, byId, capability, config) {
  if (!taskIsEffectivelyApplicable_(task)) return {level: 'EXCLUDED', reasons: []};
  const missing = [];
  const waiting = [];
  task.dependencies.forEach(function (id) {
    const dependency = byId[id];
    if (!dependency) missing.push(id);
    else if (!taskIsEffectivelyApplicable_(dependency)) return;
    else if (!dependency.done) waiting.push(id);
  });
  const required = requiredCapabilitiesForTask_(task, capability, config);
  required.forEach(function (item) {
    if (item.state === 'BLOCKED') missing.push(item.name);
    else if (item.state !== 'PASS') waiting.push(item.name);
  });
  if (missing.length) return {level: 'BLOCKED', reasons: unique_(missing)};
  if (waiting.length) return {level: 'WAITING', reasons: unique_(waiting)};
  return {level: 'PASS', reasons: []};
}

function evaluateCapabilities_(tasks, config) {
  const active = tasks.filter(taskIsEffectivelyApplicable_);
  const byGate = groupBy_(active, function (task) { return task.gate || ''; });
  const allDone = function (list) { return list.length > 0 && list.every(function (task) { return task.done; }); };
  const gateDone = function (name) { return allDone(byGate[name] || []); };
  const perInstance = function (gate, collection) {
    const relevant = (byGate[gate] || []).filter(function (task) { return task.collection === collection; });
    const grouped = groupBy_(relevant, function (task) { return task.instanceCode || ''; });
    const out = {};
    Object.keys(grouped).forEach(function (key) { out[key] = allDone(grouped[key]); });
    return out;
  };

  const serviceAccess = {};
  ['integrations', 'payment_gateways', 'carriers', 'tax_services'].forEach(function (collection) {
    const values = perInstance('G_SERVICE_ACCESS_INSTANCE', collection);
    Object.keys(values).forEach(function (code) { serviceAccess[collection + ':' + code] = values[code]; });
  });
  const integrationReady = perInstance('G_INTEGRATION_READY', 'integrations');
  const productQa = perInstance('G_PRODUCT_QA', 'qa_products');
  const paymentLaunchVerified = perInstance('G_PAYMENT_METHOD', 'payment_gateways');
  const carrierVerified = perInstance('G_SHIPPING_METHOD', 'carriers');
  const scenarioVerified = perInstance('G_E2E_SCENARIO', 'e2e_scenarios');

  const declaredPayments = config.payment_gateways.map(function (x) { return x.code; });
  const declaredCarriers = config.carriers.map(function (x) { return x.code; });
  const paymentValues = declaredPayments.map(function (code) { return taskDone_(tasks, '10-' + code + '-04'); });
  const paymentLaunchValues = declaredPayments.map(function (code) { return Boolean(paymentLaunchVerified[code]); });
  const methodResults = {};
  declaredCarriers.forEach(function (code) { methodResults['carrier:' + code] = Boolean(carrierVerified[code]); });
  methodResults.flat_rate = taskDone_(tasks, '11-02');
  methodResults.supplier_rate = taskDone_(tasks, '11-03');
  methodResults.free_shipping = taskDone_(tasks, '11-04');
  methodResults.pickup = taskDone_(tasks, '11-11') && taskDone_(tasks, '11-12');
  const shippingValues = config.shippingMethods.map(function (name) { return Boolean(methodResults[name]); });

  const catalogQaStatic = gateDone('G_CATALOG_QA');
  const productSamples = qaProductSamples_();
  const e2eScenarios = buildE2eScenarios_(config);
  const productValues = productSamples.map(function (x) { return Boolean(productQa[x.code]); });
  const scenarioValues = e2eScenarios.map(function (x) { return Boolean(scenarioVerified[x.code]); });
  const customerApproved = gateDone('G_CUSTOMER_ACCEPTANCE');
  const paymentAvailable = paymentValues.length > 0 && paymentValues.some(Boolean);
  const paymentLaunch = paymentLaunchValues.length > 0 && paymentLaunchValues.every(Boolean);
  const shippingAvailable = shippingValues.length > 0 && shippingValues.some(Boolean);
  const shippingLaunch = shippingValues.length > 0 && shippingValues.every(Boolean) && taskDone_(tasks, '11-11') && taskDone_(tasks, '11-12');
  const taxReady = gateDone('G_STORE_FOUNDATION');
  const checkoutReady = paymentAvailable && shippingAvailable && taxReady && taskDone_(tasks, '12-29');
  const storefrontReady = gateDone('G_STOREFRONT');
  const orderComplete = scenarioValues.length > 0 && scenarioValues.every(Boolean) && gateDone('G_E2E_ALL');
  const launchApproved = gateDone('G_LAUNCH') && customerApproved && paymentLaunch && shippingLaunch && orderComplete;

  return {
    projectProfile: gateDone('G_PROJECT_PROFILE'),
    serviceAccess: serviceAccess,
    catalogStructure: gateDone('G_CATALOG_STRUCTURE'),
    integrationReady: integrationReady,
    sourceRouting: config.sourceOverlap ? gateDone('G_SOURCE_ROUTING') : true,
    importStable: gateDone('G_IMPORT_STABLE'),
    catalogQuality: catalogQaStatic && (productValues.length > 0 && productValues.every(Boolean)),
    storeFoundation: gateDone('G_STORE_FOUNDATION'),
    taxReady: taxReady,
    paymentAvailable: paymentAvailable,
    paymentLaunch: paymentLaunch,
    shippingAvailable: shippingAvailable,
    shippingLaunch: shippingLaunch,
    checkoutReady: checkoutReady,
    storefrontReady: storefrontReady,
    orderComplete: orderComplete,
    customerApproved: customerApproved,
    launchApproved: launchApproved,
    onboardingClosed: launchApproved && gateDone('G_ONBOARDING_CLOSE'),
    blocked: {
      payment: declaredPayments.length === 0,
      shipping: config.shippingMethods.length === 0,
      productSample: productSamples.length === 0,
      scenarios: e2eScenarios.length === 0
    }
  };
}

function requiredCapabilitiesForTask_(task, cap, config) {
  const pass = function (name, value, blocked) { return {name: name, state: value ? 'PASS' : (blocked ? 'BLOCKED' : 'WAITING')}; };
  const list = [];
  switch (task.contour) {
    case 'SERVICE_ACCESS':
    case 'CATALOG_STRUCTURE':
      list.push(pass('PROJECT_PROFILE_DEFINED', cap.projectProfile));
      break;
    case 'INTEGRATION_CONFIGURATION':
      list.push(pass('CATALOG_STRUCTURE_APPROVED', cap.catalogStructure));
      list.push(pass('SERVICE_ACCESS_VERIFIED(' + task.instanceCode + ')', cap.serviceAccess['integrations:' + task.instanceCode]));
      break;
    case 'SOURCE_COORDINATION':
      list.push(pass('PROJECT_PROFILE_DEFINED', cap.projectProfile));
      config.integrations.forEach(function (x) { list.push(pass('INTEGRATION_READY(' + x.code + ')', cap.integrationReady[x.code])); });
      break;
    case 'IMPORT_RELIABILITY':
      list.push(pass('CATALOG_STRUCTURE_APPROVED', cap.catalogStructure));
      config.integrations.forEach(function (x) { list.push(pass('INTEGRATION_READY(' + x.code + ')', cap.integrationReady[x.code])); });
      if (config.sourceOverlap) list.push(pass('SOURCE_ROUTING_VERIFIED', cap.sourceRouting));
      break;
    case 'CATALOG_QUALITY':
      list.push(pass('CATALOG_IMPORT_STABLE', cap.importStable));
      break;
    case 'STORE_FOUNDATION':
      list.push(pass('PROJECT_PROFILE_DEFINED', cap.projectProfile));
      break;
    case 'PAYMENT_ASSURANCE':
      list.push(pass('STORE_FOUNDATION_READY', cap.storeFoundation));
      if (task.collection === 'payment_gateways') list.push(pass('SERVICE_ACCESS_VERIFIED(' + task.instanceCode + ')', cap.serviceAccess['payment_gateways:' + task.instanceCode]));
      break;
    case 'SHIPPING_ASSURANCE':
      list.push(pass('STORE_FOUNDATION_READY', cap.storeFoundation));
      if (task.collection === 'carriers') list.push(pass('SERVICE_ACCESS_VERIFIED(' + task.instanceCode + ')', cap.serviceAccess['carriers:' + task.instanceCode]));
      break;
    case 'STOREFRONT_ASSURANCE':
      list.push(pass('CATALOG_QUALITY_COMPLETE', cap.catalogQuality, cap.blocked.productSample));
      list.push(pass('STORE_FOUNDATION_READY', cap.storeFoundation));
      list.push(pass('PAYMENT_AVAILABLE', cap.paymentAvailable, cap.blocked.payment));
      list.push(pass('SHIPPING_AVAILABLE', cap.shippingAvailable, cap.blocked.shipping));
      list.push(pass('TAX_READY', cap.taxReady));
      break;
    case 'ORDER_ASSURANCE':
      list.push(pass('CHECKOUT_READY', cap.checkoutReady, cap.blocked.payment || cap.blocked.shipping));
      list.push(pass('STOREFRONT_READY', cap.storefrontReady));
      break;
    case 'CUSTOMER_ACCEPTANCE':
      list.push(pass('STOREFRONT_READY', cap.storefrontReady));
      list.push(pass('ORDER_ASSURANCE_COMPLETE', cap.orderComplete, cap.blocked.scenarios));
      break;
    case 'RELEASE_LIFECYCLE':
      if (String(task.section).indexOf('16.') === 0) list.push(pass('LAUNCH_APPROVED', cap.launchApproved));
      else {
        list.push(pass('CUSTOMER_APPROVED', cap.customerApproved));
        list.push(pass('PAYMENT_LAUNCH_READY', cap.paymentLaunch, cap.blocked.payment));
        list.push(pass('SHIPPING_LAUNCH_READY', cap.shippingLaunch, cap.blocked.shipping));
        list.push(pass('ORDER_ASSURANCE_COMPLETE', cap.orderComplete, cap.blocked.scenarios));
      }
      break;
  }
  return list;
}

function rebuildOperationalPool_(config) {
  invalidateRuntimeIndexes_();
  const sheet = getPoolSheet_();
  const previous = readOperationalState_();
  const previousById = indexById_(previous.tasks);
  const tasks = mergeTaskStateForRebuild_(instantiateModel_(config), previousById);
  const sections = [];
  tasks.forEach(function (task) { if (sections.indexOf(task.section) < 0) sections.push(task.section); });
  const output = [];
  sections.forEach(function (section) {
    output.push({sectionHeader: true, section: section});
    tasks.filter(function (task) { return task.section === section; }).forEach(function (task) {
      output.push(task);
    });
  });

  const neededLastRow = RUNTIME.headerRow + output.length;
  if (sheet.getMaxRows() < neededLastRow) sheet.insertRowsAfter(sheet.getMaxRows(), neededLastRow - sheet.getMaxRows());
  if (sheet.getLastRow() >= RUNTIME.firstDataRow) {
    sheet.getRange(RUNTIME.firstDataRow, 1, sheet.getLastRow() - RUNTIME.firstDataRow + 1, 10).breakApart().clearContent().clearDataValidations();
  }

  const taskFormat = sheet.getRange(RUNTIME.firstTaskRow, 1, 1, 10);
  const sectionFormat = sheet.getRange(RUNTIME.firstDataRow, 1, 1, 10);
  const values = output.map(function (item) {
    return item.sectionHeader
      ? ['', item.section, '', '', '', '', '', '', '', '']
      : [item.id, item.title, item.parent || '', item.dependencies.join(', '), item.localApplicable,
        Boolean(item.done), item.commentValue || '', '', '', ''];
  });
  const body = sheet.getRange(RUNTIME.firstDataRow, 1, output.length, 10);
  const applicableRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([RUNTIME.yes, RUNTIME.no], true)
    .setAllowInvalid(false)
    .build();
  const sectionRows = [];
  const taskBlocks = [];
  let row = RUNTIME.firstDataRow;
  let taskBlockStart = 0;
  const flushTaskBlock = function (endRow) {
    if (!taskBlockStart) return;
    taskBlocks.push({row: taskBlockStart, count: endRow - taskBlockStart});
    taskBlockStart = 0;
  };
  output.forEach(function (item) {
    if (item.sectionHeader) {
      flushTaskBlock(row);
      sectionRows.push(row);
    } else if (!taskBlockStart) {
      taskBlockStart = row;
    }
    row++;
  });
  flushTaskBlock(row);
  taskBlocks.forEach(function (block) {
    taskFormat.copyTo(sheet.getRange(block.row, 1, block.count, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  });
  sectionRows.forEach(function (sectionRow) {
    sectionFormat.copyTo(sheet.getRange(sectionRow, 1, 1, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  });
  sheet.getRange(RUNTIME.firstDataRow, 1, output.length, 4).setNumberFormat('@');
  sheet.getRange(RUNTIME.firstDataRow, RUNTIME.columns.waitingFor, output.length, 1).setNumberFormat('@');
  body.setValues(values);
  sectionRows.forEach(function (sectionRow) { sheet.getRange(sectionRow, 2, 1, 9).merge(); });
  taskBlocks.forEach(function (block) {
    sheet.getRange(block.row, RUNTIME.columns.applicable, block.count, 1).setDataValidation(applicableRule);
    sheet.getRange(block.row, RUNTIME.columns.done, block.count, 1).insertCheckboxes();
  });
  refreshTranslations_(tasks);
  sheet.getRange(RUNTIME.firstDataRow, 1, output.length, 10).setVerticalAlignment('middle');
}

function mergeTaskStateForRebuild_(tasks, previousById) {
  tasks.forEach(function (task) {
    const old = previousById[task.id];
    if (task.systemApplicable) {
      task.localApplicable = task.defaultApplicable;
      task.done = task.localApplicable === RUNTIME.yes && old ? old.done : false;
    } else {
      task.localApplicable = old ? old.localApplicable : task.defaultApplicable;
      task.done = old ? old.done : false;
    }
    task.commentValue = old ? old.comment : task.comment;
    if (task.id === '10-92' && /[\u0400-\u04FF]/.test(task.commentValue)) {
      task.commentValue = task.comment;
    }
  });
  return tasks;
}

function instantiateModel_(config) {
  const collections = {
    integrations: config.integrations,
    payment_gateways: config.payment_gateways,
    carriers: config.carriers,
    tax_services: config.tax_services,
    qa_products: qaProductSamples_(),
    e2e_scenarios: buildE2eScenarios_(config)
  };
  const turn14Configured = hasTurn14Integration_(config);
  const byTemplate = {};
  RUNTIME_MODEL.tasks.forEach(function (task) { byTemplate[task.id] = task; });
  const instances = [];
  RUNTIME_MODEL.tasks.forEach(function (template) {
    if (template.scope === 'REPEAT') {
      (collections[template.collection] || []).forEach(function (item) { instances.push(createInstance_(template, item)); });
    } else instances.push(createInstance_(template, null));
  });

  function resolveReference(ref, owner) {
    const target = byTemplate[ref];
    if (!target || target.scope !== 'REPEAT') return [ref];
    if (owner.collection && owner.collection === target.collection) return [instantiateId_(ref, owner.instanceCode)];
    if (owner.templateId === '10-92' && target.collection === 'integrations') {
      return turn14Configured ? [instantiateId_(ref, 'T14')] : [];
    }
    return (collections[target.collection] || []).map(function (item) { return instantiateId_(ref, item.code); });
  }

  instances.forEach(function (instance) {
    const configuredApplicable = configuredLocalApplicability_(instance, config);
    if (configuredApplicable) {
      instance.defaultApplicable = configuredApplicable;
      instance.systemApplicable = true;
    }
    instance.parent = instance.parentTemplate ? resolveReference(instance.parentTemplate, instance)[0] || '' : '';
    instance.dependencies = unique_([].concat.apply([], instance.dependencyTemplates.map(function (ref) { return resolveReference(ref, instance); })));
    instance.configurationApplicable = configuredTaskApplicable_(instance, config);
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
    instanceCode: code,
    contour: template.contour || '',
    gate: template.gate || ''
  };
}

function validateRuntimeModel() {
  const state = readOperationalState_();
  const byId = indexById_(state.tasks);
  const errors = [];
  const seen = {};
  state.tasks.forEach(function (task) {
    if (seen[task.id]) errors.push('Duplicate Task ID: ' + task.id);
    seen[task.id] = true;
    if (task.parent && !byId[task.parent]) errors.push(task.id + ' has missing Parent ID ' + task.parent);
    task.dependencies.forEach(function (id) { if (!byId[id]) errors.push(task.id + ' has missing dependency ' + id); });
  });
  detectCycles_(state.tasks, function (task) { return task.dependencies; }).forEach(function (cycle) { errors.push('Dependency cycle: ' + cycle.join(' -> ')); });
  detectCycles_(state.tasks, function (task) { return task.parent ? [task.parent] : []; }).forEach(function (cycle) { errors.push('Parent cycle: ' + cycle.join(' -> ')); });
  return {ok: errors.length === 0, errors: unique_(errors), taskCount: state.tasks.length};
}

function readOperationalState_(config) {
  const sheet = getPoolSheet_();
  const lastRow = Math.max(sheet.getLastRow(), RUNTIME.firstTaskRow);
  const range = sheet.getRange(RUNTIME.firstDataRow, 1, lastRow - RUNTIME.firstDataRow + 1, 10);
  const values = range.getValues();
  // IDs may have been interpreted as dates by older workbook versions.
  // Display values retain the intended 01-01-style identifiers, while raw
  // Date objects stringify to long timezone-dependent JavaScript strings.
  const displayValues = range.getDisplayValues();
  const model = instantiateModel_(config || getRuntimeConfiguration());
  const metadata = {};
  model.forEach(function (task) { metadata[task.id] = task; });
  let section = '';
  const tasks = [];
  values.forEach(function (row, index) {
    const displayRow = displayValues[index].map(function (value) { return value == null ? '' : String(value); });
    const sheetRow = RUNTIME.firstDataRow + index;
    if (!displayRow[0] && displayRow[1]) { section = String(displayRow[1]); return; }
    if (!displayRow[0]) return;
    const taskId = String(displayRow[0]).trim();
    const meta = metadata[taskId] || {};
    tasks.push({
      row: sheetRow,
      id: taskId,
      title: String(displayRow[1] || ''),
      parent: String(displayRow[2] || '').trim(),
      dependencies: splitIds_(displayRow[3]),
      localApplicable: normalizeApplicability_(displayRow[4]),
      done: row[5] === true,
      comment: String(displayRow[6] || ''),
      effectiveApplicable: String(displayRow[7] || ''),
      status: String(displayRow[8] || ''),
      waitingFor: String(displayRow[9] || ''),
      section: section || meta.section || '',
      contour: meta.contour || '',
      gate: meta.gate || '',
      collection: meta.collection || '',
      instanceCode: meta.instanceCode || '',
      systemApplicable: Boolean(meta.systemApplicable),
      configurationApplicable: meta.configurationApplicable !== false,
      templateId: meta.templateId || String(row[0])
    });
  });
  return {sheet: sheet, tasks: tasks};
}

function normalizeApplicability_(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === RUNTIME.no || normalized === '\u041D\u0415\u0422') return RUNTIME.no;
  return RUNTIME.yes;
}

function refreshTranslations_(tasks) {
  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.translationsSheet);
  if (!sheet) throw new Error('Missing sheet: ' + RUNTIME.translationsSheet);
  const rows = [['Task ID', 'English']].concat(tasks.map(function (task) { return [String(task.id), task.title]; }));
  sheet.getRange(1, 1, sheet.getMaxRows(), 3).clearContent();
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  sheet.getRange(1, 1, rows.length, 2).setNumberFormat('@').setValues(rows);
}

function readTranslations_() {
  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.translationsSheet);
  if (!sheet || sheet.getLastRow() < 2) return {};
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
  const map = {};
  rows.forEach(function (row) { if (row[0]) map[String(row[0])] = {en: row[1]}; });
  return map;
}

function updateCounters_(sheet, output) {
  const counts = {};
  output.forEach(function (row) { counts[row[1]] = (counts[row[1]] || 0) + 1; });
  sheet.getRange('B3').setValue(counts.READY || 0);
  sheet.getRange('D3').setValue(counts.INACTIVE || 0);
  sheet.getRange('B4').setValue((counts.WAITING || 0) + (counts.BLOCKED || 0));
  sheet.getRange('D4').setValue(counts.DONE || 0);
}

function defaultConfiguration_() {
  return {
    integrations: [], payment_gateways: [], carriers: [], tax_services: [],
    shippingMethods: [], sourceTypes: ['manual'], sourceOverlap: false, fitment: false
  };
}

function normalizeConfiguration_(input) {
  const base = defaultConfiguration_();
  const normalizeItems = function (items) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      return {code: normalizeCode_(item.code), name: String(item.name || item.code || '').trim()};
    }).filter(function (item) { return item.code && item.name; });
  };
  ['integrations', 'payment_gateways', 'carriers', 'tax_services'].forEach(function (key) {
    base[key] = normalizeItems(input[key]);
  });
  base.shippingMethods = unique_((Array.isArray(input.shippingMethods) ? input.shippingMethods : []).map(String));
  base.sourceTypes = unique_((Array.isArray(input.sourceTypes) ? input.sourceTypes : ['manual']).map(String))
    .filter(function (value) { return SOURCE_TYPE_CATALOG.indexOf(value) >= 0; });
  base.sourceOverlap = Boolean(input.sourceOverlap) && base.sourceTypes.length >= 2;
  base.fitment = Boolean(input.fitment);
  base.carriers.forEach(function (item) {
    const key = 'carrier:' + item.code;
    if (base.shippingMethods.indexOf(key) < 0) base.shippingMethods.push(key);
  });
  return base;
}

function validateConfiguration_(config) {
  const allCodes = [];
  ['integrations', 'payment_gateways', 'carriers', 'tax_services'].forEach(function (key) {
    config[key].forEach(function (item) {
      if (!/^[A-Z0-9_]{2,20}$/.test(item.code)) throw new Error('Invalid code ' + item.code + '. Use 2-20 uppercase letters, digits, or underscore.');
      allCodes.push(key + ':' + item.code);
    });
  });
  if (unique_(allCodes).length !== allCodes.length) throw new Error('Duplicate instance code in one collection.');

  configurationCatalogSections_().forEach(function (section) {
    const catalogByCode = {};
    section.catalog.forEach(function (item) { catalogByCode[item.code] = item.name; });
    config[section.key].forEach(function (item) {
      if (!catalogByCode[item.code]) throw new Error('Unsupported ' + section.label + ': ' + item.code);
      if (item.name !== catalogByCode[item.code]) throw new Error(section.label + ' name does not match catalog for ' + item.code);
    });
  });
}

function configuredTaskApplicable_(task, config) {
  const sources = config.sourceTypes || [];
  const importSelected = sources.indexOf('csv') >= 0 || sources.indexOf('supplier_feed') >= 0;
  const supplierFeedSelected = sources.indexOf('supplier_feed') >= 0;
  const configuredApplicable = configuredLocalApplicability_(task, config);

  if (task.contour === 'SOURCE_COORDINATION') {
    if (!(config.sourceOverlap && sources.length >= 2)) return false;
    if (!config.fitment && task.templateId === '05-05') return false;
    return true;
  }
  if (configuredApplicable === RUNTIME.no) return false;
  if (!config.fitment && (
    String(task.section).indexOf('8. MMY / FITMENT QA') === 0 ||
    CONFIGURATION_TASK_RULES.fitmentOptional.indexOf(task.templateId) >= 0
  )) return false;
  if (task.collection === 'integrations') return supplierFeedSelected;
  if (SOURCE_TASK_RULES.automotiveIntegration.indexOf(task.templateId) >= 0) {
    return supplierFeedSelected && (config.integrations || []).length > 0;
  }
  if (SOURCE_TASK_RULES.supplierFeed.indexOf(task.templateId) >= 0) return supplierFeedSelected;
  if (SOURCE_TASK_RULES.import.indexOf(task.templateId) >= 0) return importSelected;
  return true;
}

function configuredLocalApplicability_(task, config) {
  const templateId = task.templateId || task.id;
  const shipping = config.shippingMethods || [];
  const selected = function (method) { return shipping.indexOf(method) >= 0; };
  const yesNo = function (value) { return value ? RUNTIME.yes : RUNTIME.no; };

  if (templateId === '10-92') return yesNo(hasTurn14Integration_(config));
  if (CONFIGURATION_TASK_RULES.fitmentRequired.indexOf(templateId) >= 0) return yesNo(config.fitment);
  if (CONFIGURATION_TASK_RULES.flatRate.indexOf(templateId) >= 0) return yesNo(selected('flat_rate'));
  if (CONFIGURATION_TASK_RULES.supplierRate.indexOf(templateId) >= 0) return yesNo(selected('supplier_rate'));
  if (CONFIGURATION_TASK_RULES.freeShipping.indexOf(templateId) >= 0) return yesNo(selected('free_shipping'));
  return '';
}

function qaProductSamples_() {
  return [QA_PRODUCT_SAMPLE];
}

function buildE2eScenarios_(config) {
  const payments = config.payment_gateways || [];
  const shipping = e2eShippingOptions_(config);
  if (!payments.length || !shipping.length) return [];

  const taxes = (config.tax_services || []).length
    ? config.tax_services
    : [{code: 'STORE_TAX', name: 'Store tax configuration'}];
  const count = Math.max(payments.length, shipping.length, taxes.length);
  const scenarios = [];
  for (let index = 0; index < count; index++) {
    const payment = payments[index % payments.length];
    const method = shipping[index % shipping.length];
    const tax = taxes[index % taxes.length];
    scenarios.push({
      code: payment.code + '_' + method.code + '_' + tax.code,
      name: payment.name + ' + ' + method.name + ' + ' + tax.name
    });
  }
  return scenarios;
}

function e2eShippingOptions_(config) {
  const carrierByCode = {};
  (config.carriers || []).forEach(function (item) { carrierByCode[item.code] = item; });
  return (config.shippingMethods || []).map(function (method) {
    if (String(method).indexOf('carrier:') === 0) {
      const code = String(method).slice('carrier:'.length);
      const carrier = carrierByCode[code];
      return carrier ? {code: carrier.code, name: carrier.name} : null;
    }
    return SHIPPING_METHOD_LABELS[method] || null;
  }).filter(Boolean);
}

function getPoolSheet_() {
  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.poolSheet);
  if (!sheet) throw new Error('Missing sheet: ' + RUNTIME.poolSheet);
  return sheet;
}

function getTranslationsSheet_() {
  const sheet = runtimeSpreadsheet_().getSheetByName(RUNTIME.translationsSheet);
  if (!sheet) throw new Error('Missing sheet: ' + RUNTIME.translationsSheet);
  return sheet;
}

function findTaskRow_(sheet, taskId) {
  const firstRow = RUNTIME.firstTaskRow;
  const rowCount = Math.max(1, sheet.getLastRow() - firstRow + 1);
  const target = String(taskId || '').trim();
  const ids = sheet.getRange(firstRow, RUNTIME.columns.id, rowCount, 1).getDisplayValues();
  for (let index = 0; index < ids.length; index++) {
    if (String(ids[index][0] || '').trim() === target) return firstRow + index;
  }
  return 0;
}

function indexById_(tasks) { const out = {}; tasks.forEach(function (task) { out[task.id] = task; }); return out; }
function splitIds_(value) { return String(value || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
function unique_(values) { return values.filter(function (value, index) { return values.indexOf(value) === index; }); }
function groupBy_(values, keyFn) { const out = {}; values.forEach(function (value) { const key = keyFn(value); (out[key] || (out[key] = [])).push(value); }); return out; }
function countStatuses_(tasks) { const out = {}; tasks.forEach(function (task) { out[task.status] = (out[task.status] || 0) + 1; }); return out; }
function isConfigured_() {
  const sheet = getTranslationsSheet_();
  return String(sheet.getRange(RUNTIME.configKeyCell).getDisplayValue() || '') === RUNTIME.configKey &&
    Boolean(String(sheet.getRange(RUNTIME.configValueCell).getValue() || ''));
}
function hasTurn14Integration_(config) {
  return Boolean(config && (config.integrations || []).some(function (item) { return item.code === 'T14'; }));
}
function taskIsEffectivelyApplicable_(task) {
  if (!task || task.localApplicable === RUNTIME.no) return false;
  // During recalculation, the freshly computed boolean is authoritative.
  // Outside recalculation (for example canCompleteTask_), use the persisted
  // effective applicability instead of treating an undefined active flag as true.
  if (typeof task.active === 'boolean') return task.active;
  return task.effectiveApplicable !== RUNTIME.no;
}
function taskDone_(tasks, id) { const task = tasks.filter(function (x) { return x.id === id; })[0]; return Boolean(taskIsEffectivelyApplicable_(task) && task.done); }
function normalizeCode_(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_').replace(/^_+|_+$/g, ''); }
function formatRuntimeError_(error) {
  if (!error) return 'Unknown error';
  const message = error.message || String(error);
  const location = error.stack ? String(error.stack).split('\n').slice(0, 3).join(' | ') : '';
  return location && location.indexOf(message) < 0 ? message + ' | ' + location : (location || message);
}
function escapeHtmlAttribute_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function replacePlaceholder_(text, label) { return String(text || '').replace(/\{[^}]+\}/g, label); }
function instantiateId_(templateId, code) { const parts = String(templateId).split('-'); if (parts.length > 2) parts[1] = code; return parts.join('-'); }

function contiguousTaskRanges_(tasks) {
  if (!tasks.length) return [];
  const blocks = [];
  let startIndex = 0;
  for (let i = 1; i <= tasks.length; i++) {
    if (i === tasks.length || tasks[i].row !== tasks[i - 1].row + 1) {
      blocks.push({startIndex: startIndex, endIndex: i, startRow: tasks[startIndex].row});
      startIndex = i;
    }
  }
  return blocks;
}

function detectCycles_(tasks, edgesFn) {
  const byId = indexById_(tasks), color = {}, stack = [], cycles = [];
  function visit(id) {
    color[id] = 1; stack.push(id);
    (edgesFn(byId[id]) || []).forEach(function (next) {
      if (!byId[next]) return;
      if (color[next] === 1) cycles.push(stack.slice(stack.indexOf(next)).concat(next));
      else if (!color[next]) visit(next);
    });
    stack.pop(); color[id] = 2;
  }
  tasks.forEach(function (task) { if (!color[task.id]) visit(task.id); });
  return cycles;
}
