import { useState, useMemo } from "react";
import {
  ChevronDown,
  CalendarDays,
  Clock,
  CheckCheck,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import {
  HOURLY_RATE,
  TACTIC_ICONS,
  getCroVariantDiscount,
  formatHoursToMinutes,
  formatCurrency,
  calculateTacticCost,
} from "../constants";

export default function ServiceCard({
  tactic,
  isSelected,
  onToggle,
  onConfigChange,
  currentConfig,
  showPrice,
  show,
}) {
  const [expanded, setExpanded] = useState(false);

  const { cost: displayCost } = useMemo(() => {
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

  const iconSrc = TACTIC_ICONS[tactic.ID];
  const allSubtasks = tactic["Sub-tasks"];

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

  const handleStepper = (name, currentValue, delta) => {
    const newValue = Math.max(0, (currentValue || 0) + delta);
    onConfigChange(tactic.ID, { ...currentConfig, [name]: newValue });
  };

  const Stepper = ({ name, value }) => (
    <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => handleStepper(name, value, -1)}
        className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="px-4 py-1.5 text-sm font-medium text-gray-700 min-w-[2rem] text-center border-x border-gray-200">
        {value || 0}
      </span>
      <button
        onClick={() => handleStepper(name, value, 1)}
        className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const hasConfig =
    (tactic.Adjustments && tactic.Adjustments.length > 0) ||
    (tactic.Variants && tactic.Variants.length > 0);

  return (
    <div
      className={`rounded-xl border transition-all duration-200 bg-white ${
        isSelected
          ? "border-l-4 border-l-primary-main border-gray-200"
          : "border-gray-200"
      }`}
    >
      {/* Main row */}
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            {iconSrc ? (
              <img src={iconSrc} alt={tactic.Name} className="w-6 h-6 object-contain" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary-main" />
            )}
          </div>
          <span className="font-medium text-gray-900 text-base">
            {tactic.displayName || tactic.Name}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {showPrice && (
            <span className="text-sm font-semibold text-gray-600">
              +${formatCurrency(displayCost)}
            </span>
          )}
          {/* Toggle switch */}
          <button
            onClick={() => onToggle(tactic, currentConfig)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${
              isSelected ? "bg-primary-main" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isSelected ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">{tactic.Description}</p>

          {tactic.Inclusions && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Base Inclusions:
              </h4>
              <ul className="text-sm text-gray-600">
                {tactic.Inclusions.map((inclusion, i) => (
                  <li key={i}>{inclusion}</li>
                ))}
              </ul>
            </div>
          )}

          {hasConfig && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {adj.Description}
                        </span>
                        <Stepper
                          name={adj.Unit.replace(/\s/g, "")}
                          value={
                            currentConfig[adj.Unit.replace(/\s/g, "")] || 0
                          }
                        />
                      </div>
                    )}
                  {adj.Type === "threshold" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {adj.Description}
                      </span>
                      <Stepper
                        name="numLeadGenEvents"
                        value={currentConfig.numLeadGenEvents ?? 0}
                      />
                    </div>
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
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {adj.Description}
                      </label>
                    </div>
                  )}
                  {tactic.ID === 13 &&
                    adj.Unit === "additional user journey" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {adj.Description}
                        </span>
                        <Stepper
                          name="numAdditionalUserJourneysMeclabs"
                          value={
                            currentConfig.numAdditionalUserJourneysMeclabs || 0
                          }
                        />
                      </div>
                    )}
                </div>
              ))}

              {tactic.Variants && tactic.Variants.length > 0 && (
                <div className="mt-3">
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
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
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
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {variant.Name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
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
                          variant.Name === "Large Strategy"
                            ? CheckCheck
                            : Check;

                        return (
                          <div
                            key={`${tactic.ID}-variant-${index}`}
                            onClick={() => handleVariantChange(variant.Name)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center
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
                                  <CalendarDays className="w-4 h-4" />
                                  <span className="font-semibold text-sm">
                                    {variant.Duration_Months} Months
                                  </span>
                                </>
                              ) : (
                                <>
                                  <VariantIcon className="w-4 h-4" />
                                  <span className="font-semibold text-sm">
                                    {variant.Name}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              {variant.Duration_Months ? (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs">
                                    {variant.Monthly_Hours} hrs/month
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs">
                                  {variant.Description}
                                </span>
                              )}
                            </div>
                            {discountRate > 0 && (
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                Save ${formatCurrency(discountAmount)} (
                                {Math.round(discountRate * 100)}%)
                              </p>
                            )}
                            {variant.Duration_Months && (
                              <p className="text-xs text-gray-700 font-semibold mt-1">
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

              {allSubtasks && allSubtasks.length > 0 && show && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Sub-tasks:
                  </h4>
                  <ul className="list-disc pl-5 text-gray-500 text-xs space-y-1">
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
                        if (selectedVariant && sub.Proportion) {
                          subtaskHours =
                            sub.Proportion * selectedVariant.Monthly_Hours;
                        }
                      }
                      const subtaskCost = subtaskHours * HOURLY_RATE;
                      return (
                        <li key={`${tactic.ID}-${sub.ID}-${index}`}>
                          {sub.Name} ({formatHoursToMinutes(subtaskHours)} • $
                          {formatCurrency(subtaskCost)})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
