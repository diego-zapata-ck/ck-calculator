# CK Service Cost Calculator

Interactive calculator for Conversion Kings service pricing. Clients select services, configure options, and generate a professional PDF quote.

## Getting Started

```bash
git clone https://github.com/diego-zapata-ck/ck-calculator.git
cd ck-calculator
npm install
npm start
```

Opens at [localhost:3000](http://localhost:3000). Requires **Node.js 18+**.

## Features

- **Package selector** — Essentials, Pro, or Enterprise pre-selects a bundle of services
- **Service cards** — Toggle individual services on/off, expand for config options
- **Show/Hide costs & hours** — Toggle buttons to control what's visible
- **Order summary sidebar** — Live summary of selected services grouped by category
- **Quote preview** — Clean, printable investment summary (Print / Save as PDF)
- **Investment breakdown** — Totals grouped by type (Auditing, Strategy, Execution, Technology)
- **Savings engine** — Automatic deductions from shared sub-tasks, retainer discounts, and general discounts

## Calculation Logic

### Base Formula

```
cost = base_hours x $240/hr
```

### Adjustments

| Type | Behaviour | Example |
|------|-----------|---------|
| `per_unit` | `quantity x hours_per_unit` | Additional pages in Technical Audit |
| `fixed_increase` | Fixed hours when toggled on | Lead gen report in Baseline Performance |

**Conversion Review** uses a multiplicative model (2 personas x 2 journeys base):

```
extra_hours = (2 + extra_personas) x (2 + extra_journeys) - 4
```

### Execution Variants

Retainers are priced by commitment (months x hours/month) with scaling discounts:

| Duration | 40 hrs/mo | 60 hrs/mo | 80 hrs/mo |
|----------|-----------|-----------|-----------|
| 3 months | 2.5% | 1% | 0% |
| 6 months | 0% | 1% | 2.5% |
| 12 months | 2.5% | 4% | 5% |
| 24 months | 5% | 7.5% | 10% |

> **Note:** This table needs review — 3 months @ 40hrs (2.5%) is higher than 6 months @ 40hrs (0%), which is counterintuitive.

### Fixed Monthly Cost

Technology services (Optimisation software) use a flat `$500/month` instead of hourly pricing.

### Savings Sources

1. **Shared sub-tasks** — Common tasks (QA, Account Management, etc.) charged once across multiple services
2. **Retainer discounts** — Longer/larger commitments reduce cost (table above)
3. **General discount** — Optional percentage off the total

## Project Structure

```
src/
  App.js              — Main layout, state management
  data.js             — Service definitions (hours, adjustments, variants)
  constants.js        — Pricing logic, totals calculation, hourly rate
  components/
    Header.js         — Logo + title
    PackageSelector.js — Essentials / Pro / Enterprise cards
    ServiceCard.js    — Individual service toggle + config
    OrderSummary.js   — Sidebar with selected services
    TotalsSummary.js  — Investment breakdown by type
    PrintQuote.js     — Professional quote preview for PDF
    Footer.js         — Kickoff date, quote & share buttons
public/
  icons/ck-images/    — Service icon images (see order.txt for mapping)
```

## Tech Stack

- React 19 + Create React App
- Tailwind CSS 3.4
- Lucide React (icons)
- Google Fonts: Inter (body), Lato (headings)
