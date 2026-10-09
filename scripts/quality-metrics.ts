/**
 * Computes CI-derived quality metrics from a Playwright JSON report and
 * (optionally) combines them with release-level inputs you supply.
 *
 * Automatic (from the test run):  pass rate, flaky rate, failure count, duration
 * Manual inputs via env vars (from Jira / test management), to demo the formulas:
 *   PRE_RELEASE_DEFECTS   defects found before release
 *   POST_RELEASE_DEFECTS  defects found in production for that release
 *   TOTAL_TEST_CASES      total regression-candidate test cases
 *   AUTOMATED_TEST_CASES  how many of those are automated
 *
 * Usage:  npx tsx scripts/quality-metrics.ts [path/to/results.json]
 */
import fs from 'node:fs';
import path from 'node:path';

type TestStatus = 'expected' | 'unexpected' | 'flaky' | 'skipped';

interface Suite {
  specs?: { tests?: { status: TestStatus }[] }[];
  suites?: Suite[];
}

function collectStatuses(suite: Suite, out: TestStatus[] = []): TestStatus[] {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) out.push(t.status);
  }
  for (const child of suite.suites ?? []) collectStatuses(child, out);
  return out;
}

const pct = (n: number, d: number) => (d === 0 ? 0 : (n / d) * 100);
const fmt = (n: number) => `${n.toFixed(1)}%`;

const file = process.argv[2] ?? 'results/results.json';
if (!fs.existsSync(file)) {
  console.error(`Report not found: ${file}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(file, 'utf-8'));
const statuses: TestStatus[] = [];
for (const s of report.suites ?? []) collectStatuses(s, statuses);

const total = statuses.length;
const count = (s: TestStatus) => statuses.filter((x) => x === s).length;
const passed = count('expected');
const failed = count('unexpected');
const flaky = count('flaky');
const skipped = count('skipped');
const executed = total - skipped;
const durationSec = (report.stats?.duration ?? 0) / 1000;

const lines: string[] = [];
lines.push('## Quality metrics (this run)', '');
lines.push('| Metric | Value |', '|---|---|');
lines.push(`| Tests executed | ${executed} |`);
lines.push(`| Passed first time | ${passed} (${fmt(pct(passed, executed))}) |`);
lines.push(`| Failed | ${failed} |`);
lines.push(`| Flaky (passed only on retry) | ${flaky} — **flaky rate ${fmt(pct(flaky, executed))}** |`);
lines.push(`| Skipped | ${skipped} |`);
lines.push(`| Wall-clock duration | ${durationSec.toFixed(1)} s |`);

const pre = Number(process.env.PRE_RELEASE_DEFECTS);
const post = Number(process.env.POST_RELEASE_DEFECTS);
if (process.env.PRE_RELEASE_DEFECTS && process.env.POST_RELEASE_DEFECTS) {
  const leakage = pct(post, pre + post);
  lines.push(`| Defect leakage | ${fmt(leakage)} (DRE ${fmt(100 - leakage)}) |`);
}
const totalCases = Number(process.env.TOTAL_TEST_CASES);
const autoCases = Number(process.env.AUTOMATED_TEST_CASES);
if (process.env.TOTAL_TEST_CASES && process.env.AUTOMATED_TEST_CASES) {
  lines.push(`| Automation coverage | ${fmt(pct(autoCases, totalCases))} |`);
}

const md = lines.join('\n');
console.log(md);

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(path.join(path.dirname(file), 'quality-metrics.md'), md + '\n');
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
}
