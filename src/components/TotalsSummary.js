import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "../constants";

const INVESTMENT_GROUPS = [
  { key: "Auditing", label: "Auditing", types: ["Auditing"] },
  { key: "Strategy", label: "Strategy", types: ["Strategy"] },
  { key: "Execution", label: "Execution", types: ["Execution"], suffix: "/ month" },
  { key: "Technology", label: "Technology", types: ["Technology"], suffix: "/ month" },
];

export default function TotalsSummary({ totals, selectedTactics }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const getGroupCost = (group) => {
    let cost = 0;
    group.types.forEach((type) => {
      if (totals.typeTotals && totals.typeTotals[type]) {
        cost += totals.typeTotals[type].cost;
      }
    });
    return cost;
  };

  const activeGroups = INVESTMENT_GROUPS.filter(
    (group) => getGroupCost(group) > 0,
  );

  if (activeGroups.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-tertiary-text mb-4">Investment</h3>

      <div className="p-5" style={{ backgroundColor: 'rgba(230, 231, 244, 0.37)', borderRadius: 17 }}>
        <div className="space-y-1">
          {activeGroups.map((group) => {
            const cost = getGroupCost(group);
            return (
              <div key={group.key}>
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between py-2 hover:bg-white/30 rounded px-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800">
                      {group.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        expandedGroups[group.key] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    ${formatCurrency(cost)}
                    {group.suffix && (
                      <span className="font-normal text-gray-500">
                        {" "}
                        {group.suffix}
                      </span>
                    )}
                  </span>
                </button>

                {expandedGroups[group.key] && (
                  <div className="pl-4 pb-1">
                    {Object.values(selectedTactics)
                      .filter((entry) => group.types.includes(entry.tactic.Type))
                      .map((entry) => {
                        const entryCost = entry.cost || 0;
                        if (entryCost === 0) return null;
                        return (
                          <div
                            key={entry.tactic.ID}
                            className="flex justify-between py-1 text-xs text-gray-500"
                          >
                            <span>{entry.tactic.displayName || entry.tactic.Name}</span>
                            <span>${formatCurrency(entryCost)}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totals.totalSavingsCost > 0 && (
          <div className="mt-3 pt-3 flex justify-between items-baseline px-2" style={{ borderTop: '1px solid rgba(230, 231, 244, 0.8)' }}>
            <span className="text-sm font-bold" style={{ color: '#3D4A97', lineHeight: '130%' }}>
              Total savings
            </span>
            <span className="text-sm font-bold" style={{ color: '#3D4A97', lineHeight: '130%' }}>
              ${formatCurrency(totals.totalSavingsCost)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
