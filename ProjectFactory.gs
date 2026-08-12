const PROJECT_FACTORY = Object.freeze({
  registrySheet: 'PROJECTS',
  metadataSheet: '_PROJECT_METADATA',
  defaultFolderId: 'root',
  registryHeaders: Object.freeze([
    'Project name', 'Spreadsheet ID', 'URL', 'Trigger ID', 'Created at',
    'Model version', 'Status'
  ])
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
    ui.alert('Could not create the onboarding project', formatRuntimeError_(error), ui.ButtonSet.OK);
    throw error;
  }
}

function createOnboardingProjectInFolder(name, folderId) {
  const projectName = String(name || '').trim();
  if (!projectName) throw new Error('Project name is required.');

  const master = runtimeSpreadsheet_();
  const targetFolderId = resolveDriveFolderId_(folderId, master.getId());
  assertDriveDestinationWritable_(targetFolderId);
  const copy = createDataOnlySpreadsheetCopy_(master, projectName, targetFolderId);
  let trigger = null;
  let status = 'RESET_FAILED';
  try {
    resetOnboardingSpreadsheet_(copy, {
      projectName: projectName,
      sourceSpreadsheetId: master.getId(),
      createdAt: new Date()
    });
    trigger = installCentralProjectTrigger_(copy);
    writeProjectMetadata_(copy, {
      projectName: projectName,
      sourceSpreadsheetId: master.getId(),
      createdAt: new Date(),
      modelVersion: RUNTIME_MODEL.version,
      triggerId: trigger.getUniqueId(),
      runtimeMode: 'FORMULA_CHECKLIST',
      status: 'ACTIVE'
    });
    status = 'ACTIVE';
  } catch (error) {
    status = 'RESET_FAILED_TRASHED';
    try {
      if (trigger) ScriptApp.deleteTrigger(trigger);
      Drive.Files.update({trashed: true}, copy.getId(), null, {supportsAllDrives: true});
    } catch (trashError) {
      console.error('Unable to trash failed onboarding copy ' + copy.getId() + ': ' + trashError.message);
    }
    throw error;
  } finally {
    appendProjectRegistry_(master, {
      name: projectName,
      spreadsheetId: copy.getId(),
      url: 'https://docs.google.com/spreadsheets/d/' + copy.getId() + '/edit',
      triggerId: trigger ? trigger.getUniqueId() : '',
      createdAt: new Date(),
      modelVersion: RUNTIME_MODEL.version,
      status: status
    });
  }
  return {
    name: projectName,
    spreadsheetId: copy.getId(),
    url: 'https://docs.google.com/spreadsheets/d/' + copy.getId() + '/edit',
    triggerId: trigger.getUniqueId(),
    modelVersion: RUNTIME_MODEL.version,
    status: status
  };
}

function createDataOnlySpreadsheetCopy_(source, name, targetFolderId) {
  const destination = SpreadsheetApp.create(name);
  try {
    const defaultSheet = destination.getSheets()[0];
    const copiedSheets = [];
    source.getSheets().forEach(function (sourceSheet) {
      if (sourceSheet.getName() === PROJECT_FACTORY.registrySheet ||
          sourceSheet.getName() === '_RUNTIME_DATA' ||
          sourceSheet.getName() === '_TRANSLATIONS' ||
          sourceSheet.getName().indexOf('TASK POOL RECOVERY ') === 0 ||
          sourceSheet.getName().indexOf('CHECKLIST RECOVERY ') === 0) return;
      const copied = sourceSheet.copyTo(destination).setName(sourceSheet.getName());
      copiedSheets.push({sheet: copied, hidden: sourceSheet.isSheetHidden()});
    });
    if (!copiedSheets.length) throw new Error('Master has no project sheets to copy.');
    destination.deleteSheet(defaultSheet);
    copiedSheets.forEach(function (item) {
      if (item.hidden && !item.sheet.isSheetHidden()) item.sheet.hideSheet();
    });

    if (targetFolderId === 'root') return destination;
    const file = Drive.Files.get(destination.getId(), {supportsAllDrives: true, fields: 'id,parents'});
    const options = {addParents: targetFolderId, supportsAllDrives: true, fields: 'id,parents'};
    if (file.parents && file.parents.length) options.removeParents = file.parents.join(',');
    Drive.Files.update({}, destination.getId(), null, options);
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

function resetOnboardingSpreadsheet_(spreadsheet, metadata) {
  return withRuntimeSpreadsheet_(spreadsheet, function () {
    renderConfigurationSheet_(ensureConfigurationSheet_(), defaultConfiguration_());
    rebuildChecklistFromConfiguration_(false);
    renderEnglishInstructions_(spreadsheet);
    writeProjectMetadata_(spreadsheet, {
      projectName: metadata.projectName,
      sourceSpreadsheetId: metadata.sourceSpreadsheetId,
      createdAt: metadata.createdAt,
      modelVersion: RUNTIME_MODEL.version,
      runtimeMode: 'FORMULA_CHECKLIST',
      status: 'CURRENT'
    });
    const registry = spreadsheet.getSheetByName(PROJECT_FACTORY.registrySheet);
    if (registry && spreadsheet.getSheets().length > 1) spreadsheet.deleteSheet(registry);
  });
}

function installCentralProjectTrigger_(spreadsheet) {
  const spreadsheetId = spreadsheet.getId();
  const existing = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === 'centralProjectOnEdit' && trigger.getTriggerSourceId() === spreadsheetId;
  });
  if (existing.length) return existing[0];
  if (ScriptApp.getProjectTriggers().length >= 20) {
    throw new Error('Google Apps Script limit reached: 20 onboarding projects per central runtime.');
  }
  return ScriptApp.newTrigger('centralProjectOnEdit').forSpreadsheet(spreadsheetId).onEdit().create();
}

function resolveDriveFolderId_(folderInput, sourceFileId) {
  const value = String(folderInput || '').trim();
  if (value) return normalizeDriveFolderId_(value);
  const source = Drive.Files.get(sourceFileId, {supportsAllDrives: true, fields: 'id,parents,driveId'});
  if (source.parents && source.parents.length) return source.parents[0];
  if (source.driveId) return source.driveId;
  return PROJECT_FACTORY.defaultFolderId;
}

function normalizeDriveFolderId_(folderInput) {
  const value = String(folderInput || '').trim();
  if (!value) throw new Error('Enter a Google Drive folder link or ID.');
  const folderMatch = value.match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  const idMatch = value.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  if (/^[A-Za-z0-9_-]{10,}$/.test(value)) return value;
  throw new Error('Could not recognize the Google Drive folder. Paste the full folder link or its ID.');
}

function assertDriveDestinationWritable_(folderId) {
  if (folderId === 'root') return {id: 'root', name: 'My Drive'};
  const folder = Drive.Files.get(folderId, {
    supportsAllDrives: true,
    fields: 'id,name,mimeType,capabilities(canAddChildren)'
  });
  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('The supplied ID does not belong to a Google Drive folder: ' + folderId);
  }
  if (folder.capabilities && folder.capabilities.canAddChildren === false) {
    throw new Error('You cannot create files in folder "' + (folder.name || folderId) + '".');
  }
  return folder;
}

function renderEnglishInstructions_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(RUNTIME.instructionSheet);
  if (!sheet) sheet = spreadsheet.insertSheet(RUNTIME.instructionSheet);
  const rows = [
    ['AUTOMOTIVE ONBOARDING — OPERATING GUIDE', ''],
    ['Purpose', 'Use CHECKLIST for daily work and CONFIGURATION to define the project scope.'],
    ['Columns', 'Task, Done, Comment, Applicable, Status, Task ID, Waiting for.'],
    ['Filtering', 'Use the standard Google Sheets filter in row 6. Filtering never runs Apps Script.'],
    ['Done', 'Only READY task checkboxes are editable. WAITING, INACTIVE, and DONE checkboxes are protected.'],
    ['Statuses', 'Status and Waiting for are protected spreadsheet formulas calculated from Applicable, Parent ID, Dependencies, and Done.'],
    ['Configuration', 'Changing CONFIGURATION rebuilds service branches and formulas while preserving state by Task ID.'],
    ['Canonical source', 'RuntimeModel is the canonical task template. TASK POOL is a protected generated view used for restoration.'],
    ['Recovery', 'Use CHECKLIST -> Restore canonical checklist to restore missing rows and formulas.'],
    ['Project creation', 'In the master, choose CHECKLIST -> Create onboarding project.'],
    ['Authorization', 'Only the central runtime owner authorizes Apps Script. Project operators use the spreadsheet directly.']
  ];
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).breakApart();
  sheet.clear();
  if (sheet.getMaxRows() < rows.length) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
  if (sheet.getMaxColumns() < 2) sheet.insertColumnsAfter(sheet.getMaxColumns(), 2 - sheet.getMaxColumns());
  sheet.getRange(1, 1, rows.length, 2).setValues(rows).setVerticalAlignment('top');
  sheet.getRange('A1:B1').merge().setBackground('#29375f').setFontColor('#ffffff').setFontSize(18).setFontWeight('bold');
  sheet.getRange(2, 1, rows.length - 1, 1).setFontWeight('bold').setBackground('#e9edf5');
  sheet.getRange(2, 2, rows.length - 1, 1).setBackground('#ffffff').setWrap(true);
  sheet.getRange(2, 1, rows.length - 1, 2).setBorder(
    true, true, true, true, true, true, '#d5dbe7', SpreadsheetApp.BorderStyle.SOLID
  );
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 720);
  sheet.setRowHeight(1, 42);
  sheet.autoResizeRows(2, rows.length - 1);
  sheet.setFrozenRows(1);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor('#3b82f6');
  return sheet;
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
  ensureProjectRegistry_(spreadsheet).appendRow([
    project.name, project.spreadsheetId, project.url, project.triggerId || '', project.createdAt,
    project.modelVersion, project.status
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
