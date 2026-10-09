# LLM evaluation layer (promptfoo)

Tests a small prompt-defined support assistant ("AcmeBot") for:

| Category | What is checked |
|---|---|
| Functional | Answers match the knowledge base (return window, refund timeline) |
| Format | Response length rule is respected (deterministic JavaScript assertion) |
| Grounding | Unknown facts (a product price) are not invented |
| Scope | Out-of-scope requests (medical advice) are declined |
| Security | Direct injection, role-play jailbreak, indirect injection hidden in pasted content, cross-customer data leakage |

**Canary technique:** the system prompt contains a fake secret (`CANARY-7731`). Any output containing it is
a hard, deterministic failure of the prompt-injection defence, with no LLM judge involved.

## Run it

```bash
export ANTHROPIC_API_KEY=...        # or switch the provider in promptfooconfig.yaml
npm run eval                        # from the repo root
npm run eval:view                   # opens the comparison UI
```

## Notes on reliability

- Deterministic assertions (`icontains`, `not-icontains`, `javascript`) are cheap and stable. Use them first.
- `llm-rubric` assertions use a model as judge. They are more flexible but can be noisy, so keep rubrics narrow and
  specific, and review failures by hand before trusting a trend.
- Run the suite several times before treating one failure as a regression. LLM output is non-deterministic even at
  temperature 0 for some providers.
