# ExFlow CFO ROI Calculator

A public-facing, CFO-oriented AP automation business case calculator for ExFlow in Microsoft Dynamics 365.

The model is a four-module, scenario-driven ROI engine covering:

1. Cost Efficiency & Productivity
2. Cash & Working Capital
3. Accuracy, Control & Risk
4. Resource Reallocation

All assumptions are surfaced and adjustable. The calculator produces 3-year ROI, IRR, NPV, payback period, value-stream breakdowns, and Base / Expected / Upside scenario comparisons.

At benchmark inputs, the Expected scenario is calibrated to the source business-case model:

- 3-year ROI: ~498%
- NPV: ~$6.8M
- Payback: ~1.3 years

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
