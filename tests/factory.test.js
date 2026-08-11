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
const context = vm.createContext({console});
vm.runInContext(
  modelSource + '\n' + codeSource + '\n' + migrationSource + '\n' + factorySource + `\n;
    globalThis.factoryTestApi = {
      RUNTIME: RUNTIME,
      RUNTIME_MODEL: RUNTIME_MODEL,
      RUNTIME_MIGRATIONS: RUNTIME_MIGRATIONS,
      PROJECT_FACTORY: PROJECT_FACTORY,
      assertRuntimeDataPreserved_: assertRuntimeDataPreserved_,
      defaultConfiguration_: defaultConfiguration_,
      instantiateModel_: instantiateModel_,
      mergeTaskStateForRebuild_: mergeTaskStateForRebuild_
    };`,
  context
);
const api = context.factoryTestApi;

assert.equal(api.RUNTIME.runtimeVersion, 2);
for (let version = 1; version < api.RUNTIME.runtimeVersion; version++) {
  assert.equal(typeof api.RUNTIME_MIGRATIONS[version], 'function', `missing migration ${version} -> ${version + 1}`);
}

const config = api.defaultConfiguration_();
const stable = {
  config,
  tasks: {
    A: {applicable: 'ДА', done: true, comment: 'preserved'}
  }
};
api.assertRuntimeDataPreserved_(stable, JSON.parse(JSON.stringify(stable)));
assert.throws(() => api.assertRuntimeDataPreserved_(stable, {
  config,
  tasks: {A: {applicable: 'ДА', done: false, comment: 'preserved'}}
}), /changed DONE/);
assert.throws(() => api.assertRuntimeDataPreserved_(stable, {
  config,
  tasks: {A: {applicable: 'ДА', done: true, comment: 'changed'}}
}), /changed comment/);

const cleanTasks = api.mergeTaskStateForRebuild_(api.instantiateModel_(config), {});
assert.equal(cleanTasks.some(task => task.done), false);
assert.equal(new Set(cleanTasks.map(task => task.id)).size, cleanTasks.length);

assert.match(factorySource, /makeCopy\(projectName, folder\)/);
assert.match(factorySource, /SpreadsheetApp\.openById/);
assert.match(factorySource, /resetOnboardingSpreadsheet_/);
assert.match(factorySource, /appendProjectRegistry_/);
assert.doesNotMatch(factorySource, /newTrigger|ScriptApp\.newTrigger/);
assert.doesNotMatch(factorySource, /token|secret|password/i);

assert.deepEqual(Array.from(api.PROJECT_FACTORY.registryHeaders), [
  'Название', 'Spreadsheet ID', 'URL', 'Script ID', 'Дата создания',
  'Runtime version', 'Статус миграции'
]);
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/drive'));
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/spreadsheets'));

console.log(JSON.stringify({
  ok: true,
  runtimeVersion: api.RUNTIME.runtimeVersion,
  modelVersion: api.RUNTIME_MODEL.version,
  cleanTaskCount: cleanTasks.length,
  migrationSteps: Object.keys(api.RUNTIME_MIGRATIONS).length
}));
