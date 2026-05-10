# Test Suite

## Running Tests

```bash
npm test
```

## Audit Engine Tests (src/lib/audit/__tests__/engine.test.ts)

| Test | File | What it covers |
|------|------|----------------|
| Cursor + Copilot overlap detection | engine.test.ts | Cross-tool rule fires when both tools present |
| Overpaying vs official price | engine.test.ts | GitHub Copilot Individual at $750/mo for 4 seats flags correctly |
| Team plan with <5 seats | engine.test.ts | ChatGPT Team with 3 seats triggers downgrade recommendation |
| API anomaly detection | engine.test.ts | OpenAI API at $600/dev triggers runaway alert |
| Fallback recommendation | engine.test.ts | Single optimal tool still gets general rec |
| Zero spend edge case | engine.test.ts | $0 spend returns 0 savings, no divide-by-zero |
| Annual savings calculation | engine.test.ts | monthlySavings * 12 === annualSavings |
