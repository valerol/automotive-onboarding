const PROJECT_FACTORY = Object.freeze({
  registrySheet: 'ПРОЕКТЫ',
  metadataSheet: '_PROJECT_METADATA',
  defaultFolderId: '0ADsXCL4a35J8Uk9PVA',
  registryHeaders: Object.freeze([
    'Название', 'Spreadsheet ID', 'URL', 'Trigger ID', 'Дата создания',
    'Runtime version', 'Статус миграции'
  ])
});

function promptCreateOnboardingProject() {
  const ui = SpreadsheetApp.getUi();
  const nameResult = ui.prompt('Создать onboarding-проект', 'Название проекта', ui.ButtonSet.OK_CANCEL);
  if (nameResult.getSelectedButton() !== ui.Button.OK) return;
  const folderResult = ui.prompt(
    'Папка Google Drive',
    'Введите ссылку или ID папки. Оставьте поле пустым, чтобы сохранить рядом с текущей таблицей.',
    ui.ButtonSet.OK_CANCEL
  );
  if (folderResult.getSelectedButton() !== ui.Button.OK) return;
  try {
    const result = createOnboardingProjectInFolder(nameResult.getResponseText(), folderResult.getResponseText());
    ui.alert('Проект создан:\n' + result.url);
    return result;
  } catch (error) {
    ui.alert('Не удалось создать onboarding-проект', error.message, ui.ButtonSet.OK);
    throw error;
  }
}

function promptCreateCleanMasterTemplate() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Используется один центральный мастер',
    'Мастер больше не копируется: его Apps Script является общим runtime для всех onboarding-проектов. ' +
      'Создавайте новые проекты командой «Создать onboarding-проект».',
    ui.ButtonSet.OK
  );
}

function createCleanMasterTemplateInFolder(name, folderId) {
  throw new Error('Мастер является единым центральным runtime и больше не копируется.');
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
    throw new Error('Достигнут лимит Google Apps Script: 20 onboarding-проектов на один центральный runtime.');
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
    throw new Error('Не удалось определить папку текущей таблицы. Детали: ' + error.message);
  }
  if (PROJECT_FACTORY.defaultFolderId) return PROJECT_FACTORY.defaultFolderId;
  throw new Error('У текущей таблицы нет доступной родительской папки. Укажите ссылку или ID папки Google Drive.');
}

function normalizeDriveFolderId_(folderInput) {
  const value = String(folderInput || '').trim();
  if (!value) throw new Error('Укажите ссылку или ID папки Google Drive.');

  const folderUrlMatch = value.match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (folderUrlMatch) return folderUrlMatch[1];

  const idParameterMatch = value.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (idParameterMatch) return idParameterMatch[1];

  if (/^[A-Za-z0-9_-]{10,}$/.test(value)) return value;
  throw new Error('Не удалось распознать папку Google Drive. Вставьте полную ссылку на папку или её ID.');
}

function assertDriveDestinationWritable_(folderId) {
  let folder;
  try {
    folder = Drive.Files.get(folderId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,capabilities(canAddChildren)'
    });
  } catch (error) {
    throw new Error(
      'Google Drive не нашёл папку «' + folderId + '». В это поле нельзя вводить название проекта или папки: ' +
      'вставьте ссылку/ID существующей папки либо оставьте поле пустым, чтобы сохранить рядом с текущей таблицей. ' +
      'Также проверьте доступ аккаунта, который запускает команду. ' +
      'Детали: ' + error.message
    );
  }

  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('Указанный ID относится не к папке Google Drive: ' + folderId);
  }
  if (folder.capabilities && folder.capabilities.canAddChildren === false) {
    throw new Error(
      'Нет права создавать файлы в папке «' + (folder.name || folderId) + '». ' +
      'Для Shared Drive требуется роль Content manager или Manager.'
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
  const rows = [['Task ID', 'English', 'Русский']].concat(tasks.map(function (task) {
    return [String(task.id), task.title, task.titleRu];
  }));
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  sheet.getRange(1, 1, sheet.getMaxRows(), 3).clearContent();
  sheet.getRange(1, 1, rows.length, 3).setNumberFormat('@').setValues(rows);
}

function writeCleanChecklist_(spreadsheet, tasks) {
  const sheet = spreadsheet.getSheetByName(RUNTIME.checklistSheet);
  if (!sheet) throw new Error('Copy is missing ' + RUNTIME.checklistSheet);
  const translations = {};
  instantiateModel_(defaultConfiguration_()).forEach(function (task) {
    translations[task.id] = {en: task.title, ru: task.titleRu};
  });
  const language = 'ru';
  const displayRows = [];
  let section = '';
  tasks.forEach(function (task) {
    const translated = translations[task.id] || {};
    const localizedSection = language === 'ru' ? (SECTION_RU[task.section] || task.section) : task.section;
    if (localizedSection !== section) {
      section = localizedSection;
      displayRows.push({type: 'section', section: section});
    }
    displayRows.push({type: 'task', task: task, title: translated.ru || task.title});
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
  sheet.getRange('G2').setValue('RU');
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
