import { executionOptions } from "../constants";

export default function ExecutionConfigurator({
  executionMonthlyHours,
  executionMonthlyDuration,
  onToggle,
  onAddRemove,
  isSelected,
}) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-tertiary-text mb-4 border-b pb-2 border-gray-200">
        Execution & Strategy Services
      </h3>
      <div className="flex flex-col gap-6">
        End to End CRO Strategy & Execution including Testing Roadmap,
        Prioritisation, Design, Development, and Reporting.
        <div className="grid">
          <div>
            {Object.keys(executionOptions).map((option) => (
              <div
                key={option}
                className="grid grid-cols-4 items-center"
              >
                <h3 className="font-bold mr-4 col-span-1">
                  Select{" "}
                  {option === "Monthly_Hours"
                    ? "Monthly Hours"
                    : option === "Duration_Months"
                    ? "Duration"
                    : option}
                </h3>
                {executionOptions[option].map((val) => (
                  <div
                    key={option + val}
                    onClick={() => onToggle(val, option)}
                    className={`m-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center shadow-md ${
                      val === executionMonthlyDuration ||
                      val === executionMonthlyHours
                        ? "bg-primary-light border-primary-main"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {val}{" "}
                    {option === "Monthly_Hours"
                      ? "Hours"
                      : option === "Duration_Months"
                      ? "Months"
                      : option}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p>
            <b>Strategy inclusion:</b>
            {/* NOTE: strategy hours are 10 for <=6mo, 20 for longer — matches the variant data */}
            {` Based on your execution duration selected, ${
              executionMonthlyDuration > 6 ? "20" : "10"
            } hours of strategy will be added to your program.\nThis time is to accommodate building your testing roadmap.`}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={onAddRemove}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
              isSelected
                ? "bg-secondary-main text-white hover:bg-secondary-dark"
                : "bg-primary-main text-white hover:bg-primary-dark"
            }`}
          >
            {isSelected ? "Remove" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
