const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {performance} = require('node:perf_hooks');

const root = path.resolve(__dirname, '..');
const codeSource = fs.readFileSync(path.join(root, 'Code.gs'), 'utf8');
const modelSource = fs.readFileSync(path.join(root, 'RuntimeModel.gs'), 'utf8');
const context = vm.createContext({console});
vm.runInContext(
  modelSource + '\n' + codeSource + `\n;globalThis.runtimeTestApi = {
    RUNTIME: RUNTIME,
    RUNTIME_MODEL: RUNTIME_MODEL,
    calculateRuntimeGraph_: calculateRuntimeGraph_,
    cloneRuntimeTask_: cloneRuntimeTask_,
    defaultConfiguration_: defaultConfiguration_,
    detectCycles_: detectCycles_,
    indexById_: indexById_,
    instantiateModel_: instantiateModel_,
    mergeTaskStateForRebuild_: mergeTaskStateForRebuild_
  };`,
  context
);

const api = context.runtimeTestApi;
const yes = api.RUNTIME.yes;
const no = api.RUNTIME.no;

function task(id, dependencies = [], overrides = {}) {
  return Object.assign({
    row: 10,
    id,
    title: id,
    parent: '',
    dependencies,
    localApplicable: yes,
    done: false,
    comment: '',
    effectiveApplicable: yes,
    status: '',
    waitingFor: '',
    section: 'TEST',
    contour: '',
    gate: '',
    collection: '',
    instanceCode: '',
    systemApplicable: false,
    configurationApplicable: true,
    templateId: id
  }, overrides);
}

function calculate(tasks, config = api.defaultConfiguration_()) {
  return api.calculateRuntimeGraph_(tasks.map(api.cloneRuntimeTask_), config);
}

function testDependenciesAndDone() {
  let result = calculate([task('A'), task('B', ['A'], {row: 11})]);
  assert.equal(result.byId.A.status, 'READY');
  assert.equal(result.byId.B.status, 'WAITING');

  result.byId.A.done = true;
  result = calculate(result.tasks);
  assert.equal(result.byId.A.status, 'DONE');
  assert.equal(result.byId.B.status, 'READY');

  result.byId.B.done = true;
  result = calculate(result.tasks);
  assert.equal(result.byId.B.status, 'DONE');

  result.byId.A.done = false;
  result = calculate(result.tasks);
  assert.equal(result.byId.B.done, false);
  assert.equal(result.byId.B.status, 'WAITING');
}

function testInactiveDoesNotBlock() {
  const result = calculate([
    task('A', [], {localApplicable: no}),
    task('B', ['A'], {row: 11})
  ]);
  assert.equal(result.byId.A.status, 'INACTIVE');
  assert.equal(result.byId.B.status, 'READY');
}

function testParentCascade() {
  const result = calculate([
    task('P', [], {localApplicable: no}),
    task('C', [], {row: 11, parent: 'P', done: true})
  ]);
  assert.equal(result.byId.C.status, 'INACTIVE');
  assert.equal(result.byId.C.done, false);
}

function testSourcesDoNotCreateTasks() {
  const configs = ['manual', 'csv', 'supplier_feed'].map(source => Object.assign(api.defaultConfiguration_(), {
    sourceTypes: [source]
  }));
  const counts = configs.map(config => api.instantiateModel_(config).length);
  assert.deepEqual(counts, [counts[0], counts[0], counts[0]]);
}

function testDynamicBranchesAndGraphIntegrity() {
  const config = Object.assign(api.defaultConfiguration_(), {
    integrations: [{code: 'T14', name: 'Turn14 Distribution'}],
    payment_gateways: [{code: 'STRIPE', name: 'Stripe'}],
    carriers: [{code: 'UPS', name: 'UPS'}],
    tax_services: [{code: 'TAXJAR', name: 'TaxJar'}],
    shippingMethods: ['carrier:UPS'],
    sourceTypes: ['supplier_feed']
  });
  const tasks = api.instantiateModel_(config);
  const byId = api.indexById_(tasks);
  assert.ok(byId['10-STRIPE-01']);
  assert.ok(byId['11-UPS-01']);
  assert.ok(tasks.some(item => item.collection === 'e2e_scenarios'));
  assert.equal(Object.keys(byId).length, tasks.length, 'Task IDs must be unique');
  tasks.forEach(item => {
    if (item.parent) assert.ok(byId[item.parent], `${item.id} parent ${item.parent}`);
    item.dependencies.forEach(id => assert.ok(byId[id], `${item.id} dependency ${id}`));
  });
  assert.equal(api.detectCycles_(tasks, item => item.dependencies).length, 0);
  assert.equal(api.detectCycles_(tasks, item => item.parent ? [item.parent] : []).length, 0);
}

function testRebuildPreservesStableState() {
  const current = api.instantiateModel_(api.defaultConfiguration_()).slice(0, 3);
  const previous = {};
  previous[current[0].id] = {localApplicable: no, done: false, comment: 'keep comment'};
  previous[current[1].id] = {localApplicable: yes, done: true, comment: 'done remains'};
  const merged = api.mergeTaskStateForRebuild_(current, previous);
  assert.equal(merged[0].localApplicable, no);
  assert.equal(merged[0].commentValue, 'keep comment');
  assert.equal(merged[1].done, true);
  assert.equal(merged[1].commentValue, 'done remains');
}

function testFastPathSourceGuards() {
  const handler = codeSource.slice(
    codeSource.indexOf('function handleChecklistEdit_'),
    codeSource.indexOf('function runtimeFastPathCompatible_')
  );
  const commentBranch = handler.match(/if \(column === 6\) \{([\s\S]*?)\n\s*\}/);
  assert.ok(commentBranch, 'comment branch exists');
  assert.match(commentBranch[1], /fastUpdateComment_/);
  assert.doesNotMatch(commentBranch[1], /refreshChecklist_|recalculateRuntime/);

  const fastFunctions = codeSource.slice(
    codeSource.indexOf('function fastUpdateComment_'),
    codeSource.indexOf('function createRuntimeTimer_')
  );
  assert.doesNotMatch(fastFunctions, /clearContent|clearFormat|clearDataValidations|insertCheckboxes|setDataValidation|setConditionalFormatRules/);
}

function testRapidSequentialChanges() {
  let state = calculate([task('A'), task('B', ['A'], {row: 11}), task('C', ['B'], {row: 12})]);
  for (let index = 0; index < 20; index++) {
    state.byId.A.done = index % 2 === 0;
    state = calculate(state.tasks);
    assert.equal(state.byId.B.status, index % 2 === 0 ? 'READY' : 'WAITING');
    assert.equal(state.byId.C.status, 'WAITING');
  }
}

const tests = [
  testDependenciesAndDone,
  testInactiveDoesNotBlock,
  testParentCascade,
  testSourcesDoNotCreateTasks,
  testDynamicBranchesAndGraphIntegrity,
  testRebuildPreservesStableState,
  testFastPathSourceGuards,
  testRapidSequentialChanges
];

const started = performance.now();
tests.forEach(test => test());
const testMs = performance.now() - started;

const config = Object.assign(api.defaultConfiguration_(), {
  integrations: [{code: 'T14', name: 'Turn14 Distribution'}],
  payment_gateways: [{code: 'STRIPE', name: 'Stripe'}],
  carriers: [{code: 'UPS', name: 'UPS'}],
  shippingMethods: ['carrier:UPS'],
  sourceTypes: ['supplier_feed']
});
const benchmarkTasks = api.instantiateModel_(config).map((item, index) => task(item.id, item.dependencies, Object.assign(item, {row: index + 8})));
const benchmarkStart = performance.now();
for (let index = 0; index < 100; index++) calculate(benchmarkTasks, config);
const benchmarkMs = performance.now() - benchmarkStart;

console.log(JSON.stringify({
  ok: true,
  tests: tests.length,
  testMs: Number(testMs.toFixed(2)),
  graphRecalculations: 100,
  tasksPerGraph: benchmarkTasks.length,
  graphBenchmarkMs: Number(benchmarkMs.toFixed(2))
}));
