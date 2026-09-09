import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Compile real source in memory; isolate browser storage and remote auth per test.
function load(relative, mocks = {}, globals = {}) {
  const filename = path.resolve(import.meta.dirname, '..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(code, {
    module: loadedModule, exports: loadedModule.exports,
    require: (id) => {
      if (id in mocks) return mocks[id];
      throw new Error(`Unmocked dependency: ${id}`);
    }, ...globals,
  }, { filename });
  return loadedModule.exports;
}

function auth(remote = false) {
  const store = new Map();
  const customer = { id: 'customer', is_admin: false };
  const service = load('lib/services/auth.ts', {
    '../mock-data': { MOCK_CUSTOMER: customer, MOCK_OPERATOR: { id: 'admin', is_admin: true } },
    '../supabase/client': {
      isSupabaseConfigured: () => remote,
      createClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
    },
  }, { window: {}, localStorage: {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  } });
  return { service, store };
}

test('demo logout stays logged out on subsequent reads', async () => {
  const { service } = auth();
  assert.equal((await service.getCurrentUser()).id, 'customer');
  await service.signOutUser();
  assert.equal(await service.getCurrentUser(), null);
  assert.equal(await service.getCurrentUser(), null);
});

test('remote auth never falls back to a stored demo administrator', async () => {
  const { service, store } = auth(true);
  store.set('artlantix_auth_user', JSON.stringify({ id: 'admin', is_admin: true }));
  assert.equal(await service.getCurrentUser(), null);
  assert.throws(() => service.switchDemoPersona('operator'), /disabled/);
  assert.ok((await service.signInWithEmail('test@example.com')).error);
  assert.ok((await service.signUpWithEmail('test@example.com', 'Test')).error);
});

test('pricing breakdown matches the total for every option combination', () => {
  const { calculatePricing } = load('lib/pricing.ts');
  for (const complexity of ['simple', 'standard', 'complex'])
    for (const turnaround of ['standard', 'express'])
      for (const colorCount of ['1-2', '3-5', '6+', 'gradient'])
        for (const hasText of [false, true]) {
          const input = { complexity, turnaround, colorCount, hasText, reconstructionNeeded: true };
          const price = calculatePricing(input);
          assert.equal(price.total, price.breakdown.reduce((sum, item) => sum + item.amount, 0));
          assert.equal(price.needsManualReview, complexity === 'complex' && hasText);
        }
});

test('uploads reject unsupported, empty and oversized files before reading', async () => {
  const { processClientFileUpload } = load('lib/services/storage.ts', {
    '../supabase/client': {},
  });
  await assert.rejects(processClientFileUpload({ name: 'bad.svg', size: 100 }), /JPG/);
  await assert.rejects(processClientFileUpload({ name: 'empty.png', size: 0 }), /2 MB/);
  await assert.rejects(processClientFileUpload({ name: 'large.png', size: 3 * 1024 * 1024 }), /2 MB/);
});

test('artist assessment forces review even for simple artwork and clears when deselected', () => {
  const { calculatePricing } = load('lib/pricing.ts');
  const input = { complexity: 'simple', turnaround: 'standard', colorCount: '1-2', hasText: false, reconstructionNeeded: false };
  const normal = calculatePricing(input);
  const review = calculatePricing({ ...input, artistReviewRequested: true });
  assert.equal(normal.needsManualReview, false);
  assert.equal(review.needsManualReview, true);
  assert.match(review.manualReviewReason, /Customer requested/);
  assert.equal(review.total, normal.total);
  assert.equal(calculatePricing({ ...input, artistReviewRequested: false }).needsManualReview, false);
});

test('file reader failure rejects instead of leaving upload pending', async () => {
  const { processClientFileUpload } = load('lib/services/storage.ts', {
    '../supabase/client': {},
  }, { FileReader: class { readAsDataURL() { this.onerror(); } } });
  await assert.rejects(processClientFileUpload({ name: 'valid.png', size: 100 }), /could not be read/);
});

test('delivery dates and branched status history stay consistent', () => {
  const status = load('lib/order-status.ts', { './types': {} });
  assert.equal(status.calculateExpectedDelivery('2026-09-10T00:00:00.000Z', 'express'), '2026-09-10T16:00:00.000Z');
  const revisionOrder = {
    id: 'order-1', status: 'revision_requested', turnaround: 'standard',
    created_at: '2026-09-10T00:00:00.000Z', updated_at: '2026-09-11T00:00:00.000Z',
  };
  const history = status.getStatusHistory(revisionOrder);
  assert.deepEqual(Array.from(history, (event) => event.status), [
    'quote_requested', 'in_review', 'in_progress', 'preview_ready', 'revision_requested',
  ]);
  assert.equal(history.at(-1).created_at, revisionOrder.updated_at);
});

test('stored history adds the current status when older records are incomplete', () => {
  const status = load('lib/order-status.ts', { './types': {} });
  const history = status.getStatusHistory({
    id: 'order-2', status: 'approved', turnaround: 'standard',
    created_at: '2026-09-10T00:00:00.000Z', updated_at: '2026-09-10T12:00:00.000Z',
    status_history: [{ id: 'first', status: 'quote_requested', created_at: '2026-09-10T00:00:00.000Z' }],
  });
  assert.equal(history.at(-1).status, 'approved');
});
