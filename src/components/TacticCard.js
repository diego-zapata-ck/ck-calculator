import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  CalendarDays,
  Clock,
  CheckCheck,
  Check,
} from "lucide-react";
import {
  HOURLY_RATE,
  TACTIC_ICONS,
  getCroVariantDiscount,
  formatHoursToMinutes,
  formatCurrency,
  calculateTacticCost,
} from "../constants";

export default function TacticCard({
  tactic,
  isSelected,
  onToggle,
  onConfigChange,
  currentConfig,
  allTacticConfigurations,
  forceCollapse,
  showCost,
  showHours,
  show,
}) {
  const [expanded, setExpanded] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(false);

  useEffect(() => {
    setExpanded(!forceCollapse);
    setShowSubtasks(false);
  }, [forceCollapse]);

  const { hours: displayHours, cost: displayCost } = useMemo(() => {
    if (!tactic) return { hours: 0, cost: 0 };
    if (Object.keys(currentConfig).length === 0 && !tactic.Variants) {
      return {
        hours: tactic["Base Hours"],
        cost: tactic["Base Hours"] * HOURLY_RATE,
      };
    }
    return calculateTacticCost(tactic, currentConfig);
  }, [tactic, currentConfig]);

  if (!tactic) return null;

  const allSubtasks = tactic["Sub-tasks"];
  const IconComponent = TACTIC_ICONS[tactic.ID] || ArrowRight;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (type === "number") {
      newValue = parseFloat(value);
      if (isNaN(newValue)) newValue = 0;
    } else if (type === "checkbox") {
      newValue = checked;
    }
    onConfigChange(tactic.ID, { ...currentConfig, [name]: newValue });
  };

  const handleVariantChange = (newValue) => {
    onConfigChange(tactic.ID, {
      ...currentConfig,
      selectedVariantName: newValue,
    });
  };

  return (
    <div
      className={`card ${
        isSelected
          ? "bg-primary-light border-primary-main shadow-md"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <IconComponent className="w-6 h-6 text-primary-main flex-shrink-0" />
          <div className="flex flex-col flex-grow min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 flex-grow min-w-0 truncate">
              {tactic.Name}
            </h3>
            {tactic.Type !== "Execution" && (
              <p className="text-lg font-bold text-gray-800 flex-shrink-0">
                {showHours && (
                  <span className="text-primary-main mr-4">
                    {formatHoursToMinutes(displayHours)}
                  </span>
                )}
                {showCost && (
                  <span className="text-primary-main">
                    ${formatCurrency(displayCost)}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {tactic.Type !== "Strategy" && (
            <button
              onClick={() => onToggle(tactic, currentConfig)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer
              ${
                isSelected
                  ? "bg-secondary-main text-white hover:bg-secondary-dark"
                  : "bg-primary-main text-white hover:bg-primary-dark"
              }`}
            >
              {isSelected ? "Remove" : "Add"}
            </button>
          )}
          <button
            onClick={() =>
              setExpanded(!expanded)
            }
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            title={expanded ? "Collapse Card" : "Expand Card"}
          >
            {expanded ? (
              <Minus className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div>
          <p className="text-sm text-gray-600 mb-3">{tactic.Description}</p>
          {tactic.Inclusions && (
            <>
              <h4 className="text-md font-semibold text-gray-700">
                Base Inclusions:
              </h4>
              <ul>
                {tactic.Inclusions.map((inclusion, i) => (
                  <li key={i}>{inclusion}</li>
                ))}
              </ul>
            </>
          )}
          {((tactic.Adjustments && tactic.Adjustments.length > 0) ||
            (tactic.Variants && tactic.Variants.length > 0)) && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <h4 className="text-md font-semibold text-gray-700">
                {tactic.Name === "Strategy"
                  ? "Option:"
                  : "Configurable Options:"}
              </h4>
              {tactic.Adjustments.map((adj, index) => (
                <div
                  key={`${tactic.ID}-adj-${index}`}
                  className="flex flex-col gap-1"
                >
                  {adj.Type === "per_unit" &&
                    adj.Unit !== "additional user journey" && (
                      <>
                        <label
                          htmlFor={`${tactic.ID}-${adj.Unit.replace(
                            /\s/g,
                            ""
                          )}`}
                          className="text-sm text-gray-700"
                        >
                          {adj.Description}
                        </label>
                        <input
                          type="number"
                          id={`${tactic.ID}-${adj.Unit.replace(/\s/g, "")}`}
                          name={adj.Unit.replace(/\s/g, "")}
                          value={
                            currentConfig[adj.Unit.replace(/\s/g, "")] || 0
                          }
                          onChange={handleInputChange}
                          min="0"
                          className="input-field w-24"
                        />
                      </>
                    )}
                  {adj.Type === "threshold" && (
                    <>
                      <label
                        htmlFor={`${tactic.ID}-numLeadGenEvents`}
                        className="text-sm text-gray-700"
                      >
                        {adj.Description}
                      </label>
                      <input
                        type="number"
                        id={`${tactic.ID}-numLeadGenEvents`}
                        name="numLeadGenEvents"
                        value={currentConfig.numLeadGenEvents ?? 0}
                        onChange={handleInputChange}
                        min="0"
                        className="input-field w-24"
                      />
                    </>
                  )}
                  {adj.Type === "fixed_increase" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${tactic.ID}-${adj.Condition}`}
                        name={adj.Condition}
                        checked={currentConfig[adj.Condition] || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-main border-gray-300 rounded focus:ring-primary-main cursor-pointer"
                      />
                      <label
                        htmlFor={`${tactic.ID}-${adj.Condition}`}
                        className="ml-2 text-sm text-gray-800 cursor-pointer"
                      >
                        {adj.Description}
                      </label>
                    </div>
                  )}
                  {/* meclabs user journey — uses a special config key */}
                  {tactic.ID === 13 &&
                    adj.Unit === "additional user journey" && (
                      <>
                        <label
                          htmlFor={`${tactic.ID}-numAdditionalUserJourneysMeclabs`}
                          className="text-sm text-gray-700"
                        >
                          {adj.Description}
                        </label>
                        <input
                          type="number"
                          id={`${tactic.ID}-numAdditionalUserJourneysMeclabs`}
                          name="numAdditionalUserJourneysMeclabs"
                          value={
                            currentConfig.numAdditionalUserJourneysMeclabs || 0
                          }
                          onChange={handleInputChange}
                          min="0"
                          className="input-field w-24"
                        />
                      </>
                    )}
                </div>
              ))}

              {tactic.Variants && tactic.Variants.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-700">
                    {tactic.Type === "Strategy" ? "" : "Select Options:"}
                  </h4>
                  {tactic.ID === 9 ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`variant-${tactic.ID}-6pax`}
                          name={`variant-${tactic.ID}`}
                          value="BASE"
                          checked={
                            currentConfig.selectedVariantName === undefined
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              e.target.value === "BASE"
                                ? undefined
                                : e.target.value
                            )
                          }
                          className="h-4 w-4 text-primary-main border-gray-300 focus:ring-primary-main cursor-pointer"
                        />
                        <label
                          htmlFor={`variant-${tactic.ID}-6pax`}
                          className="ml-2 text-sm text-gray-800 cursor-pointer"
                        >
                          6 PAX
                        </label>
                      </div>
                      {tactic.Variants.map((variant, index) => (
                        <div
                          key={`${tactic.ID}-variant-${index}`}
                          className="flex items-center"
                        >
                          <input
                            type="radio"
                            id={`variant-${tactic.ID}-${variant.Name.replace(
                              /\s/g,
                              "-"
                            )}`}
                            name={`variant-${tactic.ID}`}
                            value={variant.Name}
                            checked={
                              currentConfig.selectedVariantName === variant.Name
                            }
                            onChange={(e) =>
                              handleVariantChange(e.target.value)
                            }
                            className="h-4 w-4 text-primary-main border-gray-300 focus:ring-primary-main cursor-pointer"
                          />
                          <label
                            htmlFor={`variant-${
                              tactic.ID
                            }-${variant.Name.replace(/\s/g, "-")}`}
                            className="ml-2 text-sm text-gray-800 cursor-pointer"
                          >
                            {variant.Name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {tactic.Variants.map((variant, index) => {
                        let discountRate = 0;
                        let discountAmount = 0;
                        let finalCost = 0;
                        if (variant.Duration_Months) {
                          const variantHours =
                            variant.Monthly_Hours * variant.Duration_Months;
                          const variantCost = variantHours * HOURLY_RATE;
                          discountRate = getCroVariantDiscount(
                            variant.Duration_Months,
                            variant.Monthly_Hours,
                          );
                          discountAmount = variantCost * discountRate;
                          finalCost = variantCost - discountAmount;
                        }

                        const VariantIcon =
                          variant.Name === "Large Strategy" ? CheckCheck : Check;

                        return (
                          <div
                            key={`${tactic.ID}-variant-${index}`}
                            onClick={() => handleVariantChange(variant.Name)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center
                              ${
                                currentConfig.selectedVariantName ===
                                variant.Name
                                  ? "bg-primary-light border-primary-main shadow-md"
                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                              }`}
                          >
                            <div className="flex items-center gap-2 text-primary-main mb-1">
                              {variant.Duration_Months ? (
                                <>
                                  <CalendarDays className="w-5 h-5" />
                                  <span className="font-semibold text-lg">
                                    {variant.Duration_Months} Months
                                  </span>
                                </>
                              ) : (
                                <>
                                  <VariantIcon className="w-5 h-5" />
                                  <span className="font-semibold text-lg">
                                    {variant.Name}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              {variant.Duration_Months ? (
                                <>
                                  <Clock className="w-4 h-4" />
                                  <span className="text-md">
                                    {variant.Monthly_Hours} hrs/month
                                  </span>
                                </>
                              ) : (
                                <span className="text-md">
                                  {variant.Description}
                                </span>
                              )}
                            </div>
                            {discountRate > 0 && (
                              <p className="text-sm text-green-600 font-semibold mt-2">
                                Save ${formatCurrency(discountAmount)} (
                                {Math.round(discountRate * 100)}%)
                              </p>
                            )}
                            {variant.Duration_Months && (
                              <p className="text-sm text-gray-800 font-semibold mt-1">
                                Total: ${formatCurrency(finalCost)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {tactic.ID === 13 &&
                tactic.Adjustments.some(
                  (adj) =>
                    adj.Unit === "additional user journey" &&
                    adj.Hours_Per_Unit === "TBD"
                ) && (
                  <p className="text-sm text-secondary-main mt-2">
                    Note: Hours/Cost for "additional user journey" for Meclabs
                    Conversion Review was TBD in original data. Defaulting to 1
                    hour per journey.
                  </p>
                )}

              {allSubtasks.length > 0 && show && (
                <div className="mt-4">
                  <h4
                    className="text-md font-semibold text-gray-700 cursor-pointer flex items-center justify-between"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    Sub-tasks:
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        showSubtasks ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </h4>
                  {showSubtasks && (
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mt-2">
                      {allSubtasks.map((sub, index) => {
                        let subtaskHours = sub.Hours;
                        if (
                          tactic.Type === "Execution" &&
                          tactic.ID === 15 &&
                          currentConfig.selectedVariantName
                        ) {
                          const selectedVariant = tactic.Variants.find(
                            (v) => v.Name === currentConfig.selectedVariantName
                          );
                          if (selectedVariant) {
                            subtaskHours =
                              sub.Proportion * selectedVariant.Monthly_Hours;
                          }
                        }
                        const subtaskCost = subtaskHours * HOURLY_RATE;
                        return (
                          <li key={`${tactic.ID}-${sub.ID}-${index}`}>
                            {sub.Name} (
                            {showCost
                              ? `$${formatCurrency(subtaskCost)}`
                              : `${formatHoursToMinutes(
                                  subtaskHours
                                )} • $${formatCurrency(subtaskCost)}`}
                            )
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
