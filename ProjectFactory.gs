const PROJECT_FACTORY = Object.freeze({
  registrySheet: 'ПРОЕКТЫ',
  metadataSheet: '_PROJECT_METADATA',
  registryHeaders: Object.freeze([
    'Название', 'Spreadsheet ID', 'URL', 'Script ID', 'Дата создания',
    'Runtime version', 'Статус миграции'
  ])
});

function promptCreateOnboardingProject() {
  const ui = SpreadsheetApp.getUi();
  const nameResult = ui.prompt('Создать onboarding-проект', 'Название проекта', ui.ButtonSet.OK_CANCEL);
  if (nameResult.getSelectedButton() !== ui.Button.OK) return;
  const folderResult = ui.prompt(
    'Папка Google Drive',
    'Введите ссылку или ID выбранной папки Google Drive',
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
  const nameResult = ui.prompt('Чистая мастер-копия', 'Название мастер-таблицы', ui.ButtonSet.OK_CANCEL);
  if (nameResult.getSelectedButton() !== ui.Button.OK) return;
  const folderResult = ui.prompt(
    'Папка Google Drive',
    'Введите ссылку или ID выбранной папки Google Drive',
    ui.ButtonSet.OK_CANCEL
  );
  if (folderResult.getSelectedButton() !== ui.Button.OK) return;
  try {
    const result = createCleanMasterTemplateInFolder(nameResult.getResponseText(), folderResult.getResponseText());
    ui.alert('Чистая мастер-копия создана:\n' + result.url);
    return result;
  } catch (error) {
    ui.alert('Не удалось создать мастер-копию', error.message, ui.ButtonSet.OK);
    throw error;
  }
}

function createCleanMasterTemplateInFolder(name, folderId) {
  return createOnboardingCopy_(name, folderId, 'MASTER');
}

function createOnboardingProjectInFolder(name, folderId) {
  return createOnboardingCopy_(name, folderId, 'PROJECT');
}

function createOnboardingCopy_(name, folderId, kind) {
  const projectName = String(name || '').trim();
  if (!projectName) throw new Error('Project name is required.');
  const targetFolderId = normalizeDriveFolderId_(folderId);

  const master = SpreadsheetApp.getActive();
  assertDriveDestinationWritable_(targetFolderId);
  const copiedFile = Drive.Files.copy({
    name: projectName,
    parents: [targetFolderId]
  }, master.getId(), {
    supportsAllDrives: true,
    fields: 'id,name,webViewLink'
  });
  const copiedFileId = copiedFile.id;
  const copiedFileUrl = copiedFile.webViewLink ||
    'https://docs.google.com/spreadsheets/d/' + copiedFileId + '/edit';
  let status = 'RESET_FAILED';
  try {
    const copy = SpreadsheetApp.openById(copiedFileId);
    resetOnboardingSpreadsheet_(copy, {
      kind: kind,
      name: projectName,
      sourceSpreadsheetId: master.getId(),
      createdAt: new Date()
    });
    status = 'CURRENT';
  } catch (error) {
    // A partially reset copy may still contain source-project data. Move only
    // the newly created copy to Drive trash; the source spreadsheet is never
    // modified and the registry records the failed attempt.
    status = 'RESET_FAILED_TRASHED';
    try {
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
      scriptId: '',
      createdAt: new Date(),
      runtimeVersion: RUNTIME.runtimeVersion,
      migrationStatus: status
    });
  }
  return {
    name: projectName,
    spreadsheetId: copiedFileId,
    url: copiedFileUrl,
    scriptId: '',
    runtimeVersion: RUNTIME.runtimeVersion,
    migrationStatus: status
  };
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
      'Не удалось открыть папку Google Drive. Проверьте ссылку и доступ аккаунта, который запускает команду. ' +
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
    project.scriptId || '',
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
