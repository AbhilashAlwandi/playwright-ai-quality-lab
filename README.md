# playwright-ai-quality-lab

A small, end-to-end quality-engineering portfolio project covering three things interviewers ask about:

1. **Test automation at scale:** Playwright + TypeScript (UI and API), Page Object Model, parallel execution and CI sharding.
2. **Quality metrics:** flaky rate, first-attempt pass rate and duration computed automatically in CI, plus a
   one-page [dashboard design](docs/quality-dashboard-design.md) with defect leakage, DRE and automation coverage.
3. **AI-system testing:** an LLM evaluation suite ([promptfoo](llm-eval)) covering functional accuracy, hallucination,
   scope, and prompt-injection / data-leakage checks (including a canary-token technique).

## Architecture

```
push / PR / nightly
        │
        ▼
 GitHub Actions ──► test job (2 shards, 4 workers each, retries=2)
        │                 └─► blob reports
        ├──► report job: merge shards ─► HTML report + JSON ─► scripts/quality-metrics.ts ─► job summary
        └──► llm-eval job: promptfoo ─► pass/fail per assertion ─► results artifact
```

## Run locally

```bash
npm install
npx playwright install chromium
npm test                 # all projects
npm run report           # open the HTML report
npm run metrics          # compute metrics from results/results.json
export ANTHROPIC_API_KEY=...   # or change the provider in llm-eval/promptfooconfig.yaml
npm run eval
```

Add `ANTHROPIC_API_KEY` as a repository secret to enable the `llm-eval` CI job.

## Design decisions

- **Retries in CI are intentional.** They keep the pipeline green *and* surface flaky tests through the "flaky" status,
  which is the input to the flaky-rate metric. Retries without measurement just hide the problem.
- **Deterministic assertions before LLM judges.** The prompt-injection tests use a canary string, so a leak is a hard
  failure with no judge involved. LLM-as-judge rubrics are used only where meaning matters.
- **Sharded runs with merged reports** show how the suite scales as it grows, even though it is small today.
- **Defect leakage and automation coverage** come from Jira and a test-management tool in real life; the script
  accepts them as inputs to demonstrate the formulas.

## Honest limitations

- The UI/API targets are public practice sites (saucedemo.com, jsonplaceholder), not a production system.
- The "LLM app" is a prompt-defined assistant, not a deployed RAG service. Extending it with retrieval, a real vector
  store and RAG-specific metrics (faithfulness, context precision) is a natural next step.
- Metric targets in the dashboard design are illustrative.

## Next steps

Visual regression, accessibility checks (axe), contract tests, a RAG evaluation with RAGAS or DeepEval, and a
Grafana/Power BI dashboard fed by the JSON output.
