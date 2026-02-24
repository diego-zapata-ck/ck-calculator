import React from "react";
import { CATEGORY_ORDER, formatHoursToMinutes, formatCurrency } from "../constants";

export default function TotalsSummary({
  totals,
  selectedTactics,
  executionMonthlyDuration,
  showHours,
}) {
  return (
    <div className="mt-8 pt-4 border-t-2 border-primary-light flex-shrink-0">
      <h3 className="text-xl font-bold text-primary-main mb-4">
        Total Investment:
      </h3>

      {CATEGORY_ORDER.map((categoryType) => {
        const catTotals = totals.categoryTotals[categoryType];
        if (
          Object.values(selectedTactics).some(
            (entry) => entry.tactic.Type === categoryType
          ) &&
          (catTotals.hours > 0 || catTotals.cost > 0)
        ) {
          return (
            <React.Fragment key={`total-${categoryType}`}>
              <div className="flex justify-between items-baseline mb-2 text-gray-700 text-lg font-bold pr-2">
                <span className="font-semibold text-tertiary-text">
                  {categoryType}{" "}
                  <span className="text-sm">
                    {
                      {
                        Strategy: " (Per Annum)",
                        Auditing: "",
                        Execution: " (Monthly)",
                      }[categoryType]
                    }
                  </span>
                </span>
                <div className="text-right">
                  {categoryType === "Execution" ? (
                    <p className="text-sm text-gray-600">
                      $
                      {formatCurrency(
                        catTotals.cost / (executionMonthlyDuration || 1)
                      )}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        ${formatCurrency(catTotals.cost)}
                      </p>
                      {showHours && (
                        <p className="text-xs text-gray-500">
                          {formatHoursToMinutes(catTotals.hours)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              {categoryType === "Execution" && (
                <div className="flex justify-between items-baseline mb-2 text-gray-700 text-lg font-bold pr-2">
                  <span className="font-semibold text-tertiary-text">
                    {categoryType} Term
                    <span className="text-sm"> (Months)</span>
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {executionMonthlyDuration}
                    </p>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        }
        return null;
      })}

      <div className="text-md">
        <div className="border-b-1 border-b-gray-400"></div>
        <div className="flex justify-between items-baseline text-tertiary-text mt-4">
          <span>Total Investment:</span>
          <span>${formatCurrency(totals.totalCost)}</span>
        </div>
        {showHours && (
          <div className="flex justify-between items-baseline text-tertiary-text mb-4">
            <span>Total Hours:</span>
            <span className="text-primary-main text-lg">
              {formatHoursToMinutes(totals.totalHours)}
            </span>
          </div>
        )}
      </div>

      {totals.auditingCommonSubtaskSavingsCostDisplay > 0 ||
      totals.croSpecificSavingsCost > 0 ||
      totals.generalDiscountValue > 0 ? (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-green-700">
          {totals.auditingCommonSubtaskSavingsCostDisplay > 0 && (
            <p className="text-md flex justify-between">
              Audit Savings:{" "}
              <span className="font-semibold">
                ${formatCurrency(totals.auditingCommonSubtaskSavingsCostDisplay)}
              </span>
            </p>
          )}
          {totals.croSpecificSavingsCost > 0 && (
            <p className="text-md flex justify-between">
              Retainer Saving:{" "}
              <span className="font-semibold">
                ${formatCurrency(totals.croSpecificSavingsCost)}
              </span>
            </p>
          )}
          {totals.generalDiscountValue > 0 && (
            <p className="text-md flex justify-between">
              General Saving:{" "}
              <span className="font-semibold">
                ${formatCurrency(totals.generalDiscountValue)}
              </span>
            </p>
          )}
          <p className="text-md flex justify-between font-bold mt-2">
            Total Saving:{" "}
            <span className="font-bold">
              ${formatCurrency(totals.totalSavingsCost)}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          Add multiple services to save.
        </p>
      )}
    </div>
  );
}
