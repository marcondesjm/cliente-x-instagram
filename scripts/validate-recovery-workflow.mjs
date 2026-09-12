import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const workflow = readFileSync('.github/workflows/instagram-feed-cliente-x.yml', 'utf8');
const conditions = new Map([...workflow.matchAll(/- name: ([^\n]+)\n([\s\S]*?)(?=\n      - name:|$)/g)].map(([, name, body]) => [name.trim(), body.match(/^        if: (.+)$/m)?.[1]]));
function enabled(step, event, auto = false, scheduled = false, dryRun = false) {
  const expression = conditions.get(step);
  assert.ok(expression, `Missing condition for ${step}`);
  return vm.runInNewContext(expression, {
    github: { event_name: event, event: { inputs: { publish_mode: 'feed-and-story', mark_automatic_slot: 'true', scheduled_only: 'false', pack_json: '' } } },
    steps: { auto_slot: { outputs: { has_due: String(auto) } }, scheduled_queue: { outputs: { has_due: String(scheduled), state_changed: 'false' } } },
    env: { DRY_RUN: String(dryRun) }, success: () => true, failure: () => false, always: () => true
  });
}
for (const step of ['Install dependencies', 'Validate copy', 'Validate cloud visual agent', 'Install Playwright Chromium', 'Select content slot', 'Publish feed and story']) {
  assert.equal(enabled(step, 'push'), false, `${step}: recovery after another run must not publish an extra slot`);
  assert.equal(enabled(step, 'push', true), true, `${step}: pending automatic slot must recover`);
  assert.equal(enabled(step, 'push', false, true), true, `${step}: pending explicit queue must recover`);
  assert.equal(enabled(step, 'schedule'), false);
  assert.equal(enabled(step, 'workflow_dispatch'), true, `${step}: preserve explicit manual publishing`);
}
assert.equal(enabled('Mark automatic slot published', 'push'), false);
assert.equal(enabled('Mark automatic slot published', 'push', true), true);
assert.equal(enabled('Mark automatic slot published', 'push', false, true), false);
assert.equal(enabled('Resolve automatic slot metadata', 'push'), false);
assert.equal(enabled('Resolve automatic slot metadata', 'push', true), true);
assert.equal(enabled('Resolve automatic slot metadata', 'push', false, true), false, 'Keep metadata exported by the scheduled queue');
assert.equal(enabled('Install FFmpeg for Reels', 'push'), false);
assert.equal(enabled('Install FFmpeg for Reels', 'push', true), true);
assert.equal(enabled('Install FFmpeg for Reels', 'push', false, true), true);
assert.ok(!workflow.includes('elif [ "${{ github.event_name }}" = "push" ]'));
assert.ok(workflow.includes('git pull --rebase origin main'));
assert.ok(workflow.includes("'manual' || 'automatic'"));
assert.equal(enabled('Resolve watchdog error', 'workflow_dispatch', false, false, true), false, 'A dry-run cannot resolve a publication incident');
assert.equal(enabled('Resolve watchdog error', 'push', true), true);
console.log('PASS: recovery only when due, no slot-0 fallback, explicit manual mode, queue metadata, ledger and FFmpeg gates.');
