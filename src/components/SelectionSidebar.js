import { CATEGORY_ORDER, formatHoursToMinutes, formatCurrency } from "../constants";

export default function SelectionSidebar({
  selectedTactics,
  toggleTacticSelection,
  showHours,
  showCost,
}) {
  return (
    <div
      id="summary-section"
      className="lg:col-span-1 bg-white rounded-xl p-6 shadow-lg lg:sticky lg:top-8 lg:self-start flex flex-col max-h-[calc(100vh-4rem)]"
    >
      <h2 className="text-2xl font-bold text-primary-main mb-6 border-b pb-3 border-gray-200 flex-shrink-0">
        Your Selection
      </h2>
      <div
        id="printable-content"
        className="flex-grow scrollable-content overflow-y-auto pr-2 mb-4"
      >
        {Object.keys(selectedTactics).length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Select services to add them to your calculation.
          </p>
        ) : (
          <ul className="space-y-4">
            {CATEGORY_ORDER.map((categoryType) => {
              const selected = Object.values(selectedTactics).filter(
                (entry) => entry.tactic.Type === categoryType
              );
              if (selected.length === 0) return null;

              return (
                <li key={`summary-${categoryType}`}>
                  <h4 className="text-lg font-bold text-tertiary-text mb-2">
                    {categoryType} Services:
                  </h4>
                  <ul className="pl-4 space-y-2">
                    {selected.map((entry) => (
                      <li
                        key={entry.tactic.ID}
                        className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between items-center"
                      >
                        <div className="flex justify-between w-full">
                          <h3 className="text-md font-semibold text-primary-main">
                            {entry.tactic.Name}
                          </h3>
                          <button
                            onClick={() =>
                              toggleTacticSelection(
                                entry.tactic,
                                entry.config
                              )
                            }
                            className="text-xs px-3 py-1 rounded-md font-medium btn-danger shrink-0 whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="w-full">
                          {entry.tactic.Type === "Execution" &&
                            entry.config.selectedVariantName && (
                              <p className="text-sm text-gray-700">
                                {entry.config.selectedVariantName}
                              </p>
                            )}
                          {(showHours || showCost) && (
                            <p className="text-sm text-gray-700">
                              {showHours && (
                                <span className="text-tertiary-text">
                                  <span className="font-medium">Hours:</span>{" "}
                                  {formatHoursToMinutes(entry.hours)}
                                  <br />
                                </span>
                              )}
                              {showCost && (
                                <span className="text-tertiary-text">
                                  <span className="font-medium">Cost:</span> $
                                  {formatCurrency(entry.cost)}
                                  <br />
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="summary-sticky-content px-2 pb-2"></div>
    </div>
  );
}
