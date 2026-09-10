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

const securityModule = load('lib/security.ts', {}, { URL });

function auth(remote = false, remoteClient) {
  const store = new Map();
  const customer = { id: 'customer', is_admin: false };
  const service = load('lib/services/auth.ts', {
    '../mock-data': { MOCK_CUSTOMER: customer, MOCK_OPERATOR: { id: 'admin', is_admin: true } },
    '../supabase/client': {
      isSupabaseConfigured: () => remote,
      createClient: () => remoteClient || ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
    },
    '../security': securityModule,
  }, { window: {}, localStorage: {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  } });
  return { service, store };
}

function mockFile(name, type, size, bytes = []) {
  const signature = Uint8Array.from(bytes);
  return {
    name, type, size,
    slice: () => ({ arrayBuffer: async () => signature.buffer }),
  };
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
    '../security': securityModule,
  }, { TextDecoder });
  await assert.rejects(processClientFileUpload(mockFile('bad.svg', 'image/svg+xml', 100)), /JPG/);
  await assert.rejects(processClientFileUpload(mockFile('empty.png', 'image/png', 0)), /2 MB/);
  await assert.rejects(processClientFileUpload(mockFile('large.png', 'image/png', 3 * 1024 * 1024)), /2 MB/);
  await assert.rejects(processClientFileUpload(mockFile('fake.png', 'image/jpeg', 100)), /does not match/);
  await assert.rejects(processClientFileUpload(mockFile('fake.png', 'image/png', 100, [0x4d, 0x5a])), /contents/);
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
    '../security': securityModule,
  }, { TextDecoder, FileReader: class { readAsDataURL() { this.onerror(); } } });
  await assert.rejects(processClientFileUpload(mockFile(
    'valid.png', 'image/png', 100,
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  )), /could not be read/);
});

test('post-auth redirects stay on allowlisted same-origin portal routes', () => {
  const { getSafePostAuthRedirect } = securityModule;
  assert.equal(getSafePostAuthRedirect('/dashboard/orders/123?tab=files'), '/dashboard/orders/123?tab=files');
  assert.equal(getSafePostAuthRedirect('/admin/orders'), '/admin/orders');
  for (const unsafe of ['//evil.example', '/\\evil.example', 'https://evil.example', '/login', '/%255cevil.example']) {
    assert.equal(getSafePostAuthRedirect(unsafe), '/dashboard/orders');
  }
});

test('public authentication results do not expose provider errors or account existence', async () => {
  const providerError = new Error('User not found in internal tenant 42');
  const client = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      signInWithPassword: async () => ({ data: { user: null }, error: providerError }),
      resetPasswordForEmail: async () => ({ error: providerError }),
    },
  };
  const { service } = auth(true, client);
  const signIn = await service.signInWithEmail('person@example.com', 'not-the-password');
  assert.equal(signIn.error, 'Unable to sign in. Check your credentials and try again.');
  assert.doesNotMatch(signIn.error, /tenant|not found/i);
  assert.equal((await service.requestPasswordReset('person@example.com')).success, true);
});

test('text, email and price validation rejects oversized and non-finite input', () => {
  const security = load('lib/security.ts');
  assert.equal(security.normalizeEmail(' Person@Example.com '), 'person@example.com');
  assert.throws(() => security.normalizeRequiredText('x'.repeat(11), 'Name', 10), /too long/);
  assert.throws(() => security.normalizePrice(Number.NaN, 'Price'), /between/);
  assert.throws(() => security.normalizeMediaUrl('javascript:alert(1)'), /HTTPS/);
  assert.throws(() => security.normalizeFilename('../invoice.pdf'), /unsafe/);
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
