# Quality Dashboard — One-Page Design

**Purpose:** give engineering leadership a single, trustworthy view of release readiness and test-suite health, and
trigger decisions (ship, hold, invest) rather than just display numbers.
**Audiences:** CTO/VP Eng (release risk, trend), engineering managers (where to invest), QA and developers (what to fix).

## 1. Headline metrics

| Metric | Formula | Source | Example target* | How it is commonly misread |
|---|---|---|---|---|
| **Defect leakage** | Defects found in production ÷ (defects found pre-release + in production) × 100, per release | Jira (defect type + environment found) | < 10%; trend down | Low leakage can mean weak production monitoring, not good testing. Pair with severity and customer impact. |
| **Defect removal efficiency (DRE)** | 100 − leakage | Jira | > 90% | Same blind spot; also sensitive to how long you wait before counting post-release defects. |
| **Automation coverage** | Automated test cases ÷ total regression-candidate test cases × 100 | Test management + repo | Rising, with critical paths first | A high % of low-value tests is not safety. Report coverage of critical user journeys separately. |
| **Flaky test rate** | Tests that fail then pass on retry ÷ tests executed × 100 | Playwright JSON report (`status: flaky`) | < 2%; trend down | Retries hide flakiness from the red/green view, so track it explicitly or it silently erodes trust in CI. |
| **Pass rate on first attempt** | Tests passing without retry ÷ tests executed × 100 | CI | > 97% | Chasing 100% by deleting hard tests. Review removals. |
| **Mean time to detect / fix (escaped defects)** | Time from introduction (or release) to detection; detection to fix | Jira + git | Trend down | Averages hide outliers. Show median and P90. |
| **Suite duration** | Wall-clock time of the full run in CI | CI | < 15 min for PR gate | Speed bought by dropping coverage. |

*Targets are illustrative starting points, to be agreed with the team, not universal standards.

## 2. Dashboard layout

1. **Release readiness banner (top):** GREEN / AMBER / RED for the release candidate, with the single reason ("2 open S1 defects", "flaky rate 6.1%").
2. **Trend row:** leakage by release (last 6), flaky rate by week, first-attempt pass rate by day.
3. **Risk panel:** open defects by severity and age; critical-journey automation coverage; areas with recent change but low coverage.
4. **Suite health panel:** slowest tests, top 10 flaky tests (with owner), duration trend.
5. **Footer:** data freshness timestamp and metric definitions link. A number nobody can define is a number nobody trusts.

## 3. Release gate rules (example)

- **RED (block):** any open S1/S2 in release scope, or critical-journey tests failing, or first-attempt pass rate < 90%.
- **AMBER (go/no-go meeting):** flaky rate > 3%, or leakage on the previous release > target, or coverage drop on changed modules.
- **GREEN:** none of the above.
A human makes the final call; the dashboard makes the trade-off explicit and auditable.

## 4. Data pipeline

CI (Playwright JSON via `scripts/quality-metrics.ts`) and Jira (defect exports/API) feed a small store; a BI tool
(Power BI, Grafana, or Datadog dashboards) renders it. Production signals (Datadog RUM/synthetics, error rates) feed the
leakage context.

## 5. Operating cadence

- **Per PR / nightly:** suite health and flaky rate (automatic).
- **Weekly:** flaky-test review, with owners assigned and time-boxed fixes.
- **Per release:** leakage and DRE computed once the post-release window closes (e.g. 2 weeks).
- **Quarterly:** revisit targets and retire metrics nobody acts on.

## 6. Principles

- Every metric has an owner, a definition, and an action it triggers.
- Show trends and distributions, not single points.
- Never use these metrics to rank individuals. It guarantees gaming.
