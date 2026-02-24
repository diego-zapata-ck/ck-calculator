import { CATEGORY_ORDER, formatCurrency } from "../constants";

export default function TotalsSummary({ totals, selectedTactics }) {
  const activeCategories = CATEGORY_ORDER.filter((cat) => {
    const catTotals = totals.categoryTotals[cat];
    return (
      catTotals &&
      (catTotals.hours > 0 || catTotals.cost > 0) &&
      Object.values(selectedTactics).some(
        (entry) => entry.tactic.category === cat,
      )
    );
  });

  const hasSavings =
    totals.auditingCommonSubtaskSavingsCostDisplay > 0 ||
    totals.croSpecificSavingsCost > 0 ||
    totals.generalDiscountValue > 0;

  return (
    <div className="mt-4 p-6 bg-white rounded-xl border border-gray-200">
      <h3 className="text-lg font-bold text-tertiary-text mb-4">
        Total Investment
      </h3>

      {activeCategories.map((cat) => {
        const catTotals = totals.categoryTotals[cat];
        return (
          <div
            key={cat}
            className="flex justify-between items-baseline mb-2 text-gray-700"
          >
            <span className="text-sm font-medium">{cat}</span>
            <span className="text-sm font-semibold">
              ${formatCurrency(catTotals.cost)}
            </span>
          </div>
        );
      })}

      <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-baseline">
        <span className="text-base font-bold text-tertiary-text">Total</span>
        <span className="text-base font-bold text-tertiary-text">
          ${formatCurrency(totals.totalCost)}
        </span>
      </div>

      {hasSavings && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700 text-sm">
          {totals.auditingCommonSubtaskSavingsCostDisplay > 0 && (
            <p className="flex justify-between">
              <span>Audit Savings</span>
              <span className="font-semibold">
                ${formatCurrency(totals.auditingCommonSubtaskSavingsCostDisplay)}
              </span>
            </p>
          )}
          {totals.croSpecificSavingsCost > 0 && (
            <p className="flex justify-between">
              <span>Retainer Saving</span>
              <span className="font-semibold">
                ${formatCurrency(totals.croSpecificSavingsCost)}
              </span>
            </p>
          )}
          {totals.generalDiscountValue > 0 && (
            <p className="flex justify-between">
              <span>General Saving</span>
              <span className="font-semibold">
                ${formatCurrency(totals.generalDiscountValue)}
              </span>
            </p>
          )}
          <p className="flex justify-between font-bold mt-2 pt-2 border-t border-green-200">
            <span>Total Saving</span>
            <span>${formatCurrency(totals.totalSavingsCost)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
