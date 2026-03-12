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
      <div className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: '#171C38' }}>
            Order summary
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#494949' }}>Show price</span>
            {/* Small toggle — 34.5x18, knob 14x14 */}
            <button
              onClick={() => setShowPrice(!showPrice)}
              className="relative inline-flex items-center transition-colors duration-200 cursor-pointer"
              style={{
                width: 34.5,
                height: 18,
                borderRadius: 9,
                backgroundColor: showPrice ? '#25B1A2' : '#E4E4E4',
              }}
            >
              <span
                className="inline-block bg-white shadow transition-transform duration-200"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  transform: showPrice ? 'translateX(18.5px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Savings banner */}
        {totals.totalSavingsCost > 0 && (
          <div
            className="px-4 py-3 mb-6"
            style={{ backgroundColor: "rgba(230, 231, 244, 0.55)", borderRadius: 12 }}
          >
            <p className="text-center text-sm font-bold" style={{ color: '#3D4A97', lineHeight: '130%' }}>
              ${formatCurrency(totals.totalSavingsCost)}
              <span className="font-normal"> in total savings</span>
            </p>
          </div>
        )}

        {/* Category groups */}
        <div>
          {SIDEBAR_GROUPS.map((group) => {
            const selectedInGroup = getSelectedInCategories(group.categories);
            const selectedCount = selectedInGroup.length;
            const totalCount = getTotalInCategories(group.categories);
            const isExpanded = expandedGroups[group.label];

            if (totalCount === 0) return null;

            return (
              <div
                key={group.label}
                style={{ borderBottom: '0.5px solid #B5B5B5' }}
              >
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: selectedCount > 0 ? '#171C38' : '#B7B7B7',
                      }}
                    >
                      {group.label}
                    </span>
                    {selectedCount > 0 && (
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{
                          borderRadius: 10.5,
                          border: '1px solid #E6E7F4',
                          color: '#494949',
                        }}
                      >
                        {selectedCount}/{totalCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    style={{ color: '#494949' }}
                    strokeWidth={1.25}
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
                        <span className="text-sm" style={{ color: '#494949' }}>
                          {entry.tactic.displayName || entry.tactic.Name}
                        </span>
                        <button
                          onClick={() =>
                            onRemoveTactic(entry.tactic, entry.config)
                          }
                          className="p-0.5 hover:text-gray-600 transition-colors cursor-pointer"
                          style={{ color: '#B5B5B5' }}
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
