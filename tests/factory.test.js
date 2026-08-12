const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const modelSource = read('RuntimeModel.gs');
const codeSource = read('Code.gs');
const factorySource = read('ProjectFactory.gs');
const manifest = JSON.parse(read('appsscript.json'));
const context = vm.createContext({console});
vm.runInContext(modelSource + '\n' + codeSource + '\n' + factorySource + `\n;globalThis.api={PROJECT_FACTORY,normalizeDriveFolderId_};`, context);
const api = context.api;

assert.equal(fs.existsSync(path.join(root, 'RuntimeMigrations.gs')), false);
assert.equal(fs.existsSync(path.join(root, 'Sidebar.html')), false);
[modelSource, codeSource, factorySource].forEach(source => assert.doesNotMatch(source, /[\u0400-\u04FF]/));
assert.deepEqual(Array.from(api.PROJECT_FACTORY.registryHeaders), [
  'Project name','Spreadsheet ID','URL','Trigger ID','Created at','Model version','Status'
]);
assert.match(factorySource, /SpreadsheetApp\.create/);
assert.match(factorySource, /\.copyTo\(destination\)/);
assert.match(factorySource, /ScriptApp\.newTrigger\('centralProjectOnEdit'\)/);
assert.match(factorySource, /FORMULA_CHECKLIST/);
assert.doesNotMatch(factorySource, /migration|Sidebar|translate/i);
assert.equal(api.normalizeDriveFolderId_('folder_123456789'), 'folder_123456789');
assert.equal(api.normalizeDriveFolderId_('https://drive.google.com/drive/folders/folder_123456789?usp=sharing'), 'folder_123456789');
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/drive'));
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/spreadsheets'));
assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.scriptapp'));
console.log(JSON.stringify({ok: true, modelVersion: '2.0.0'}));
