const RUNTIME = Object.freeze({
  poolSheet: 'ПУЛ ТАСКОВ',
  translationsSheet: '_TRANSLATIONS',
  headerRow: 6,
  firstDataRow: 7,
  firstTaskRow: 8,
  columns: Object.freeze({id: 1, task: 2, parent: 3, dependencies: 4, applicable: 5, done: 6, comment: 7, effectiveApplicable: 8, status: 9, waitingFor: 10}),
  configKey: 'AUTOMOTIVE_RUNTIME_CONFIG_V1',
  configKeyCell: 'D1',
  configValueCell: 'E1',
  yes: 'ДА',
  no: 'НЕТ',
  statuses: Object.freeze({inactive: 'INACTIVE', done: 'DONE', blocked: 'BLOCKED', ready: 'READY', waiting: 'WAITING'})
});

const SECTION_RU = Object.freeze({
  '1. SCOPE AND REQUIREMENTS CONFIRMED': '1. ОБЪЁМ И ТРЕБОВАНИЯ ПОДТВЕРЖДЕНЫ',
  '2. ACCESS AND ACCOUNTS': '2. ДОСТУПЫ И УЧЁТНЫЕ ЗАПИСИ',
  '3. CATALOG ARCHITECTURE': '3. АРХИТЕКТУРА КАТАЛОГА',
  '4. AUTOMOTIVE INTEGRATION CONFIGURATION': '4. НАСТРОЙКА АВТОМОБИЛЬНЫХ ИНТЕГРАЦИЙ',
  '5. MULTIPLE-SOURCE CONFLICT RULES': '5. ПРАВИЛА КОНФЛИКТОВ ИСТОЧНИКОВ',
  '6. CATALOG IMPORT COMPLETED': '6. ИМПОРТ КАТАЛОГА ЗАВЕРШЁН',
  '7. CATALOG QA SAMPLING': '7. ВЫБОРОЧНАЯ ПРОВЕРКА КАТАЛОГА',
  '8. MMY / FITMENT QA': '8. ПРОВЕРКА MMY / FITMENT',
  '9. STORE FOUNDATION': '9. БАЗОВАЯ НАСТРОЙКА МАГАЗИНА',
  '10. PAYMENTS': '10. ПЛАТЕЖИ',
  '11. SHIPPING': '11. ДОСТАВКА',
  '12. STOREFRONT, BRANDING & SEO QA': '12. STOREFRONT, БРЕНДИНГ И SEO',
  '13. END-TO-END ORDER QA': '13. СКВОЗНАЯ ПРОВЕРКА ЗАКАЗОВ',
  '14. CUSTOMER REVIEW & APPROVAL': '14. ПРОВЕРКА И СОГЛАСОВАНИЕ КЛИЕНТОМ',
  '15. LAUNCH GATE': '15. ДОПУСК К ЗАПУСКУ',
  '16. POST-LAUNCH STABILIZATION': '16. СТАБИЛИЗАЦИЯ ПОСЛЕ ЗАПУСКА'
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Automotive Runtime')
    .addItem('Authorize and diagnose', 'authorizeAndDiagnoseRuntime')
    .addItem('Open runtime', 'showRuntimeSidebar')
    .addItem('Recalculate', 'recalculateRuntime')
    .addItem('Validate model', 'showRuntimeValidation')
    .addToUi();
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
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
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
    const lock = LockService.getDocumentLock();
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

function showRuntimeValidation() {
  const result = validateRuntimeModel();
  const text = result.ok ? 'Model is valid.' : result.errors.join('\n');
  SpreadsheetApp.getUi().alert(text);
  return result;
}

function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
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
      SpreadsheetApp.getActive().toast(check.reason, 'DONE rejected', 6);
    }
  }

  if (column === RUNTIME.columns.parent || column === RUNTIME.columns.dependencies) {
    const validation = validateRuntimeModel();
    if (!validation.ok) {
      if (typeof e.oldValue !== 'undefined') e.range.setValue(e.oldValue);
      else e.range.clearContent();
      SpreadsheetApp.getActive().toast(validation.errors[0], 'Invalid graph edit', 8);
    }
  }

  recalculateRuntime();
}

function getRuntimeState(language) {
  try {
    const lang = language === 'ru' ? 'ru' : 'en';
    recalculateRuntime();
    const state = readOperationalState_();
    const translations = readTranslations_();
    const tasks = state.tasks.map(function (task) {
      const translated = translations[task.id] || {};
      return {
        id: task.id,
        title: lang === 'ru' ? (translated.ru || task.title) : (translated.en || task.title),
        applicable: task.localApplicable,
        done: task.done,
        comment: task.comment,
        status: task.status,
        waitingFor: task.waitingFor,
        section: lang === 'ru' ? (SECTION_RU[task.section] || task.section) : task.section
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
  const key = String(sheet.getRange(RUNTIME.configKeyCell).getDisplayValue() || '');
  const raw = key === RUNTIME.configKey
    ? String(sheet.getRange(RUNTIME.configValueCell).getValue() || '')
    : '';
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
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const sheet = getTranslationsSheet_();
    sheet.getRange(RUNTIME.configKeyCell).setValue(RUNTIME.configKey);
    sheet.getRange(RUNTIME.configValueCell).setValue(JSON.stringify(normalized));
    rebuildOperationalPool_(normalized);
  } finally {
    lock.releaseLock();
  }
  recalculateRuntime();
  return getRuntimeState('en');
}

function recalculateRuntime() {
  if (!isConfigured_()) return;
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) throw new Error('Runtime is busy. Try again.');
  try {
    const sheet = getPoolSheet_();
    const state = readOperationalState_();
    if (!state.tasks.length) return;
    const config = getRuntimeConfiguration();
    const byId = indexById_(state.tasks);
    const activeMemo = {};

    function isActive(task, trail) {
      if (Object.prototype.hasOwnProperty.call(activeMemo, task.id)) return activeMemo[task.id];
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
    lock.releaseLock();
  }
}

function canCompleteTask_(taskId) {
  const state = readOperationalState_();
  const byId = indexById_(state.tasks);
  const task = byId[taskId];
  if (!task) return {allowed: false, reason: 'Unknown Task ID: ' + taskId};
  if (task.localApplicable === RUNTIME.no || task.effectiveApplicable === RUNTIME.no) return {allowed: false, reason: taskId + ' is INACTIVE.'};
  const capability = evaluateCapabilities_(state.tasks, getRuntimeConfiguration());
  const readiness = evaluateTaskReadiness_(task, byId, capability, getRuntimeConfiguration());
  return readiness.level === 'PASS'
    ? {allowed: true, reason: ''}
    : {allowed: false, reason: taskId + ' is not READY. Waiting for: ' + readiness.reasons.join(', ')};
}

function evaluateTaskReadiness_(task, byId, capability, config) {
  if (!task.active && task.effectiveApplicable === RUNTIME.no) return {level: 'EXCLUDED', reasons: []};
  const missing = [];
  const waiting = [];
  task.dependencies.forEach(function (id) {
    const dependency = byId[id];
    if (!dependency) missing.push(id);
    else if (dependency.localApplicable === RUNTIME.no || dependency.effectiveApplicable === RUNTIME.no) return;
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
  const active = tasks.filter(function (task) { return task.active !== false && task.localApplicable !== RUNTIME.no; });
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
  const productValues = config.qa_products.map(function (x) { return Boolean(productQa[x.code]); });
  const scenarioValues = config.e2e_scenarios.map(function (x) { return Boolean(scenarioVerified[x.code]); });
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
      productSample: config.qa_products.length === 0,
      scenarios: config.e2e_scenarios.length === 0
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
  const sheet = getPoolSheet_();
  const previous = readOperationalState_();
  const previousById = indexById_(previous.tasks);
  const tasks = instantiateModel_(config);
  const sections = [];
  tasks.forEach(function (task) { if (sections.indexOf(task.section) < 0) sections.push(task.section); });
  const output = [];
  sections.forEach(function (section) {
    output.push({sectionHeader: true, section: section});
    tasks.filter(function (task) { return task.section === section; }).forEach(function (task) {
      const old = previousById[task.id];
      task.localApplicable = old ? old.localApplicable : task.defaultApplicable;
      task.done = old ? old.done : false;
      task.commentValue = old ? old.comment : task.comment;
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
  let row = RUNTIME.firstDataRow;
  output.forEach(function (item) {
    if (item.sectionHeader) {
      sectionFormat.copyTo(sheet.getRange(row, 1, 1, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      sheet.getRange(row, 2).setValue(item.section);
      sheet.getRange(row, 2, 1, 9).merge();
    } else {
      taskFormat.copyTo(sheet.getRange(row, 1, 1, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      // IDs such as 01-05 must stay identifiers. Without an explicit text
      // format Google Sheets converts them to dates, breaking dependency
      // lookup and sidebar writes.
      sheet.getRange(row, 1, 1, 4).setNumberFormat('@');
      sheet.getRange(row, 1, 1, 7).setValues([[
        item.id, item.title, item.parent || '', item.dependencies.join(', '), item.localApplicable,
        Boolean(item.done), item.commentValue || ''
      ]]);
      sheet.getRange(row, RUNTIME.columns.applicable).setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList([RUNTIME.yes, RUNTIME.no], true).setAllowInvalid(false).build()
      );
      sheet.getRange(row, RUNTIME.columns.done).insertCheckboxes();
    }
    row++;
  });
  refreshTranslations_(tasks);
  sheet.getRange(RUNTIME.firstDataRow, 1, output.length, 10).setVerticalAlignment('middle');
}

function instantiateModel_(config) {
  const collections = {
    integrations: config.integrations,
    payment_gateways: config.payment_gateways,
    carriers: config.carriers,
    tax_services: config.tax_services,
    qa_products: config.qa_products,
    e2e_scenarios: config.e2e_scenarios
  };
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
    if (owner.templateId === '10-92' && target.collection === 'integrations' && config.turn14IntegrationCode) {
      return [instantiateId_(ref, config.turn14IntegrationCode)];
    }
    return (collections[target.collection] || []).map(function (item) { return instantiateId_(ref, item.code); });
  }

  instances.forEach(function (instance) {
    instance.parent = instance.parentTemplate ? resolveReference(instance.parentTemplate, instance)[0] || '' : '';
    instance.dependencies = unique_([].concat.apply([], instance.dependencyTemplates.map(function (ref) { return resolveReference(ref, instance); })));
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
    titleRu: item ? replacePlaceholder_(template.ru, label) : template.ru,
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

function readOperationalState_() {
  const sheet = getPoolSheet_();
  const lastRow = Math.max(sheet.getLastRow(), RUNTIME.firstTaskRow);
  const range = sheet.getRange(RUNTIME.firstDataRow, 1, lastRow - RUNTIME.firstDataRow + 1, 10);
  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  const model = instantiateModel_(getRuntimeConfiguration());
  const metadata = {};
  model.forEach(function (task) { metadata[task.id] = task; });
  let section = '';
  const tasks = [];
  values.forEach(function (row, index) {
    const displayRow = displayValues[index];
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
      localApplicable: String(displayRow[4] || RUNTIME.yes),
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
      templateId: meta.templateId || String(row[0])
    });
  });
  return {sheet: sheet, tasks: tasks};
}

function refreshTranslations_(tasks) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RUNTIME.translationsSheet);
  if (!sheet) throw new Error('Missing sheet: ' + RUNTIME.translationsSheet);
  const rows = [['Task ID', 'English', 'Русский']].concat(tasks.map(function (task) { return [String(task.id), task.title, task.titleRu]; }));
  sheet.getRange(1, 1, sheet.getMaxRows(), 3).clearContent();
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  sheet.getRange(1, 1, rows.length, 3).setNumberFormat('@').setValues(rows);
}

function readTranslations_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RUNTIME.translationsSheet);
  if (!sheet || sheet.getLastRow() < 2) return {};
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getDisplayValues();
  const map = {};
  rows.forEach(function (row) { if (row[0]) map[String(row[0])] = {en: row[1], ru: row[2]}; });
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
    integrations: [], payment_gateways: [], carriers: [], tax_services: [], qa_products: [], e2e_scenarios: [],
    shippingMethods: [], sourceTypes: ['manual'], sourceOverlap: false, fitment: false, turn14IntegrationCode: ''
  };
}

function normalizeConfiguration_(input) {
  const base = defaultConfiguration_();
  const normalizeItems = function (items) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      return {code: normalizeCode_(item.code), name: String(item.name || item.code || '').trim()};
    }).filter(function (item) { return item.code && item.name; });
  };
  ['integrations', 'payment_gateways', 'carriers', 'tax_services', 'qa_products', 'e2e_scenarios'].forEach(function (key) {
    base[key] = normalizeItems(input[key]);
  });
  base.shippingMethods = unique_((Array.isArray(input.shippingMethods) ? input.shippingMethods : []).map(String));
  base.sourceTypes = unique_((Array.isArray(input.sourceTypes) ? input.sourceTypes : ['manual']).map(String));
  base.sourceOverlap = Boolean(input.sourceOverlap);
  base.fitment = Boolean(input.fitment);
  base.turn14IntegrationCode = normalizeCode_(input.turn14IntegrationCode || '');
  base.carriers.forEach(function (item) {
    const key = 'carrier:' + item.code;
    if (base.shippingMethods.indexOf(key) < 0) base.shippingMethods.push(key);
  });
  return base;
}

function validateConfiguration_(config) {
  const allCodes = [];
  ['integrations', 'payment_gateways', 'carriers', 'tax_services', 'qa_products', 'e2e_scenarios'].forEach(function (key) {
    config[key].forEach(function (item) {
      if (!/^[A-Z0-9_]{2,20}$/.test(item.code)) throw new Error('Invalid code ' + item.code + '. Use 2-20 uppercase letters, digits, or underscore.');
      allCodes.push(key + ':' + item.code);
    });
  });
  if (unique_(allCodes).length !== allCodes.length) throw new Error('Duplicate instance code in one collection.');
  if (config.turn14IntegrationCode && !config.integrations.some(function (x) { return x.code === config.turn14IntegrationCode; })) {
    throw new Error('Turn14 integration code is not present in integrations.');
  }
}

function getPoolSheet_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RUNTIME.poolSheet);
  if (!sheet) throw new Error('Missing sheet: ' + RUNTIME.poolSheet);
  return sheet;
}

function getTranslationsSheet_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RUNTIME.translationsSheet);
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
function taskDone_(tasks, id) { const task = tasks.filter(function (x) { return x.id === id; })[0]; return Boolean(task && task.active !== false && task.localApplicable !== RUNTIME.no && task.done); }
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
