# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-07-17
- Primary product surfaces: Growth overview dashboard, cohort performance table, campaign action queue, event-ingestion API.
- Evidence reviewed: The repository was empty. Product direction came from the user brief: connect post-launch mobile-app telemetry and marketing spend, detect ARPU movement automatically, and recommend or trigger marketing actions.

## Brand
- Personality: Decisive, analytical, calm, operator-focused.
- Trust signals: Explicit metric definitions, visible confidence/guardrails, explainable recommendations, last-sync status.
- Avoid: Casino-like growth visuals, unexplained AI claims, vanity charts, neon-on-black hacker clichés.

## Product goals
- Goals: Give an indie mobile-app operator one place to understand whether acquisition spend is producing profitable users; surface ARPU/LTV/ROAS changes; turn findings into safe campaign actions.
- Non-goals: Full attribution-provider replacement, autonomous production ad-spend changes without approval, or a universal BI builder.
- Success signals: A user can identify the strongest cohort, understand why, and approve a budget action in under two minutes.

## Personas and jobs
- Primary personas: Indie mobile-game developer, growth-minded founder, small studio marketer.
- User jobs: Monitor revenue quality after launch, compare acquisition cohorts, catch deterioration early, decide where to reduce or increase budget.
- Key contexts of use: Daily desktop check-in; post-campaign review; incident investigation after a revenue or retention drop.

## Information architecture
- Primary navigation: Overview, Cohorts, Automation, Integrations.
- Core routes/screens: The MVP is a single responsive overview with anchored sections and an action-review drawer/modal.
- Content hierarchy: Business health and recommendation first; KPI movement second; trend context third; cohort evidence and integration health last.

## Design principles
- Decision before decoration: Every chart or number should support an operator action.
- Explain the model: Recommendations always include evidence, expected impact, confidence, and a reversible action.
- Progressive depth: The top layer is scannable; tables and metric definitions carry audit detail.
- Tradeoffs: Prefer clarity and safe approval gates over maximum dashboard density or fully autonomous execution.

## Visual language
- Color: Warm off-white canvas, ink/navy text, restrained emerald for healthy growth, amber for watch states, coral for decline, blue-violet for selected/AI states.
- Typography: Inter-compatible system sans for interface; tabular numerals for metrics.
- Spacing/layout rhythm: 4/8px base, 24px card padding, generous 28–32px section gaps.
- Shape/radius/elevation: 16–24px radii, thin cool-gray borders, soft low-opacity shadows.
- Motion: 150–220ms state transitions; no decorative continuous motion.
- Imagery/iconography: Small line icons and data marks only; no stock imagery.

## Components
- Existing components to reuse: None; greenfield repository.
- New/changed components: App shell, health summary, KPI card, metric trend chart, cohort table, recommendation card, integration chip, action-review modal, toast.
- Variants and states: Positive/negative/neutral metrics; high/medium/low confidence; proposed/approved/paused actions.
- Token/component ownership: CSS custom properties in the frontend global stylesheet; view components in the React app.

## Accessibility
- Target standard: WCAG 2.2 AA where practical for the MVP.
- Keyboard/focus behavior: All navigation, filters, and actions must be reachable with visible focus rings; modal traps intent through semantic dialog structure and Escape close.
- Contrast/readability: Never communicate change with color alone; pair color with arrow, sign, label, or status copy.
- Screen-reader semantics: Semantic landmarks, table headers, button labels, live-region feedback for approved actions.
- Reduced motion and sensory considerations: Respect `prefers-reduced-motion`; avoid flashing and motion-only status.

## Responsive behavior
- Supported breakpoints/devices: Desktop-first analytics at 1280px+, usable tablet at 768px+, compact stacked mobile at 360px+.
- Layout adaptations: Sidebar becomes top bar; KPI grid collapses 4→2→1; chart legend wraps; tables scroll horizontally.
- Touch/hover differences: Minimum 44px touch targets; hover is enhancement only.

## Interaction states
- Loading: Skeleton blocks matching final geometry.
- Empty: Explain which integration or sample event unlocks the view.
- Error: Preserve cached/sample context and show a retry action.
- Success: Toast and persistent action status update.
- Disabled: Explain missing threshold, permission, or integration.
- Offline/slow network, if applicable: Demo data remains visible with a “sample data” disclosure.

## Content voice
- Tone: Concise growth-operator language; confident but never absolute.
- Terminology: Define ARPU, predicted LTV, ROAS, retention, and cohort at first meaningful use.
- Microcopy rules: Lead with the decision (“Scale”, “Hold”, “Pause”); follow with evidence and estimated impact.

## Implementation constraints
- Framework/styling system: React + TypeScript + Vite frontend; FastAPI backend; plain CSS tokens to keep the MVP dependency-light.
- Design-token constraints: Use named semantic tokens rather than raw colors inside components.
- Performance constraints: Initial dashboard should remain lightweight and avoid heavyweight chart libraries.
- Compatibility constraints: Current evergreen browsers; backend uses Python 3.11+.
- Test/screenshot expectations: Analytics calculations require unit tests; frontend must pass TypeScript/build checks; final UI receives a browser smoke check when runtime permits.

## Open questions
- [ ] Which attribution and ad network should be the first production integration (AppsFlyer/Adjust, Meta, Google Ads, AppLovin)? / Product owner / Determines auth and schema.
- [ ] What spend-change ceiling can automation approve without a human? / Product owner / Determines production safety gate.
- [ ] Is subscription revenue in scope alongside IAP/ad revenue? / Product owner / Affects LTV model and event taxonomy.
