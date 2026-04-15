import { formatCurrency, formatHoursToMinutes } from "../constants";

const INVESTMENT_GROUPS = [
  { key: "Auditing", label: "Auditing", types: ["Auditing"] },
  { key: "Strategy", label: "Strategy", types: ["Strategy"] },
  { key: "Execution", label: "Execution", types: ["Execution"], suffix: "/ month" },
  { key: "Technology", label: "Technology", types: ["Technology"], suffix: "/ month" },
];

function getItemDetail(entry) {
  const { tactic, config, hours } = entry;

  // Execution variants — e.g. "3 months x 60 hrs/month"
  if (tactic.Variants?.length > 0 && config.selectedVariantName) {
    const variant = tactic.Variants.find((v) => v.Name === config.selectedVariantName);
    if (variant?.Duration_Months && variant?.Monthly_Hours) {
      return `${variant.Duration_Months} months × ${variant.Monthly_Hours} hrs/month`;
    }
  }

  // Technology — no detail needed
  if (tactic.fixedMonthlyCost) {
    return null;
  }

  // Conversion review (ID 13) — personas × journeys
  if (tactic.ID === 13) {
    const personas = 2 + (config.additionalpersona || 0);
    const journeys = 2 + (config.numAdditionalUserJourneysMeclabs || 0);
    return `${personas} personas × ${journeys} user journeys`;
  }

  // Services with per_unit adjustments — show what's included
  const details = [];

  if (tactic.Inclusions?.length > 0) {
    details.push(tactic.Inclusions[0]);
  }

  if (tactic.Adjustments?.length > 0) {
    tactic.Adjustments.forEach((adj) => {
      if (adj.Type === "per_unit") {
        const key = adj.Unit.replace(/\s/g, "");
        const extra = config[key] || 0;
        if (extra > 0) {
          details.push(`+${extra} ${adj.Unit}${extra > 1 ? "s" : ""}`);
        }
      }
      if (adj.Type === "fixed_increase" && config[adj.Condition]) {
        details.push(adj.Description.replace(/^Check (to |if |)/, "Incl. "));
      }
    });
  }

  return details.length > 0 ? details.join(" · ") : null;
}

function getGroupDetail(group, items) {
  // Execution group — summarise the variant
  if (group.key === "Execution") {
    const execEntry = items.find((e) => e.tactic.Variants?.length > 0 && e.config.selectedVariantName);
    if (execEntry) {
      const variant = execEntry.tactic.Variants.find((v) => v.Name === execEntry.config.selectedVariantName);
      if (variant) {
        return `${variant.Duration_Months} months × ${variant.Monthly_Hours} hrs/month`;
      }
    }
  }

  // Technology group
  if (group.key === "Technology") {
    return "Monthly subscription";
  }

  // For Auditing/Strategy, show total hours
  const totalHours = items.reduce((sum, e) => sum + (e.hours || 0), 0);
  if (totalHours > 0) {
    return formatHoursToMinutes(totalHours) + " total";
  }

  return null;
}

export default function PrintQuote({ selectedTactics, totals, kickoffDate, onClose }) {
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getGroupCost = (group) => {
    let cost = 0;
    group.types.forEach((type) => {
      if (totals.typeTotals?.[type]) cost += totals.typeTotals[type].cost;
    });
    return cost;
  };

  const activeGroups = INVESTMENT_GROUPS.filter((g) => getGroupCost(g) > 0);
  const totalSelected = Object.keys(selectedTactics).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto print-quote-view">
      {/* Control bar — hidden in print */}
      <div className="print-hide sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10">
        <span className="text-sm text-gray-500">Quote preview</span>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-sm font-semibold text-white rounded-full cursor-pointer"
            style={{ backgroundColor: "#25B1A2" }}
          >
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-full cursor-pointer border"
            style={{ borderColor: "#171C38", color: "#171C38" }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Quote content */}
      <div className="max-w-2xl mx-auto px-10 py-12 print-content">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-2">
          <img src="/icons/Logo.png" alt="Conversion Kings" style={{ height: 32 }} />
          <div className="text-right">
            <p className="text-xs" style={{ color: "#B7B7B7" }}>
              {today}
            </p>
          </div>
        </div>

        {/* Title bar */}
        <div
          className="mt-6 mb-8 px-6 py-5"
          style={{
            background: "linear-gradient(135deg, #171C38 0%, #2A3158 100%)",
            borderRadius: 14,
          }}
        >
          <h1
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Service Quote
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {totalSelected} service{totalSelected !== 1 ? "s" : ""} selected
            </p>
            {kickoffDate && (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Kickoff:{" "}
                <span className="text-white font-medium">
                  {new Date(kickoffDate + "T00:00:00").toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* ── Investment Breakdown ── */}
        <div className="mb-6">
          {activeGroups.map((group, groupIdx) => {
            const cost = getGroupCost(group);
            const items = Object.values(selectedTactics).filter((e) =>
              group.types.includes(e.tactic.Type)
            );
            const groupDetail = getGroupDetail(group, items);

            return (
              <div key={group.key}>
                {/* Group header row */}
                <div
                  className="flex justify-between items-baseline py-3 px-1"
                  style={{ borderBottom: "1px solid #E4E4E4" }}
                >
                  <div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#171C38", fontFamily: "Lato, sans-serif" }}
                    >
                      {group.label}
                    </span>
                    {groupDetail && (
                      <span className="text-xs ml-2" style={{ color: "#B7B7B7" }}>
                        ({groupDetail})
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    ${formatCurrency(cost)}
                    {group.suffix && (
                      <span
                        className="font-normal text-xs ml-1"
                        style={{ color: "#494949" }}
                      >
                        {group.suffix}
                      </span>
                    )}
                  </span>
                </div>

                {/* Line items */}
                {items.map((e) => {
                  const detail = getItemDetail(e);
                  return (
                    <div
                      key={e.tactic.ID}
                      className="flex justify-between items-baseline py-2 px-1 ml-4"
                      style={{ borderBottom: "0.5px solid #F0F0F0" }}
                    >
                      <div>
                        <span className="text-sm" style={{ color: "#494949" }}>
                          {e.tactic.displayName || e.tactic.Name}
                        </span>
                        {detail && (
                          <span className="text-xs ml-2" style={{ color: "#B7B7B7" }}>
                            {detail}
                          </span>
                        )}
                      </div>
                      <span className="text-sm flex-shrink-0" style={{ color: "#494949" }}>
                        ${formatCurrency(e.cost || 0)}
                      </span>
                    </div>
                  );
                })}

                {/* Spacing between groups */}
                {groupIdx < activeGroups.length - 1 && <div className="h-3" />}
              </div>
            );
          })}
        </div>

        {/* ── Total Savings ── */}
        {totals.totalSavingsCost > 0 && (
          <div
            className="flex justify-between items-center px-5 py-4 mb-6"
            style={{
              background: "rgba(61, 74, 151, 0.06)",
              borderRadius: 10,
              border: "1px solid rgba(61, 74, 151, 0.15)",
            }}
          >
            <span
              className="text-sm font-bold"
              style={{ color: "#3D4A97", fontFamily: "Lato, sans-serif" }}
            >
              Total savings
            </span>
            <span className="text-lg font-bold" style={{ color: "#3D4A97" }}>
              ${formatCurrency(totals.totalSavingsCost)}
            </span>
          </div>
        )}

        {/* ── Grand Total ── */}
        <div
          className="flex justify-between items-center px-5 py-4 mb-10"
          style={{
            background: "#25B1A2",
            borderRadius: 10,
          }}
        >
          <span
            className="text-sm font-bold text-white"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Total investment
          </span>
          <span className="text-lg font-bold text-white">
            ${formatCurrency(totals.totalCost)}
          </span>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pt-6" style={{ borderTop: "0.5px solid #E4E4E4" }}>
          <img
            src="/icons/Logo.png"
            alt="Conversion Kings"
            className="mx-auto mb-2"
            style={{ height: 18, opacity: 0.4 }}
          />
          <p className="text-xs" style={{ color: "#B7B7B7" }}>
            conversionkings.com.au
          </p>
        </div>
      </div>
    </div>
  );
}
