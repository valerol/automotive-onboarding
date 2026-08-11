const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const modelSource = read('RuntimeModel.gs');
const codeSource = read('Code.gs');
const migrationSource = read('RuntimeMigrations.gs');
const factorySource = read('ProjectFactory.gs');
const manifest = JSON.parse(read('appsscript.json'));
const repositorySources = [modelSource, codeSource, migrationSource, factorySource, read('Sidebar.html')];
const context = vm.createContext({console});
vm.runInContext(
  modelSource + '\n' + codeSource + '\n' + migrationSource + '\n' + factorySource + `\n;
    globalThis.factoryTestApi = {
      RUNTIME: RUNTIME,
      RUNTIME_MODEL: RUNTIME_MODEL,
      RUNTIME_MIGRATIONS: RUNTIME_MIGRATIONS,
      PROJECT_FACTORY: PROJECT_FACTORY,
      resolveDriveFolderId_: resolveDriveFolderId_,
      normalizeDriveFolderId_: normalizeDriveFolderId_,
      assertRuntimeDataPreserved_: assertRuntimeDataPreserved_,
      defaultConfiguration_: defaultConfiguration_,
      instantiateModel_: instantiateModel_,
      mergeTaskStateForRebuild_: mergeTaskStateForRebuild_
    };`,
  context
);
const api = context.factoryTestApi;

repositorySources.forEach(source => assert.doesNotMatch(source, /[\u0400-\u04FF]/));

assert.equal(api.RUNTIME.runtimeVersion, 3);
for (let version = 1; version < api.RUNTIME.runtimeVersion; version++) {
  assert.equal(typeof api.RUNTIME_MIGRATIONS[version], 'function', `missing migration ${version} -> ${version + 1}`);
}

const config = api.defaultConfiguration_();
const stable = {
  config,
  tasks: {
    A: {applicable: 'YES', done: true, comment: 'preserved'}
  }
};
api.assertRuntimeDataPreserved_(stable, JSON.parse(JSON.stringify(stable)));
assert.throws(() => api.assertRuntimeDataPreserved_(stable, {
  config,
  tasks: {A: {applicable: 'YES', done: false, comment: 'preserved'}}
}), /changed DONE/);
assert.throws(() => api.assertRuntimeDataPreserved_(stable, {
  config,
  tasks: {A: {applicable: 'YES', done: true, comment: 'changed'}}
}), /changed comment/);

const cleanTasks = api.mergeTaskStateForRebuild_(api.instantiateModel_(config), {});
assert.equal(cleanTasks.some(task => task.done), false);
assert.equal(new Set(cleanTasks.map(task => task.id)).size, cleanTasks.length);

assert.doesNotMatch(factorySource, /Drive\.Files\.copy/);
assert.match(factorySource, /supportsAllDrives:\s*true/);
assert.match(factorySource, /fields:\s*'id,parents,driveId'/);
assert.match(factorySource, /if \(source\.driveId\) return source\.driveId/);
assert.match(factorySource, /Leave this blank/);
assert.match(factorySource, /SpreadsheetApp\.create/);
assert.match(factorySource, /\.copyTo\(destination\)/);
assert.match(factorySource, /resetOnboardingSpreadsheet_/);
assert.match(factorySource, /appendProjectRegistry_/);
assert.match(factorySource, /ScriptApp\.newTrigger\('centralProjectOnEdit'\)/);
assert.match(factorySource, /\.forSpreadsheet\(spreadsheetId\)/);
assert.match(codeSource, /function refreshInstructionSheet\(\)/);
assert.match(factorySource, /sheet\.clear\(\)/);
assert.match(factorySource, /sheet\.autoResizeRows\(2, rows\.length - 1\)/);
assert.match(factorySource, /SpreadsheetApp\.BorderStyle\.SOLID/);
assert.doesNotMatch(factorySource, /token|secret|password/i);

assert.deepEqual(Array.from(api.PROJECT_FACTORY.registryHeaders), [
  'Project name', 'Spreadsheet ID', 'URL', 'Trigger ID', 'Created at',
  'Runtime version', 'Migration status'
]);
assert.equal(api.PROJECT_FACTORY.defaultFolderId, 'root');
assert.match(factorySource, /if \(targetFolderId === 'root'\) return destination/);
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/drive'));
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/spreadsheets'));
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.scriptapp'));
assert.deepEqual(manifest.dependencies.enabledAdvancedServices, [{
  userSymbol: 'Drive',
  version: 'v3',
  serviceId: 'drive'
}]);

assert.equal(api.normalizeDriveFolderId_('folder_123456789'), 'folder_123456789');
assert.equal(
  api.normalizeDriveFolderId_('https://drive.google.com/drive/folders/folder_123456789?usp=sharing'),
  'folder_123456789'
);
assert.equal(
  api.normalizeDriveFolderId_('https://drive.google.com/open?id=folder_123456789'),
  'folder_123456789'
);
assert.throws(() => api.normalizeDriveFolderId_('not a folder'), /Could not recognize/);

console.log(JSON.stringify({
  ok: true,
  runtimeVersion: api.RUNTIME.runtimeVersion,
  modelVersion: api.RUNTIME_MODEL.version,
  cleanTaskCount: cleanTasks.length,
  migrationSteps: Object.keys(api.RUNTIME_MIGRATIONS).length
}));
