const RUNTIME_MIGRATIONS = Object.freeze({
  1: function migrateRuntime1To2_() {
    // Version 2 introduces the row-indexed edit fast path. Operational rows do
    // not change, so the migration only rebuilds the derived checklist and
    // writes compatibility metadata after preservation checks pass.
  },
  2: function migrateRuntime2To3_() {
    // Version 3 makes the runtime English-only. Workbook sheet names and
    // visible values are migrated by migrateWorkbookToEnglish_.
  }
});

function getRuntimeCompatibility() {
  const properties = runtimeProperties_();
  const storedRuntimeVersion = Number(properties.getProperty(RUNTIME.runtimeVersionProperty) || 1);
  const storedModelVersion = properties.getProperty(RUNTIME.modelVersionProperty) || '';
  return {
    ok: storedRuntimeVersion === RUNTIME.runtimeVersion && storedModelVersion === RUNTIME_MODEL.version,
    storedRuntimeVersion: storedRuntimeVersion,
    runtimeVersion: RUNTIME.runtimeVersion,
    storedModelVersion: storedModelVersion,
    modelVersion: RUNTIME_MODEL.version,
    migrationRequired: storedRuntimeVersion !== RUNTIME.runtimeVersion,
    modelRefreshRequired: storedModelVersion !== RUNTIME_MODEL.version
  };
}

function showRuntimeCompatibility() {
  const result = getRuntimeCompatibility();
  SpreadsheetApp.getUi().alert([
    result.ok ? 'Runtime is compatible.' : 'Runtime migration or model refresh is required.',
    'Runtime: ' + result.storedRuntimeVersion + ' → ' + result.runtimeVersion,
    'Model: ' + (result.storedModelVersion || '(not recorded)') + ' → ' + result.modelVersion
  ].join('\n'));
  return result;
}

function migrateRuntime() {
  const lock = runtimeLock_();
  lock.waitLock(30000);
  const properties = runtimeProperties_();
  const oldRuntimeVersion = properties.getProperty(RUNTIME.runtimeVersionProperty);
  const oldModelVersion = properties.getProperty(RUNTIME.modelVersionProperty);
  let before;
  try {
    before = snapshotRuntimeData_();
    let version = Number(properties.getProperty(RUNTIME.runtimeVersionProperty) || 1);
    if (version > RUNTIME.runtimeVersion) {
      throw new Error('This spreadsheet uses newer runtime version ' + version + '.');
    }
    while (version < RUNTIME.runtimeVersion) {
      const migrate = RUNTIME_MIGRATIONS[version];
      if (!migrate) throw new Error('Missing migration ' + version + ' → ' + (version + 1));
      migrate();
      version++;
      properties.setProperty(RUNTIME.runtimeVersionProperty, String(version));
    }

    // A model-version change may add/remove dynamic rows. The existing rebuild
    // merges state by stable Task ID before the visible checklist is refreshed.
    const recordedModelVersion = properties.getProperty(RUNTIME.modelVersionProperty);
    let modelRebuilt = false;
    if (recordedModelVersion && recordedModelVersion !== RUNTIME_MODEL.version) {
      rebuildOperationalPool_(before.config);
      modelRebuilt = true;
    }
    const currentState = readOperationalState_(before.config);
    const checklist = runtimeSpreadsheet_().getSheetByName(RUNTIME.checklistSheet);
    const checklistIndex = checklist ? readChecklistRowIndex_(checklist) : {byId: {}, sectionRowById: {}, lastRow: 0};
    if (!checklist || modelRebuilt || !runtimeChecklistStructureMatches_(currentState.tasks, checklistIndex)) {
      refreshChecklist_(true);
    } else {
      markRuntimeFastPathCompatible_();
      cacheRuntimeRowIndex_(currentState.tasks, checklistIndex);
    }
    const after = snapshotRuntimeData_();
    assertRuntimeDataPreserved_(before, after);
    writeProjectMetadata_(runtimeSpreadsheet_(), {
      runtimeVersion: RUNTIME.runtimeVersion,
      modelVersion: RUNTIME_MODEL.version,
      migrationStatus: 'CURRENT'
    });
    return getRuntimeCompatibility();
  } catch (error) {
    if (before) restoreRuntimeDataSnapshot_(before);
    if (oldRuntimeVersion == null) properties.deleteProperty(RUNTIME.runtimeVersionProperty);
    else properties.setProperty(RUNTIME.runtimeVersionProperty, oldRuntimeVersion);
    if (oldModelVersion == null) properties.deleteProperty(RUNTIME.modelVersionProperty);
    else properties.setProperty(RUNTIME.modelVersionProperty, oldModelVersion);
    invalidateRuntimeIndexes_();
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function runtimeChecklistStructureMatches_(tasks, checklistIndex) {
  const ids = Object.keys(checklistIndex.byId);
  if (ids.length !== tasks.length) return false;
  return tasks.every(function (task) { return Boolean(checklistIndex.byId[task.id]); });
}

function restoreRuntimeDataSnapshot_(snapshot) {
  const state = readOperationalState_(snapshot.config);
  const rows = [];
  state.tasks.forEach(function (task) {
    const saved = snapshot.tasks[task.id];
    if (!saved) return;
    const copy = cloneRuntimeTask_(task);
    copy.localApplicable = saved.applicable;
    copy.done = saved.done;
    copy.comment = saved.comment;
    rows.push(copy);
  });
  writeContiguousTaskBlocks_(state.sheet, rows, RUNTIME.columns.applicable, 3, function (task) {
    return [task.localApplicable, Boolean(task.done), task.comment];
  });
  const translations = getTranslationsSheet_();
  translations.getRange(RUNTIME.configKeyCell + ':' + RUNTIME.configValueCell)
    .setValues([[RUNTIME.configKey, JSON.stringify(normalizeConfiguration_(snapshot.config))]]);
}

function snapshotRuntimeData_() {
  const config = getRuntimeConfiguration();
  const state = readOperationalState_(config);
  const tasks = {};
  state.tasks.forEach(function (task) {
    tasks[task.id] = {
      applicable: task.localApplicable,
      done: Boolean(task.done),
      comment: task.comment
    };
  });
  return {config: config, tasks: tasks};
}

function assertRuntimeDataPreserved_(before, after) {
  if (JSON.stringify(normalizeConfiguration_(before.config)) !== JSON.stringify(normalizeConfiguration_(after.config))) {
    throw new Error('Migration changed runtime configuration.');
  }
  Object.keys(before.tasks).forEach(function (id) {
    if (!after.tasks[id]) return;
    const oldTask = before.tasks[id];
    const newTask = after.tasks[id];
    if (oldTask.comment !== newTask.comment) throw new Error('Migration changed comment for ' + id);
    if (oldTask.done !== newTask.done) throw new Error('Migration changed DONE for ' + id);
    if (oldTask.applicable !== newTask.applicable) throw new Error('Migration changed applicability for ' + id);
  });
}
