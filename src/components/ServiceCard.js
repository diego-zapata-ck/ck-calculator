import { useState, useMemo } from "react";
import {
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import {
  HOURLY_RATE,
  TACTIC_ICONS,
  formatCurrency,
  formatHoursToMinutes,
  calculateTacticCost,
} from "../constants";

export default function ServiceCard({
  tactic,
  isSelected,
  onToggle,
  onConfigChange,
  currentConfig,
  showPrice,
  showHours,
}) {
  const [expanded, setExpanded] = useState(false);

  const costResult = useMemo(() => {
    if (!tactic) return { hours: 0, cost: 0 };
    if (Object.keys(currentConfig).length === 0 && !tactic.Variants && !tactic.fixedMonthlyCost) {
      return {
        hours: tactic["Base Hours"],
        cost: tactic["Base Hours"] * HOURLY_RATE,
      };
    }
    return calculateTacticCost(tactic, currentConfig);
  }, [tactic, currentConfig]);

  const displayCost = costResult.monthlyCost || costResult.cost;
  const displayHours = costResult.monthlyHours || costResult.hours;
  const isMonthly = !!(costResult.monthlyCost || tactic.fixedMonthlyCost || tactic.softwareOptions);

  if (!tactic) return null;

  const iconSrc = TACTIC_ICONS[tactic.ID];
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
    <div
      className="flex items-center bg-white"
      style={{ borderRadius: 124, height: 44 }}
    >
      <button
        onClick={() => handleStepper(name, value, -1)}
        className="flex items-center justify-center transition-colors cursor-pointer overflow-hidden"
        style={{ width: 44, height: 44, padding: 14 }}
      >
        <Minus className="w-4 h-4 text-gray-500" />
      </button>
      <div
        className="flex flex-col justify-center text-sm text-black text-center"
        style={{ width: 44, height: 44, fontFamily: 'Lato, sans-serif' }}
      >
        {value || 0}
      </div>
      <button
        onClick={() => handleStepper(name, value, 1)}
        className="flex items-center justify-center transition-colors cursor-pointer overflow-hidden"
        style={{ width: 44, height: 44, padding: 14 }}
      >
        <Plus className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );

  const hasExpandedContent = tactic.Description || (tactic.Adjustments && tactic.Adjustments.length > 0) ||
    (tactic.Variants && tactic.Variants.length > 0) || tactic.durationOptions || tactic.softwareOptions || tactic.participantOptions ||
    tactic.Inclusions;

  return (
    <div
      className="bg-white transition-all duration-200 overflow-hidden"
      style={{
        borderRadius: 20,
        border: `0.5px solid ${isSelected ? '#B7B7B7' : '#DFDFDF'}`,
        ...(expanded
          ? { boxShadow: '0px 4px 12.1px 0px rgba(0,0,0,0.02)' }
          : {}),
      }}
    >
      {/* Main row */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '12px 12px 12px 12px', paddingRight: 24 }}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div
            className="flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ width: 48, height: 48, borderRadius: 8 }}
          >
            {iconSrc ? (
              <img src={iconSrc} alt={tactic.Name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ChevronDown className="w-5 h-5 text-primary-main" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-base"
              style={{ fontFamily: 'Lato, sans-serif', color: '#212121' }}
            >
              {tactic.displayName || tactic.Name}
            </span>
            {hasExpandedContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 transition-colors cursor-pointer"
                style={{ color: '#404040' }}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.25}
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-end">
            {showPrice && (
              <span
                className="text-base"
                style={{ fontFamily: 'Lato, sans-serif', color: '#494949' }}
              >
                +${formatCurrency(displayCost)}{isMonthly ? '/mo' : ''}
              </span>
            )}
            {showHours && !tactic.fixedMonthlyCost && (
              <span className="text-xs" style={{ color: '#25B1A2' }}>
                {formatHoursToMinutes(displayHours)}
              </span>
            )}
          </div>
          {/* Toggle switch — 46x24, knob 20x20 */}
          <button
            onClick={() => onToggle(tactic, currentConfig)}
            className="relative inline-flex items-center transition-colors duration-200 cursor-pointer print-hide"
            style={{
              width: 46,
              height: 24,
              borderRadius: 124,
              backgroundColor: isSelected ? '#25B1A2' : '#E4E4E4',
              padding: 2,
            }}
          >
            <span
              className="inline-block bg-white shadow transition-transform duration-200"
              style={{
                width: 20,
                height: 20,
                borderRadius: 400,
                transform: isSelected ? 'translateX(22px)' : 'translateX(0px)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ paddingBottom: expanded ? 24 : 12 }}>
          {/* Description & Inclusions — indented past the icon */}
          {(tactic.Description || tactic.Inclusions) && (
            <div
              className="flex items-center justify-center"
              style={{ paddingLeft: 60, paddingRight: 24 }}
            >
              <div className="flex-1 min-w-0 flex flex-col gap-3" style={{ paddingRight: 12 }}>
                {tactic.Description && (
                  <p
                    className="text-base w-full"
                    style={{ fontFamily: 'Lato, sans-serif', color: '#494949', lineHeight: 1.4 }}
                  >
                    {tactic.Description}
                  </p>
                )}
                {tactic.Inclusions && tactic.Inclusions.length > 0 && (
                  <div className="flex flex-col w-full">
                    <p
                      className="text-base w-full"
                      style={{ fontFamily: 'Lato, sans-serif', color: 'rgba(73, 73, 73, 0.8)', lineHeight: 1.4 }}
                    >
                      Base inclusions:
                    </p>
                    {tactic.Inclusions.map((inc, i) => (
                      <p
                        key={i}
                        className="text-base w-full"
                        style={{ fontFamily: 'Lato, sans-serif', color: '#494949', lineHeight: 1.4 }}
                      >
                        {inc}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adjustment controls — stepper rows */}
          {tactic.Adjustments && tactic.Adjustments.length > 0 && (
            <div className="flex flex-col" style={{ padding: '0 12px', marginTop: 12 }}>
              {tactic.Adjustments.map((adj, index) => (
                <div key={`${tactic.ID}-adj-${index}`}>
                  {adj.Type === "per_unit" && (
                      <div
                        className="flex items-center justify-between"
                        style={{
                          border: '1px solid #F0F0F0',
                          borderRadius: 12,
                          paddingLeft: 16,
                          paddingRight: 8,
                          paddingTop: 8,
                          paddingBottom: 8,
                        }}
                      >
                        <span
                          className="text-sm"
                          style={{ fontFamily: 'Lato, sans-serif', color: '#2D2D2D' }}
                        >
                          {adj.Title || adj.Description}
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
                    <div
                      className="flex items-center justify-between"
                      style={{
                        border: '1px solid #F0F0F0',
                        borderRadius: 12,
                        paddingLeft: 16,
                        paddingRight: 8,
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                    >
                      <span
                        className="text-sm"
                        style={{ fontFamily: 'Lato, sans-serif', color: '#2D2D2D' }}
                      >
                        {adj.Description}
                      </span>
                      <Stepper
                        name="numLeadGenEvents"
                        value={currentConfig.numLeadGenEvents ?? 0}
                      />
                    </div>
                  )}
                  {adj.Type === "fixed_increase" && (
                    <div
                      className="flex items-center gap-2"
                      style={{
                        border: '1px solid #F0F0F0',
                        borderRadius: 12,
                        paddingLeft: 16,
                        paddingRight: 8,
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                    >
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
                        className="text-sm cursor-pointer"
                        style={{ fontFamily: 'Lato, sans-serif', color: '#2D2D2D' }}
                      >
                        {adj.Description}
                      </label>
                    </div>
                  )}
                  {adj.Type === "exclusive_option" && (
                    <div
                      className="flex flex-wrap gap-x-4 gap-y-2"
                      style={{
                        border: '1px solid #F0F0F0',
                        borderRadius: 12,
                        paddingLeft: 16,
                        paddingRight: 8,
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                    >
                      {adj.Options.map((opt) => (
                        <div key={opt.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`${tactic.ID}-${adj.Condition}-${opt.value}`}
                            name={`${tactic.ID}-${adj.Condition}`}
                            value={opt.value}
                            checked={currentConfig[adj.Condition] === opt.value}
                            onChange={() => {
                              const newVal = currentConfig[adj.Condition] === opt.value ? undefined : opt.value;
                              onConfigChange(tactic.ID, { ...currentConfig, [adj.Condition]: newVal });
                            }}
                            className="h-4 w-4 text-primary-main border-gray-300 focus:ring-primary-main cursor-pointer"
                          />
                          <label
                            htmlFor={`${tactic.ID}-${adj.Condition}-${opt.value}`}
                            className="ml-2 text-sm cursor-pointer"
                            style={{ fontFamily: 'Lato, sans-serif', color: '#2D2D2D' }}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Execution (ID 15): department badges + select monthly hours ── */}
          {tactic.ID === 15 && tactic.Variants && (
            <div style={{ padding: '0 12px', marginTop: 12 }}>
              {/* Department badges */}
              {tactic.departments && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tactic.departments.map((dept) => (
                    <span
                      key={dept.name || dept}
                      className="flex items-center gap-2 py-1 text-sm"
                      style={{
                        background: 'white',
                        borderRadius: 8,
                        color: '#525252',
                        fontFamily: 'Lato, sans-serif',
                        paddingLeft: 8,
                        paddingRight: 16,
                      }}
                    >
                      {dept.icon && (
                        <img src={dept.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                      )}
                      {dept.name || dept}
                    </span>
                  ))}
                </div>
              )}

              {/* Select monthly hours */}
              <p className="text-sm font-bold mb-2" style={{ color: '#171C38' }}>Select monthly hours</p>
              <div className="grid grid-cols-3 gap-3">
                {[40, 60, 80].map((hours) => {
                  const isActive = currentConfig.selectedMonthlyHours === hours;
                  return (
                    <button
                      key={hours}
                      onClick={() => {
                        const duration = currentConfig.selectedDuration || 3;
                        const variantName = `${duration} Months @ ${hours} hrs/month`;
                        onConfigChange(tactic.ID, {
                          ...currentConfig,
                          selectedMonthlyHours: hours,
                          selectedVariantName: variantName,
                        });
                      }}
                      className="py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'rgba(37, 177, 162, 0.08)' : '#F8F8F8',
                        border: isActive ? '1.5px solid #25B1A2' : '1px solid #E4E4E4',
                        color: isActive ? '#25B1A2' : '#494949',
                      }}
                    >
                      {hours} hours
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Usability studies (ID 9): select participants ── */}
          {tactic.participantOptions && (
            <div>
              <div className="grid grid-cols-3 gap-3">
                {tactic.participantOptions.map((opt) => {
                  const isActive = (currentConfig.selectedParticipants || 6) === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onConfigChange(tactic.ID, {
                          ...currentConfig,
                          selectedParticipants: opt.value,
                        });
                      }}
                      className="py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'rgba(37, 177, 162, 0.08)' : '#F8F8F8',
                        border: isActive ? '1.5px solid #25B1A2' : '1px solid #E4E4E4',
                        color: isActive ? '#25B1A2' : '#494949',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Relationship (ID 19): select duration ── */}
          {tactic.durationOptions && (
            <div style={{ padding: '0 12px', marginTop: 12 }}>
              <p className="text-sm font-bold mb-2" style={{ color: '#171C38' }}>Select duration</p>
              <div className="grid grid-cols-3 gap-3">
                {tactic.durationOptions.map((months) => {
                  const isActive = currentConfig.selectedDuration === months;
                  return (
                    <button
                      key={months}
                      onClick={() => {
                        onConfigChange(tactic.ID, {
                          ...currentConfig,
                          selectedDuration: months,
                        });
                      }}
                      className="py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'rgba(37, 177, 162, 0.08)' : '#F8F8F8',
                        border: isActive ? '1.5px solid #25B1A2' : '1px solid #E4E4E4',
                        color: isActive ? '#25B1A2' : '#494949',
                      }}
                    >
                      {months} months
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Optimisation software (ID 20): select software ── */}
          {tactic.softwareOptions && (
            <div style={{ padding: '0 12px', marginTop: 12 }}>
              <p className="text-sm font-bold mb-2" style={{ color: '#171C38' }}>Select software</p>
              <div className="grid grid-cols-2 gap-3">
                {tactic.softwareOptions.map((sw) => {
                  const isActive = (currentConfig.selectedSoftware || 'byo') === sw.value;
                  return (
                    <button
                      key={sw.value}
                      onClick={() => {
                        onConfigChange(tactic.ID, {
                          ...currentConfig,
                          selectedSoftware: sw.value,
                        });
                      }}
                      className="py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'rgba(37, 177, 162, 0.08)' : '#F8F8F8',
                        border: isActive ? '1.5px solid #25B1A2' : '1px solid #E4E4E4',
                        color: isActive ? '#25B1A2' : '#494949',
                      }}
                    >
                      {sw.label}
                      <span className="block text-xs mt-0.5" style={{ color: isActive ? '#25B1A2' : '#B7B7B7' }}>
                        {sw.monthlyCost > 0 ? `$${sw.monthlyCost}/month` : '$0/month'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Generic variant selector (for non-Execution services like Usability studies) ── */}
          {tactic.Variants && tactic.Variants.length > 0 && tactic.ID !== 15 && (
            <div style={{ padding: '0 12px', marginTop: 12 }}>
              {tactic.ID === 9 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
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
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
