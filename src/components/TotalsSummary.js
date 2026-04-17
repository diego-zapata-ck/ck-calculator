import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency, calculateTacticCost } from "../constants";

export default function TotalsSummary({ totals, selectedTactics }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Get execution term from the selected execution variant
  const getExecutionTerm = () => {
    const execEntry = Object.values(selectedTactics).find(
      (e) => e.tactic.Type === "Execution" && e.tactic.Variants?.length > 0
    );
    if (execEntry?.config?.selectedVariantName) {
      const variant = execEntry.tactic.Variants.find(
        (v) => v.Name === execEntry.config.selectedVariantName
      );
      return variant?.Duration_Months || null;
    }
    return null;
  };

  // Compute display values
  const auditingRaw = totals.typeTotals?.Auditing?.cost || 0;
  const auditSavings = totals.auditingCommonSubtaskSavingsCostDisplay || 0;
  const auditingCost = auditingRaw - auditSavings; // post-savings so math adds up
  const strategyCost = totals.typeTotals?.Strategy?.cost || 0;
  const executionMonthly = (totals.typeTotals?.Execution?.monthlyCost || 0) + (totals.typeTotals?.Technology?.monthlyCost || 0);
  const executionTerm = getExecutionTerm();

  // Relationship is Execution type but flat (no variants), calculate its one-off cost
  const relationshipCost = Object.values(selectedTactics)
    .filter((e) => e.tactic.Type === "Execution" && !e.tactic.Variants?.length)
    .reduce((sum, e) => sum + (e.cost || 0), 0);

  // Build rows
  const rows = [];
  if (auditingCost > 0) rows.push({ key: "Auditing", label: "Auditing", cost: auditingCost, types: ["Auditing"] });
  const strategyTotal = strategyCost + relationshipCost;
  if (strategyTotal > 0) rows.push({ key: "Strategy", label: "Strategy", subtitle: "Per Annum", cost: strategyTotal, types: ["Strategy", "__relationship__"] });
  if (executionMonthly > 0) rows.push({ key: "Execution", label: "Execution", subtitle: "Monthly", cost: executionMonthly, types: ["Execution", "Technology"], isMonthly: true });

  if (rows.length === 0) return null;

  return (
    <div className="mt-8">
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: "#25B1A2", fontFamily: "Lato, sans-serif" }}
      >
        Total Investment:
      </h3>

      <div className="p-5" style={{ backgroundColor: "rgba(230, 231, 244, 0.37)", borderRadius: 17 }}>
        {/* Investment rows */}
        <div className="space-y-0">
          {rows.map((row) => (
            <div key={row.key}>
              <button
                onClick={() => toggleGroup(row.key)}
                className="w-full flex items-center justify-between py-3 hover:bg-white/30 rounded px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                    {row.label}
                  </span>
                  {row.subtitle && (
                    <span className="text-xs font-normal" style={{ color: "#B7B7B7" }}>
                      ({row.subtitle})
                    </span>
                  )}
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{ color: "#B7B7B7" }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                  ${formatCurrency(row.cost)}
                </span>
              </button>

              {expandedGroups[row.key] && (
                <div className="pl-4 pb-2">
                  {Object.values(selectedTactics)
                    .filter((entry) => {
                      const isFlatExecution = entry.tactic.Type === "Execution" && !entry.tactic.Variants?.length;
                      // Flat Execution (Relationship) goes under Strategy, not Execution
                      if (isFlatExecution) return row.key === "Strategy";
                      return row.types.includes(entry.tactic.Type);
                    })
                    .map((entry) => {
                      const tacticResult = calculateTacticCost(entry.tactic, entry.config);
                      let lineCost = tacticResult.cost;
                      if (row.isMonthly && tacticResult.monthlyCost) {
                        lineCost = tacticResult.monthlyCost;
                      } else if (row.isMonthly && entry.tactic.fixedMonthlyCost) {
                        lineCost = entry.tactic.fixedMonthlyCost;
                      }
                      if (lineCost === 0) return null;
                      return (
                        <div
                          key={entry.tactic.ID}
                          className="flex justify-between py-1 text-xs"
                          style={{ color: "#494949" }}
                        >
                          <span>{entry.tactic.displayName || entry.tactic.Name}</span>
                          <span>${formatCurrency(lineCost)}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}

          {/* Execution Term row */}
          {executionTerm && (
            <div className="flex items-baseline justify-between py-3 px-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                  Execution Term
                </span>
                <span className="text-xs font-normal" style={{ color: "#B7B7B7" }}>
                  (Months)
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: "#171C38" }}>
                {executionTerm}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="my-2" style={{ borderColor: "rgba(23, 28, 56, 0.15)" }} />

        {/* Total Investment */}
        <div className="flex justify-between items-baseline py-3 px-2">
          <span className="text-sm font-bold" style={{ color: "#171C38" }}>
            Total Investment:
          </span>
          <span className="text-base font-bold" style={{ color: "#171C38" }}>
            ${formatCurrency(totals.totalCost)}
          </span>
        </div>

        {/* Savings */}
        {totals.totalSavingsCost > 0 && (
          <div
            className="mt-2 p-4"
            style={{
              backgroundColor: "rgba(37, 177, 162, 0.06)",
              borderRadius: 12,
              border: "1px solid rgba(37, 177, 162, 0.15)",
            }}
          >
            {auditSavings > 0 && (
              <div className="flex justify-between items-baseline py-1 px-1">
                <span className="text-sm" style={{ color: "#25B1A2" }}>
                  Audit Savings:
                </span>
                <span className="text-sm font-medium" style={{ color: "#25B1A2" }}>
                  ${formatCurrency(auditSavings)}
                </span>
              </div>
            )}
            {totals.croSpecificSavingsCost > 0 && (
              <div className="flex justify-between items-baseline py-1 px-1">
                <span className="text-sm" style={{ color: "#25B1A2" }}>
                  Retainer Discount:
                </span>
                <span className="text-sm font-medium" style={{ color: "#25B1A2" }}>
                  ${formatCurrency(totals.croSpecificSavingsCost)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-baseline py-1 px-1">
              <span className="text-sm font-bold" style={{ color: "#25B1A2" }}>
                Total Saving:
              </span>
              <span className="text-sm font-bold" style={{ color: "#25B1A2" }}>
                ${formatCurrency(totals.totalSavingsCost)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
