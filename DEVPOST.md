# Devpost submission copy

## Project name

**GrossHacker AI — LTV & ARPU Tracker**

Tagline: **From mobile revenue signals to safe marketing action.**

## About the project

### 💡 Inspiration

As indie game developers and startup founders, we love shipping mobile products—but post-launch growth decisions are still painfully manual. Product behavior lives in GA4 or PostHog, purchase events live in the app backend, and campaign spend lives across ad platforms. By the time those CSVs are reconciled, the budget decision is already late.

The hardest question is also the most important: **Did this campaign acquire users who actually increased ARPU enough to justify more spend?** Large studios answer it with dedicated data and growth teams. Indie teams are usually left comparing dashboards and guessing.

We built GrossHacker AI to close that gap. It turns mobile telemetry and acquisition spend into one cohort-level economic model, explains what changed, and routes the result into a guarded marketing action.

### 🛠️ How we built it

- **FastAPI ingestion:** A lightweight asynchronous API accepts normalized install, session, purchase, subscription, and ad-revenue events. Event IDs are idempotent so retries do not double-count revenue.
- **Cohort analytics:** Campaign spend and attributed app events are reconciled into cohort ARPU, CAC, ROAS, early retention, observed LTV, and a transparent LTV90 projection.
- **Explainable decision engine:** Each campaign receives a `Scale`, `Hold`, `Reduce`, or `Pause` recommendation based on LTV:CAC, retention, sample size, and attribution coverage.
- **Safe automation layer:** Recommendations pass through human approval, daily budget limits, confidence checks, and an audit log. The hackathon version applies changes to simulated campaigns; the same action boundary is designed for Meta, Google, or AppLovin OAuth adapters.
- **React operator dashboard:** A responsive, high-scannability interface shows the daily growth brief, cohort evidence, data-source health, automation queue, and action history.

The product reflects Minsoo’s real development experience across **FastAPI**, **React/React Native**, and event observability with tools such as **GA4 and PostHog**. Rather than treating analytics and automation as separate products, GrossHacker makes them one traceable workflow.

### 🚀 Challenges and learnings

The biggest challenge was making metrics from different systems comparable. A marketing platform sees attribution IDs and spend; the app sees users, sessions, and revenue. We defined one normalized event contract and one explicit metric contract so every dashboard number reconciles to the same cohort.

The second challenge was automation safety. A model that can recommend spend changes should not silently spend money. We designed the system around reversible actions: confidence thresholds, attribution-coverage checks, a ±20% daily guardrail, operator approval, and an audit trail. That made the “AI” more useful because every recommendation is explainable.

We also learned to distinguish **observed ARPU lift** from causality. GrossHacker identifies where a cohort outperforms its baseline, but it does not claim that marketing caused the lift without an experiment.

### 🎯 What’s next

Next, we will replace the demo adapters with production connectors for PostHog/GA4, attribution providers, Meta Ads, Google Ads, and AppLovin. Mature cohort histories will train a calibrated model that predicts 90-day LTV with confidence intervals from the first three to seven days of behavior.

The long-term goal is a safe growth autopilot for small studios: detect a profitable cohort early, scale it within operator-defined limits, reduce waste, and keep every decision auditable.

## Built with

FastAPI, React, TypeScript, Vite, Python, REST API, Mobile Analytics, PostHog, Google Analytics 4, Cohort Analysis, ARPU, LTV Forecasting, ROAS Optimization, Growth Automation, React Native, Mobile Games

## Try it out

- GitHub repository: `https://github.com/your-username/ltv-arpu-tracker`
- Live demo: `https://your-demo-url.example`
- API docs: `https://your-api-url.example/docs`

## Video demo outline

1. Open **Overview** and explain the daily growth brief and ARPU/LTV/ROAS contract.
2. Compare the three acquisition cohorts and call out attribution coverage.
3. Open **Automation** to show ingest → analyze → guardrail → activate.
4. Review the top `Scale` action, show its evidence and confidence, and approve it.
5. Open **Activity** to prove the simulated budget change was recorded.
6. End on **Data Sources** and explain how PostHog/GA4 and ad-network OAuth adapters complete the production path.

