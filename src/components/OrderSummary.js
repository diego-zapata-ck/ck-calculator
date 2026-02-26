import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { categorizedData, formatCurrency } from "../constants";

const SIDEBAR_GROUPS = [
  { label: "Account & project management", categories: ["Account & project management"] },
  { label: "Technical review", categories: ["Technical review"] },
  { label: "Data analysis", categories: ["Data analysis"] },
  { label: "UX fundamentals", categories: ["UX fundamentals"] },
  { label: "Customer insights", categories: ["Customer insights"] },
  { label: "Conversion", categories: ["Conversion"] },
  { label: "Execution & strategy services", categories: ["Strategy", "Experimentation"] },
];

export default function OrderSummary({
  showPrice,
  setShowPrice,
  selectedTactics,
  onRemoveTactic,
  totals,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getSelectedInCategories = (categories) => {
    return Object.values(selectedTactics).filter((entry) =>
      categories.includes(entry.tactic.category),
    );
  };

  const getTotalInCategories = (categories) => {
    return categories.reduce((sum, cat) => {
      return sum + (categorizedData[cat] || []).length;
    }, 0);
  };

  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-tertiary-text">
            Order summary
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show price</span>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                showPrice ? "bg-primary-main" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPrice ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Savings banner */}
        {totals.totalSavingsCost > 0 && (
          <div
            className="rounded-xl px-4 py-3 mb-6"
            style={{ backgroundColor: "rgba(230, 231, 244, 0.55)" }}
          >
            <p className="text-center text-sm text-tertiary-text">
              <span className="font-bold">
                ${formatCurrency(totals.totalSavingsCost)}
              </span>{" "}
              <span className="font-normal">in total savings</span>
            </p>
          </div>
        )}

        {/* Category groups */}
        <div>
          {SIDEBAR_GROUPS.map((group, index) => {
            const selectedInGroup = getSelectedInCategories(group.categories);
            const selectedCount = selectedInGroup.length;
            const totalCount = getTotalInCategories(group.categories);
            const isExpanded = expandedGroups[group.label];

            if (totalCount === 0) return null;

            return (
              <div
                key={group.label}
                className="border-b"
                style={{ borderColor: "rgba(230, 231, 244, 0.6)" }}
              >
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        selectedCount > 0
                          ? "text-tertiary-text"
                          : "text-gray-400"
                      }`}
                    >
                      {group.label}
                    </span>
                    {selectedCount > 0 && (
                      <span
                        className="text-xs text-gray-500 px-2 py-0.5 rounded-full border"
                        style={{ borderColor: "#E6E7F4" }}
                      >
                        {selectedCount}/{totalCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded list of selected services */}
                {isExpanded && selectedCount > 0 && (
                  <div className="pl-3 pb-3 space-y-0.5">
                    {selectedInGroup.map((entry) => (
                      <div
                        key={entry.tactic.ID}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-gray-500">
                          {entry.tactic.displayName || entry.tactic.Name}
                        </span>
                        <button
                          onClick={() =>
                            onRemoveTactic(entry.tactic, entry.config)
                          }
                          className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
