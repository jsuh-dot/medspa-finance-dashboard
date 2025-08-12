# Medspa Finance Dashboard — Vite + React + Tailwind

A medspa financial dashboard that merges Actuals and Budget CSVs, computes derived metrics, and visualizes KPIs and trends.

## Open in StackBlitz
After you push this repo to GitHub, replace `YOUR_GITHUB_USERNAME` below (and repo name if you change it), then click:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jsuh-dot/medspa-finance-dashboard?file=index.html)

## Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jsuh-dot/medspa-finance-dashboard)

## Quick Start (Local)
```bash
npm i
npm run dev
```

## Data Format
- Merge on `Month` (YYYY-MM preferred). Columns are `<Metric>_Actual` / `<Metric>_Budget`.
- Supported metrics include: Beauty Rev, Infusion Rev, Membership Rev, Store Rev, Tech Rev, Wellness Rev, Total Rev, COGS, Gross Margin %, Sales & Marketing, R&D, G&A, OpEx, EBITDA, EBITDA Margin, Customers, New Customers, Churn Rate, CAC, LTV, NRR %, GRR %, Magic Number, Rule of 40, YoY Growth.
- If derived metrics are missing, they’re computed:
  - **Revenue** resolves to `Revenue` if present, else `Total Rev`, else sum of the six revenue categories.
  - **Gross Margin %** = 1 – (COGS / Revenue)
  - **OpEx** = Sales & Marketing + R&D + G&A
  - **EBITDA** = Revenue – COGS – OpEx
  - **EBITDA Margin** = EBITDA / Revenue
  - **Rule of 40** = YoY Growth + EBITDA Margin

## What’s Inside
- KPI cards with 12‑month sparklines and green/red budget badges
- Charts: 6 revenue categories, Revenue vs COGS vs OpEx, Gross Margin %, CAC vs LTV, EBITDA & EBITDA Margin
- Variance table with absolute and % deltas (cost/churn invert for “favorable”)

## Notes
- Vite serves `/public` at the root → the app fetches `/actuals.csv` and `/budget.csv`.
- Tailwind + Chart.js + PapaParse are preconfigured.
