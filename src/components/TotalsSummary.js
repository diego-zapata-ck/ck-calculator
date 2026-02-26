import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORY_ORDER, formatCurrency } from "../constants";

const INVESTMENT_GROUPS = {
  Auditing: {
    label: "Auditing",
    categories: [
      "Account & project management",
      "Technical review",
      "Data analysis",
      "UX fundamentals",
      "Customer insights",
      "Conversion",
    ],
  },
  Strategy: {
    label: "Strategy",
    categories: ["Strategy"],
  },
  Execution: {
    label: "Execution",
    categories: ["Experimentation"],
    suffix: "/ month",
  },
};

export default function TotalsSummary({ totals, selectedTactics }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const getGroupCost = (group) => {
    let cost = 0;
    group.categories.forEach((cat) => {
      if (totals.categoryTotals[cat]) {
        cost += totals.categoryTotals[cat].cost;
      }
    });
    return cost;
  };

  const activeGroups = Object.entries(INVESTMENT_GROUPS).filter(
    ([, group]) => getGroupCost(group) > 0,
  );

  if (activeGroups.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-tertiary-text mb-4">Investment</h3>

      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
        <div className="space-y-1">
          {activeGroups.map(([key, group]) => {
            const cost = getGroupCost(group);
            return (
              <div key={key}>
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full flex items-center justify-between py-2 hover:bg-purple-100 rounded px-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800">
                      {group.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        expandedGroups[key] ? "rotate-180" : ""
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

                {expandedGroups[key] && (
                  <div className="pl-4 pb-1">
                    {group.categories.map((cat) => {
                      const catTotal = totals.categoryTotals[cat];
                      if (!catTotal || catTotal.cost === 0) return null;
                      return (
                        <div
                          key={cat}
                          className="flex justify-between py-1 text-xs text-gray-500"
                        >
                          <span>{cat}</span>
                          <span>${formatCurrency(catTotal.cost)}</span>
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
          <div className="border-t border-purple-200 mt-3 pt-3 flex justify-between items-baseline px-2">
            <span className="text-sm font-medium text-primary-main">
              Total savings
            </span>
            <span className="text-sm font-bold text-primary-main">
              ${formatCurrency(totals.totalSavingsCost)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
