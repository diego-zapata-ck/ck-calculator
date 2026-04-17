import { useState } from "react";
import { Check } from "lucide-react";
import { formatCurrency, formatHoursToMinutes, calculateTacticCost } from "../constants";

const INVESTMENT_GROUPS = [
  { key: "Auditing", label: "Auditing", types: ["Auditing"] },
  { key: "Strategy", label: "Strategy", types: ["Strategy"] },
  { key: "Execution", label: "Execution", types: ["Execution"], suffix: "/ month" },
  { key: "Technology", label: "Technology", types: ["Technology"], suffix: "/ month" },
];

function getItemDetail(entry) {
  const { tactic, config } = entry;

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

  // Conversion review (ID 13) — personas only
  if (tactic.ID === 13) {
    const personas = 2 + (config.additionalpersona || 0);
    return `${personas} personas analysed`;
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

export default function PrintQuote({ selectedTactics, totals, kickoffDate, clientDetails, onClose, onShare }) {
  const [copied, setCopied] = useState(false);
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getGroupCost = (group) => {
    let cost = 0;
    group.types.forEach((type) => {
      if (totals.typeTotals?.[type]) {
        if (group.suffix && totals.typeTotals[type].monthlyCost) {
          cost += totals.typeTotals[type].monthlyCost;
        } else {
          cost += totals.typeTotals[type].cost;
        }
      }
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
            onClick={async () => {
              if (onShare) await onShare();
              if (!navigator.share) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-full cursor-pointer transition-all"
            style={{
              border: "1.5px solid #171C38",
              color: "#171C38",
              backgroundColor: copied ? "rgba(23, 28, 56, 0.04)" : "white",
            }}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Link copied
              </>
            ) : (
              "Share quote"
            )}
          </button>
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

        {/* Client details */}
        {(clientDetails?.name || clientDetails?.website) && (
          <div className="mt-4 mb-2">
            {clientDetails.name && (
              <p className="text-base font-bold" style={{ color: "#171C38" }}>
                {clientDetails.name}
              </p>
            )}
            {clientDetails.website && (
              <p className="text-sm" style={{ color: "#494949" }}>
                {clientDetails.website}
              </p>
            )}
            {clientDetails.brief && (
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#B7B7B7" }}>
                {clientDetails.brief}
              </p>
            )}
          </div>
        )}

        {/* Title bar */}
        <div
          className="mt-4 mb-8 px-6 py-5"
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
            const items = Object.values(selectedTactics).filter((e) => {
              // Flat Execution services (Relationship) go under Strategy
              if (e.tactic.Type === "Execution" && !e.tactic.Variants?.length) {
                return group.key === "Strategy";
              }
              return group.types.includes(e.tactic.Type);
            });
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
                  const tacticResult = calculateTacticCost(e.tactic, e.config);
                  let lineCost = tacticResult.cost;
                  if (group.suffix && tacticResult.monthlyCost) {
                    lineCost = tacticResult.monthlyCost;
                  } else if (group.suffix && e.tactic.fixedMonthlyCost) {
                    lineCost = e.tactic.fixedMonthlyCost;
                  }
                  // Skip zero-cost items
                  if (lineCost === 0 && e.hours === 0) return null;
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
                        ${formatCurrency(lineCost)}
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

        {/* ── Summary ── */}
        {(() => {
          const auditingRaw = totals.typeTotals?.Auditing?.cost || 0;
          const auditSavings = totals.auditingCommonSubtaskSavingsCostDisplay || 0;
          const auditingCost = auditingRaw - auditSavings;
          const strategyCost = totals.typeTotals?.Strategy?.cost || 0;
          const executionMonthly = totals.typeTotals?.Execution?.monthlyCost || 0;
          const technologyMonthly = totals.typeTotals?.Technology?.monthlyCost || 0;
          const relationshipCost = Object.values(selectedTactics)
            .filter((e) => e.tactic.Type === "Execution" && !e.tactic.Variants?.length)
            .reduce((sum, e) => sum + (e.cost || 0), 0);

          let executionTerm = null;
          const execEntry = Object.values(selectedTactics).find(
            (e) => e.tactic.Type === "Execution" && e.tactic.Variants?.length > 0
          );
          if (execEntry?.config?.selectedVariantName) {
            const variant = execEntry.tactic.Variants.find(
              (v) => v.Name === execEntry.config.selectedVariantName
            );
            if (variant) executionTerm = variant.Duration_Months;
          }

          return (
            <div
              className="px-5 py-4 mb-10 space-y-2"
              style={{ background: "rgba(37, 177, 162, 0.08)", borderRadius: 10, border: "1px solid rgba(37, 177, 162, 0.2)" }}
            >
              {auditingCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-sm" style={{ color: "#494949" }}>Auditing</span>
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    ${formatCurrency(auditingCost)}
                  </span>
                </div>
              )}
              {(strategyCost + relationshipCost) > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-sm" style={{ color: "#494949" }}>
                    Strategy <span className="text-xs" style={{ color: "#B7B7B7" }}>(Per Annum)</span>
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    ${formatCurrency(strategyCost + relationshipCost)}
                  </span>
                </div>
              )}
              {executionMonthly > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-sm" style={{ color: "#494949" }}>
                    Execution <span className="text-xs" style={{ color: "#B7B7B7" }}>(Monthly)</span>
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    ${formatCurrency(executionMonthly)} / month
                  </span>
                </div>
              )}
              {executionTerm && (
                <div className="flex justify-between items-baseline">
                  <span className="text-sm" style={{ color: "#494949" }}>
                    Execution Term <span className="text-xs" style={{ color: "#B7B7B7" }}>(Months)</span>
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    {executionTerm}
                  </span>
                </div>
              )}
              {technologyMonthly > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-sm" style={{ color: "#494949" }}>
                    Technology <span className="text-xs" style={{ color: "#B7B7B7" }}>(Monthly)</span>
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    ${formatCurrency(technologyMonthly)} / month
                  </span>
                </div>
              )}
              <div
                className="flex justify-between items-baseline pt-2 mt-1"
                style={{ borderTop: "1px solid rgba(37, 177, 162, 0.3)" }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "Lato, sans-serif", color: "#25B1A2" }}
                >
                  Total investment
                </span>
                <span className="text-lg font-bold" style={{ color: "#25B1A2" }}>
                  ${formatCurrency(totals.totalCost)}
                </span>
              </div>
            </div>
          );
        })()}

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
