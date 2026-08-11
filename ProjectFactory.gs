const PROJECT_FACTORY = Object.freeze({
  registrySheet: 'PROJECTS',
  metadataSheet: '_PROJECT_METADATA',
  defaultFolderId: 'root',
  registryHeaders: Object.freeze([
    'Project name', 'Spreadsheet ID', 'URL', 'Trigger ID', 'Created at',
    'Runtime version', 'Migration status'
  ])
});

const LEGACY_SHEET_NAMES = Object.freeze({
  CHECKLIST: '\u0427\u0415\u041A\u041B\u0418\u0421\u0422',
  PROJECTS: '\u041F\u0420\u041E\u0415\u041A\u0422\u042B',
  CONFIGURATION: '\u041A\u041E\u041D\u0424\u0418\u0413\u0423\u0420\u0410\u0426\u0418\u042F',
  RUNTIME_DATA: '_TRANSLATIONS',
  TASK_POOL: '\u041F\u0423\u041B \u0422\u0410\u0421\u041A\u041E\u0412',
  INSTRUCTIONS: '\u0418\u041D\u0421\u0422\u0420\u0423\u041A\u0426\u0418\u042F'
});

function promptCreateOnboardingProject() {
  const ui = SpreadsheetApp.getUi();
  const nameResult = ui.prompt('Create onboarding project', 'Project name', ui.ButtonSet.OK_CANCEL);
  if (nameResult.getSelectedButton() !== ui.Button.OK) return;
  const folderResult = ui.prompt(
    'Google Drive folder',
    'Enter a folder link or ID. Leave this blank to save the project in My Drive.',
    ui.ButtonSet.OK_CANCEL
  );
  if (folderResult.getSelectedButton() !== ui.Button.OK) return;
  try {
    const result = createOnboardingProjectInFolder(nameResult.getResponseText(), folderResult.getResponseText());
    ui.alert('Project created:\n' + result.url);
    return result;
  } catch (error) {
    ui.alert('Could not create the onboarding project', error.message, ui.ButtonSet.OK);
    throw error;
  }
}

function promptCreateCleanMasterTemplate() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'One central master is used',
    'The master is no longer copied: its Apps Script is the shared runtime for all onboarding projects. ' +
      'Create new projects with Create onboarding project.',
    ui.ButtonSet.OK
  );
}

function createCleanMasterTemplateInFolder(name, folderId) {
  throw new Error('The master is the single central runtime and is no longer copied.');
}

function createOnboardingProjectInFolder(name, folderId) {
  return createOnboardingCopy_(name, folderId, 'PROJECT');
}

function createOnboardingCopy_(name, folderId, kind) {
  const projectName = String(name || '').trim();
  if (!projectName) throw new Error('Project name is required.');

  if (kind !== 'PROJECT') throw new Error('Only data-only onboarding projects can be created.');

  const master = runtimeSpreadsheet_();
  const targetFolderId = resolveDriveFolderId_(folderId, master.getId());
  assertDriveDestinationWritable_(targetFolderId);
  const copy = createDataOnlySpreadsheetCopy_(master, projectName, targetFolderId);
  const copiedFileId = copy.getId();
  const copiedFileUrl =
    'https://docs.google.com/spreadsheets/d/' + copiedFileId + '/edit';
  let status = 'RESET_FAILED';
  let trigger = null;
  try {
    resetOnboardingSpreadsheet_(copy, {
      kind: kind,
      name: projectName,
      sourceSpreadsheetId: master.getId(),
      createdAt: new Date()
    });
    trigger = installCentralProjectTrigger_(copy);
    writeProjectMetadata_(copy, {
      kind: kind,
      projectName: projectName,
      sourceSpreadsheetId: master.getId(),
      createdAt: new Date(),
      runtimeVersion: RUNTIME.runtimeVersion,
      modelVersion: RUNTIME_MODEL.version,
      triggerId: trigger.getUniqueId(),
      runtimeMode: 'CENTRAL_INSTALLABLE_TRIGGER',
      migrationStatus: 'CENTRAL_ACTIVE'
    });
    status = 'CENTRAL_ACTIVE';
  } catch (error) {
    // A partially reset copy may still contain source-project data. Move only
    // the newly created copy to Drive trash; the source spreadsheet is never
    // modified and the registry records the failed attempt.
    status = 'RESET_FAILED_TRASHED';
    try {
      if (trigger) ScriptApp.deleteTrigger(trigger);
      Drive.Files.update({trashed: true}, copiedFileId, null, {supportsAllDrives: true});
    } catch (trashError) {
      console.error('Unable to trash failed onboarding copy ' + copiedFileId + ': ' + trashError.message);
    }
    throw error;
  } finally {
    appendProjectRegistry_(master, {
      name: projectName,
      spreadsheetId: copiedFileId,
      url: copiedFileUrl,
      triggerId: trigger ? trigger.getUniqueId() : '',
      createdAt: new Date(),
      runtimeVersion: RUNTIME.runtimeVersion,
      migrationStatus: status
    });
  }
  return {
    name: projectName,
    spreadsheetId: copiedFileId,
    url: copiedFileUrl,
    triggerId: trigger ? trigger.getUniqueId() : '',
    runtimeVersion: RUNTIME.runtimeVersion,
    migrationStatus: status
  };
}

function createDataOnlySpreadsheetCopy_(source, name, targetFolderId) {
  const destination = SpreadsheetApp.create(name);
  try {
    const defaultSheet = destination.getSheets()[0];
    const copiedSheets = [];
    source.getSheets().forEach(function (sourceSheet) {
      if (sourceSheet.getName() === PROJECT_FACTORY.registrySheet) return;
      const copied = sourceSheet.copyTo(destination).setName(sourceSheet.getName());
      copiedSheets.push({sheet: copied, hidden: sourceSheet.isSheetHidden()});
    });
    if (!copiedSheets.length) throw new Error('Master has no project sheets to copy.');
    destination.deleteSheet(defaultSheet);
    copiedSheets.forEach(function (item) {
      if (item.hidden && !item.sheet.isSheetHidden()) item.sheet.hideSheet();
    });

    if (targetFolderId === 'root') return destination;

    const file = Drive.Files.get(destination.getId(), {
      supportsAllDrives: true,
      fields: 'id,parents'
    });
    const currentParents = file.parents || [];
    const moveOptions = {
      addParents: targetFolderId,
      supportsAllDrives: true,
      fields: 'id,parents'
    };
    if (currentParents.length) moveOptions.removeParents = currentParents.join(',');
    Drive.Files.update({}, destination.getId(), null, moveOptions);
    return destination;
  } catch (error) {
    try {
      Drive.Files.update({trashed: true}, destination.getId(), null, {supportsAllDrives: true});
    } catch (trashError) {
      console.error('Unable to trash failed data-only copy ' + destination.getId() + ': ' + trashError.message);
    }
    throw error;
  }
}

function installCentralProjectTrigger_(spreadsheet) {
  const spreadsheetId = spreadsheet.getId();
  const existing = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === 'centralProjectOnEdit' &&
      trigger.getTriggerSourceId() === spreadsheetId;
  });
  if (existing.length) return existing[0];

  const projectTriggers = ScriptApp.getProjectTriggers();
  if (projectTriggers.length >= 20) {
    throw new Error('Google Apps Script limit reached: 20 onboarding projects per central runtime.');
  }
  return ScriptApp.newTrigger('centralProjectOnEdit')
    .forSpreadsheet(spreadsheetId)
    .onEdit()
    .create();
}

function resolveDriveFolderId_(folderInput, sourceFileId) {
  const value = String(folderInput || '').trim();
  if (value) return normalizeDriveFolderId_(value);

  try {
    const source = Drive.Files.get(sourceFileId, {
      supportsAllDrives: true,
      fields: 'id,parents,driveId'
    });
    if (source.parents && source.parents.length) return source.parents[0];
    // A file stored directly in a Shared Drive root can have no `parents`
    // entry even though the drive root itself is a valid destination folder.
    if (source.driveId) return source.driveId;
  } catch (error) {
    throw new Error('Could not determine the current spreadsheet folder. Details: ' + error.message);
  }
  if (PROJECT_FACTORY.defaultFolderId) return PROJECT_FACTORY.defaultFolderId;
  throw new Error('The current spreadsheet has no accessible parent folder. Enter a Google Drive folder link or ID.');
}

function normalizeDriveFolderId_(folderInput) {
  const value = String(folderInput || '').trim();
  if (!value) throw new Error('Enter a Google Drive folder link or ID.');

  const folderUrlMatch = value.match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (folderUrlMatch) return folderUrlMatch[1];

  const idParameterMatch = value.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (idParameterMatch) return idParameterMatch[1];

  if (/^[A-Za-z0-9_-]{10,}$/.test(value)) return value;
  throw new Error('Could not recognize the Google Drive folder. Paste the full folder link or its ID.');
}

function assertDriveDestinationWritable_(folderId) {
  if (folderId === 'root') return {id: 'root', name: 'My Drive'};
  let folder;
  try {
    folder = Drive.Files.get(folderId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,capabilities(canAddChildren)'
    });
  } catch (error) {
    throw new Error(
      'Google Drive could not find folder "' + folderId + '". Do not enter a project or folder name here: ' +
      'paste the link or ID of an existing folder, or leave the field blank to save in My Drive. ' +
      'Also verify access for the account running the command. ' +
      'Details: ' + error.message
    );
  }

  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('The supplied ID does not belong to a Google Drive folder: ' + folderId);
  }
  if (folder.capabilities && folder.capabilities.canAddChildren === false) {
    throw new Error(
      'You cannot create files in folder "' + (folder.name || folderId) + '". ' +
      'A Shared Drive requires the Content manager or Manager role.'
    );
  }
  return folder;
}

function resetOnboardingSpreadsheet_(spreadsheet, metadata) {
  const config = defaultConfiguration_();
  const translations = spreadsheet.getSheetByName(RUNTIME.translationsSheet);
  if (!translations) throw new Error('Copy is missing ' + RUNTIME.translationsSheet);
  translations.getRange(RUNTIME.configKeyCell + ':' + RUNTIME.configValueCell)
    .setValues([[RUNTIME.configKey, JSON.stringify(config)]]);

  const configSheet = spreadsheet.getSheetByName(RUNTIME.configurationSheet);
  if (!configSheet) throw new Error('Copy is missing ' + RUNTIME.configurationSheet);
  renderConfigurationSheet_(configSheet, config);

  const calculated = writeCleanOperationalPool_(spreadsheet, config);
  writeCleanChecklist_(spreadsheet, calculated.tasks);
  renderEnglishInstructions_(spreadsheet);
  writeProjectMetadata_(spreadsheet, {
    kind: metadata.kind,
    projectName: metadata.name,
    sourceSpreadsheetId: metadata.sourceSpreadsheetId,
    createdAt: metadata.createdAt,
    runtimeVersion: RUNTIME.runtimeVersion,
    modelVersion: RUNTIME_MODEL.version,
    migrationStatus: 'CURRENT'
  });

  if (metadata.kind === 'PROJECT') {
    const registry = spreadsheet.getSheetByName(PROJECT_FACTORY.registrySheet);
    if (registry && spreadsheet.getSheets().length > 1) spreadsheet.deleteSheet(registry);
  } else {
    ensureProjectRegistry_(spreadsheet).getRange('A2:G').clearContent();
  }
}

function migrateAllWorkbooksToEnglish() {
  const master = runtimeSpreadsheet_();
  const results = [];
  if (workbookNeedsEnglishMigration_(master)) {
    migrateWorkbookToEnglish_(master, true);
    results.push({spreadsheetId: master.getId(), name: master.getName(), status: 'MIGRATED'});
  } else {
    results.push({spreadsheetId: master.getId(), name: master.getName(), status: 'ALREADY_ENGLISH'});
  }

  const registry = master.getSheetByName(PROJECT_FACTORY.registrySheet);
  if (registry && registry.getLastRow() >= 2) {
    const ids = registry.getRange(2, 2, registry.getLastRow() - 1, 1).getDisplayValues();
    const seen = {};
    ids.forEach(function (row) {
      const id = String(row[0] || '').trim();
      if (!id || seen[id]) return;
      seen[id] = true;
      try {
        const child = SpreadsheetApp.openById(id);
        if (workbookNeedsEnglishMigration_(child)) {
          migrateWorkbookToEnglish_(child, false);
          results.push({spreadsheetId: id, name: child.getName(), status: 'MIGRATED'});
        } else {
          results.push({spreadsheetId: id, name: child.getName(), status: 'ALREADY_ENGLISH'});
        }
      } catch (error) {
        results.push({spreadsheetId: id, status: 'SKIPPED', error: formatRuntimeError_(error)});
      }
    });
  }
  return results;
}

function workbookNeedsEnglishMigration_(spreadsheet) {
  return Object.keys(LEGACY_SHEET_NAMES).some(function (key) {
    return Boolean(spreadsheet.getSheetByName(LEGACY_SHEET_NAMES[key]));
  });
}

function migrateWorkbookToEnglish_(spreadsheet, isMaster) {
  return withRuntimeSpreadsheet_(spreadsheet, function () {
    renameLegacySheet_(spreadsheet, LEGACY_SHEET_NAMES.CHECKLIST, RUNTIME.checklistSheet);
    renameLegacySheet_(spreadsheet, LEGACY_SHEET_NAMES.CONFIGURATION, RUNTIME.configurationSheet);
    renameLegacySheet_(spreadsheet, LEGACY_SHEET_NAMES.RUNTIME_DATA, RUNTIME.translationsSheet);
    renameLegacySheet_(spreadsheet, LEGACY_SHEET_NAMES.TASK_POOL, RUNTIME.poolSheet);
    renameLegacySheet_(spreadsheet, LEGACY_SHEET_NAMES.INSTRUCTIONS, RUNTIME.instructionSheet);
    if (isMaster) renameLegacySheet_(spreadsheet, LEGACY_SHEET_NAMES.PROJECTS, PROJECT_FACTORY.registrySheet);

    const pool = spreadsheet.getSheetByName(RUNTIME.poolSheet);
    if (!pool) throw new Error('Missing sheet: ' + RUNTIME.poolSheet);
    if (pool.getLastRow() >= RUNTIME.firstDataRow) {
      const range = pool.getRange(RUNTIME.firstDataRow, 1, pool.getLastRow() - RUNTIME.firstDataRow + 1, RUNTIME.columns.applicable);
      const rows = range.getValues();
      rows.forEach(function (row) {
        if (String(row[0] || '').trim()) row[RUNTIME.columns.applicable - 1] = normalizeApplicability_(row[RUNTIME.columns.applicable - 1]);
      });
      pool.getRange(
        RUNTIME.firstDataRow,
        RUNTIME.columns.applicable,
        pool.getLastRow() - RUNTIME.firstDataRow + 1,
        1
      ).clearDataValidations();
      range.setValues(rows);
    }

    const config = getRuntimeConfiguration();
    const configuration = ensureConfigurationSheet_();
    renderConfigurationSheet_(configuration, config);
    rebuildOperationalPool_(config);
    recalculateRuntime();
    const state = readOperationalState_(config);
    refreshTranslations_(state.tasks);
    const checklist = ensureChecklistSheet_();
    refreshChecklist_();
    renderEnglishInstructions_(spreadsheet);
    protectPoolSheet_();
    spreadsheet.setSpreadsheetLocale('en_US');
    if (isMaster) {
      spreadsheet.rename('Automotive Onboarding — Master');
      ensureProjectRegistry_(spreadsheet);
    }
    spreadsheet.setActiveSheet(checklist);
    return {spreadsheetId: spreadsheet.getId(), name: spreadsheet.getName(), taskCount: state.tasks.length};
  });
}

function renameLegacySheet_(spreadsheet, legacyName, englishName) {
  const legacy = spreadsheet.getSheetByName(legacyName);
  const english = spreadsheet.getSheetByName(englishName);
  if (!legacy) return english;
  if (english && english.getSheetId() !== legacy.getSheetId()) {
    throw new Error('Cannot rename ' + legacyName + ': sheet ' + englishName + ' already exists.');
  }
  legacy.setName(englishName);
  return legacy;
}

function renderEnglishInstructions_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(RUNTIME.instructionSheet);
  if (!sheet) sheet = spreadsheet.insertSheet(RUNTIME.instructionSheet);
  const rows = [
    ['AUTOMOTIVE ONBOARDING — OPERATING GUIDE', ''],
    ['Purpose', 'Use CHECKLIST for daily work and CONFIGURATION to define the project scope.'],
    ['Quick start', 'Open CONFIGURATION, select all applicable services and options, then save the configuration.'],
    ['Checklist editing', 'Only Applicable, DONE, and Comment are editable. System-controlled applicability is read-only.'],
    ['Status filter', 'Use CHECKLIST -> Status filter. READY means the task can be completed now.'],
    ['DONE', 'Mark DONE only after the task is complete. The runtime rejects premature completion.'],
    ['WAITING', 'One or more dependencies are incomplete. See Waiting for for the blocking Task IDs.'],
    ['BLOCKED', 'A required capability or configuration is missing. Resolve the listed prerequisite.'],
    ['INACTIVE', 'The task is outside the current project scope or disabled by its parent/configuration.'],
    ['Comments', 'Use Comment for project-specific evidence, decisions, URLs, and QA product details.'],
    ['Configuration', 'Checkbox selections rebuild repeatable branches while preserving state by stable Task ID.'],
    ['Project creation', 'In the master, choose CHECKLIST -> Create onboarding project.'],
    ['Destination folder', 'Paste a Google Drive folder link or ID. Leave it blank to create the project in the creator account\'s My Drive.'],
    ['Ownership', 'The Google account that runs project creation owns the new spreadsheet and its central installable trigger.'],
    ['Domain access', 'Other @x-cart.com users can create projects when the master and destination folder are shared with sufficient access.'],
    ['Authorization', 'Only the central runtime owner/creator authorizes Apps Script. Project editors use the spreadsheet without script authorization.'],
    ['Runtime limit', 'One central Apps Script project supports up to 20 installable project triggers for its owner.'],
    ['Technical sheets', 'TASK POOL, _RUNTIME_DATA, and _PROJECT_METADATA are runtime-managed. Do not edit them directly.'],
    ['Recovery', 'If creation fails, verify folder access and retry. Failed partial copies are moved to Trash and logged in PROJECTS.']
  ];
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).breakApart();
  sheet.clearContents();
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  if (sheet.getMaxColumns() < 2) sheet.insertColumnsAfter(sheet.getMaxColumns(), 2 - sheet.getMaxColumns());
  sheet.getRange(1, 1, rows.length, 2).setValues(rows).setVerticalAlignment('top');
  sheet.getRange('A1:B1').merge().setBackground('#29375f').setFontColor('#ffffff').setFontSize(18).setFontWeight('bold');
  sheet.getRange(2, 1, rows.length - 1, 1).setFontWeight('bold').setBackground('#e9edf5');
  sheet.getRange(2, 2, rows.length - 1, 1).setWrap(true);
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 720);
  sheet.setFrozenRows(1);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor('#3b82f6');
  return sheet;
}

function writeCleanOperationalPool_(spreadsheet, config) {
  const sheet = spreadsheet.getSheetByName(RUNTIME.poolSheet);
  if (!sheet) throw new Error('Copy is missing ' + RUNTIME.poolSheet);
  const tasks = mergeTaskStateForRebuild_(instantiateModel_(config), {});
  const sections = [];
  tasks.forEach(function (task) { if (sections.indexOf(task.section) < 0) sections.push(task.section); });
  const output = [];
  sections.forEach(function (section) {
    output.push({sectionHeader: true, section: section});
    tasks.filter(function (task) { return task.section === section; }).forEach(function (task) { output.push(task); });
  });

  const neededLastRow = RUNTIME.headerRow + output.length;
  if (sheet.getMaxRows() < neededLastRow) sheet.insertRowsAfter(sheet.getMaxRows(), neededLastRow - sheet.getMaxRows());
  if (sheet.getLastRow() >= RUNTIME.firstDataRow) {
    sheet.getRange(RUNTIME.firstDataRow, 1, sheet.getLastRow() - RUNTIME.firstDataRow + 1, 10)
      .breakApart().clearContent().clearDataValidations();
  }

  const taskFormat = sheet.getRange(RUNTIME.firstTaskRow, 1, 1, 10);
  const sectionFormat = sheet.getRange(RUNTIME.firstDataRow, 1, 1, 10);
  const stateTasks = [];
  let row = RUNTIME.firstDataRow;
  output.forEach(function (item) {
    if (item.sectionHeader) {
      sectionFormat.copyTo(sheet.getRange(row, 1, 1, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      sheet.getRange(row, 2).setValue(item.section);
      sheet.getRange(row, 2, 1, 9).merge();
    } else {
      taskFormat.copyTo(sheet.getRange(row, 1, 1, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      sheet.getRange(row, 1, 1, 4).setNumberFormat('@');
      sheet.getRange(row, 1, 1, 7).setValues([[
        item.id, item.title, item.parent || '', item.dependencies.join(', '), item.localApplicable,
        false, item.commentValue || ''
      ]]);
      sheet.getRange(row, RUNTIME.columns.applicable).setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList([RUNTIME.yes, RUNTIME.no], true).setAllowInvalid(false).build()
      );
      sheet.getRange(row, RUNTIME.columns.done).insertCheckboxes();
      stateTasks.push(runtimeTaskFromModel_(item, row));
    }
    row++;
  });
  const calculated = calculateRuntimeGraph_(stateTasks, config);
  writeContiguousTaskBlocks_(sheet, calculated.tasks, RUNTIME.columns.effectiveApplicable, 3, function (task) {
    return [task.effectiveApplicable, task.status, task.waitingFor];
  });
  updateCountersFromTasks_(sheet, calculated.tasks);
  refreshTranslationsOnSpreadsheet_(spreadsheet, tasks);
  return calculated;
}

function runtimeTaskFromModel_(task, row) {
  return {
    row: row,
    id: task.id,
    title: task.title,
    parent: task.parent || '',
    dependencies: task.dependencies.slice(),
    localApplicable: task.localApplicable,
    done: false,
    comment: task.commentValue || '',
    effectiveApplicable: '',
    status: '',
    waitingFor: '',
    section: task.section,
    contour: task.contour || '',
    gate: task.gate || '',
    collection: task.collection || '',
    instanceCode: task.instanceCode || '',
    systemApplicable: Boolean(task.systemApplicable),
    configurationApplicable: task.configurationApplicable !== false,
    templateId: task.templateId || task.id
  };
}

function refreshTranslationsOnSpreadsheet_(spreadsheet, tasks) {
  const sheet = spreadsheet.getSheetByName(RUNTIME.translationsSheet);
  const rows = [['Task ID', 'English']].concat(tasks.map(function (task) {
    return [String(task.id), task.title];
  }));
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  sheet.getRange(1, 1, sheet.getMaxRows(), 3).clearContent();
  sheet.getRange(1, 1, rows.length, 2).setNumberFormat('@').setValues(rows);
}

function writeCleanChecklist_(spreadsheet, tasks) {
  const sheet = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  if (!sheet) throw new Error('Copy is missing ' + RUNTIME.checklistSheet);
  const translations = {};
  instantiateModel_(defaultConfiguration_()).forEach(function (task) {
    translations[task.id] = {en: task.title};
  });
  const displayRows = [];
  let section = '';
  tasks.forEach(function (task) {
    const translated = translations[task.id] || {};
    const localizedSection = task.section;
    if (localizedSection !== section) {
      section = localizedSection;
      displayRows.push({type: 'section', section: section});
    }
    displayRows.push({type: 'task', task: task, title: translated.en || task.title});
  });
  const requiredRows = RUNTIME.checklistFirstTaskRow + displayRows.length - 1;
  if (sheet.getMaxRows() < requiredRows) sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  const clearRows = sheet.getMaxRows() - RUNTIME.checklistFirstTaskRow + 1;
  sheet.showRows(RUNTIME.checklistFirstTaskRow, clearRows);
  sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, clearRows, 7)
    .clearDataValidations().clearContent().clearFormat();
  const values = displayRows.map(function (row) {
    if (row.type === 'section') return ['', row.section, '', '', '', '', ''];
    const task = row.task;
    return [task.id, row.title, task.status, task.localApplicable, false, task.comment, task.waitingFor];
  });
  sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, values.length, 7).setValues(values).setVerticalAlignment('middle');
  sheet.getRange(RUNTIME.checklistFirstTaskRow, 1, values.length, 1).setNumberFormat('@');
  let blockStart = 0;
  displayRows.forEach(function (row, index) {
    const sheetRow = RUNTIME.checklistFirstTaskRow + index;
    if (row.type === 'section') {
      if (blockStart) applyCleanChecklistValidations_(sheet, blockStart, sheetRow - blockStart);
      blockStart = 0;
      sheet.getRange(sheetRow, 1, 1, 7).setBackground('#e9edf5').setFontColor('#29375f').setFontWeight('bold');
    } else if (!blockStart) blockStart = sheetRow;
  });
  if (blockStart) applyCleanChecklistValidations_(sheet, blockStart, RUNTIME.checklistFirstTaskRow + displayRows.length - blockStart);
  sheet.getRange('G2').setValue('EN');
  sheet.getRange('D2').setValue('ALL');
  ensureChecklistFormatting_(sheet);
}

function applyCleanChecklistValidations_(sheet, startRow, rowCount) {
  sheet.getRange(startRow, 4, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList([RUNTIME.yes, RUNTIME.no], true).setAllowInvalid(false).build()
  );
  sheet.getRange(startRow, 5, rowCount, 1).insertCheckboxes();
}

function ensureProjectRegistry_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(PROJECT_FACTORY.registrySheet);
  if (!sheet) sheet = spreadsheet.insertSheet(PROJECT_FACTORY.registrySheet);
  sheet.getRange(1, 1, 1, PROJECT_FACTORY.registryHeaders.length)
    .setValues([PROJECT_FACTORY.registryHeaders]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function appendProjectRegistry_(spreadsheet, project) {
  const sheet = ensureProjectRegistry_(spreadsheet);
  sheet.appendRow([
    project.name,
    project.spreadsheetId,
    project.url,
    project.triggerId || '',
    project.createdAt,
    project.runtimeVersion,
    project.migrationStatus
  ]);
}

function writeProjectMetadata_(spreadsheet, values) {
  let sheet = spreadsheet.getSheetByName(PROJECT_FACTORY.metadataSheet);
  if (!sheet) sheet = spreadsheet.insertSheet(PROJECT_FACTORY.metadataSheet);
  const rows = Object.keys(values).map(function (key) { return [key, values[key]]; });
  sheet.clearContents();
  if (rows.length) sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  if (!sheet.isSheetHidden()) sheet.hideSheet();
}
