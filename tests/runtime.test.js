const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const codeSource = fs.readFileSync(path.join(root, 'Code.gs'), 'utf8');
const modelSource = fs.readFileSync(path.join(root, 'RuntimeModel.gs'), 'utf8');
const context = vm.createContext({console});
vm.runInContext(modelSource + '\n' + codeSource + `\n;globalThis.api={
  RUNTIME,RUNTIME_MODEL,defaultConfiguration_,instantiateModel_,mergeTaskStateForRebuild_,
  validateTaskGraph_,detectCycles_,indexById_,statusFormula_,waitingFormula_,effectiveApplicableFormula_
  ,taskCanBeDoneFromState_
};`, context);
const api = context.api;

const base = api.instantiateModel_(api.defaultConfiguration_());
assert.ok(base.length > 200);
assert.equal(new Set(base.map(task => task.id)).size, base.length);
assert.equal(api.validateTaskGraph_(base).taskCount, base.length);
assert.equal(base.some(task => ['qa_products', 'e2e_scenarios'].includes(task.collection)), false);

const configured = api.instantiateModel_(Object.assign(api.defaultConfiguration_(), {
  integrations: [{code: 'T14', name: 'Turn14 Distribution'}],
  payment_gateways: [{code: 'STRIPE', name: 'Stripe'}],
  carriers: [{code: 'UPS', name: 'UPS'}],
  tax_services: [{code: 'TAXJAR', name: 'TaxJar'}],
  sourceTypes: ['supplier_feed'], shippingMethods: ['carrier:UPS']
}));
const byId = api.indexById_(configured);
assert.ok(byId['04-T14-01']);
assert.ok(byId['10-STRIPE-01']);
assert.ok(byId['11-UPS-01']);
assert.ok(byId['02-TAXJAR-01']);
assert.equal(configured.some(task => ['qa_products', 'e2e_scenarios'].includes(task.collection)), false);
assert.equal(api.validateTaskGraph_(configured).taskCount, configured.length);

const merged = api.mergeTaskStateForRebuild_(base.slice(0, 2), {
  [base[0].id]: {localApplicable: 'NO', done: false, comment: 'preserved'}
});
assert.equal(merged[0].localApplicable, 'NO');
assert.equal(merged[0].commentValue, 'preserved');

assert.match(api.statusFormula_(8, 400), /^=IF/);
assert.match(api.statusFormula_(8, 400), /READY/);
assert.match(api.statusFormula_(8, 400), /WAITING/);
assert.match(api.waitingFormula_(8, 400), /TEXTJOIN/);
assert.match(api.effectiveApplicableFormula_(8, 400), /Ancestor|\$K8|SPLIT/);
assert.doesNotMatch(api.statusFormula_(8, 400), /MAP|LAMBDA/);

const readyState = {
  A: {id: 'A', done: true, effectiveApplicable: 'YES', dependencies: []},
  B: {id: 'B', done: false, effectiveApplicable: 'YES', dependencies: ['A']},
  C: {id: 'C', done: false, effectiveApplicable: 'YES', dependencies: ['B']},
  D: {id: 'D', done: false, effectiveApplicable: 'NO', dependencies: []}
};
assert.equal(api.taskCanBeDoneFromState_(readyState.B, readyState), true);
assert.equal(api.taskCanBeDoneFromState_(readyState.C, readyState), false);
assert.equal(api.taskCanBeDoneFromState_(readyState.D, readyState), false);

assert.match(codeSource, /createFilter\(\)/);
assert.match(codeSource, /getRange\('A2:G4'\).*clearContent\(\).*clearDataValidations\(\).*clearFormat\(\)/);
assert.match(codeSource, /READY can be selected; DONE can be cleared/);
assert.match(codeSource, /status === 'READY' \|\| status === 'DONE'/);
assert.match(codeSource, /reconcileInvalidDoneValues_\(sheet\)/);
assert.match(codeSource, /if \(\[2, 4\]\.indexOf\(e\.range\.getColumn\(\)\) < 0\) return/);
assert.doesNotMatch(codeSource, /CHECKLIST_FILTER|applyChecklistStatusFilter|showSidebar|Language/);
assert.doesNotMatch(modelSource, /"gate"|"contour"|"nodeType"|qa_products|e2e_scenarios/);

console.log(JSON.stringify({ok: true, baseTasks: base.length, configuredTasks: configured.length}));
