# CK Service Cost Calculator

React-based calculator for Conversion Kings service pricing.

## Calculation Logic

### Base Formula

```
cost = base_hours × $240/hr
```

Every service has a **base hours** value. The hourly rate is $240.

### Adjustments

Services can have configurable adjustments that add hours:

| Type | Behaviour |
|------|-----------|
| `per_unit` | `extra_hours = quantity × hours_per_unit` |
| `fixed_increase` | Adds a fixed number of hours when a condition is toggled on |
| `threshold` | Same as per_unit, used for lead-gen event scaling |

**Special case — Conversion Review (ID 13):**
Uses a multiplicative model. Base includes 2 personas × 2 journeys = 4 combinations. Adding personas/journeys scales as:

```
extra_hours = (2 + extra_personas) × (2 + extra_journeys) - 4
```

### Variants (Execution services)

Execution services (e.g. CRO retainers) use variants with monthly hours and duration:

```
total_hours = monthly_hours × duration_months
cost = total_hours × $240 × (1 - retainer_discount)
```

Retainer discounts scale by commitment:

| Duration | 40 hrs/mo | 60 hrs/mo | 80 hrs/mo |
|----------|-----------|-----------|-----------|
| 6 months | 0% | 1% | 2.5% |
| 12 months | 2.5% | 4% | 5% |
| 24 months | 5% | 7.5% | 10% |

### Fixed Monthly Cost

Technology services (e.g. Optimisation software) have a flat `fixedMonthlyCost` instead of hourly pricing.

### Savings

Total savings come from three sources:

1. **Shared sub-task deduplication** — Common sub-tasks (QA, Account Management, etc.) across multiple selected services are only charged once. Duplicates are deducted.
2. **Retainer discounts** — Longer/larger execution commitments reduce hourly cost (see table above).
3. **General discount** — Optional percentage discount applied to the total after shared-task savings.

### Packages

Three pre-built packages auto-select a set of services:
- **Essentials** — Core audit services
- **Pro** — Essentials + strategy + customer insights
- **Enterprise** — Full suite including execution

## Tech Stack

- React 19 + Create React App
- Tailwind CSS 3.4
- Lucide React (icons)

## Development

```bash
npm install
npm start        # localhost:3000
npm run build    # production build
```
