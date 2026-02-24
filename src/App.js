import { useState, useMemo, useReducer } from "react";
import { Wallet, Edit } from "lucide-react";
import { data } from "./data";
import {
  CATEGORY_ORDER,
  categorizedData,
  packages,
  buildInitialConfigs,
  EXECUTION_TACTIC_ID,
  STRATEGY_TACTIC_ID,
  calculateTacticCost,
  computeTotals,
} from "./constants";
import TacticCard from "./components/TacticCard";
import ClientDetailsModal from "./components/ClientDetailsModal";
import SelectionSidebar from "./components/SelectionSidebar";
import TotalsSummary from "./components/TotalsSummary";
import ExecutionConfigurator from "./components/ExecutionConfigurator";
import PackageSelector from "./components/PackageSelector";

const initialViewState = {
  showCost: false,
  showHours: false,
  allServicesCollapsed: false,
  isModalOpen: false
};

function viewReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_COST":
      return { ...state, showCost: !state.showCost };
    case "TOGGLE_HOURS":
      return { ...state, showHours: !state.showHours };
    case "TOGGLE_COLLAPSE":
      return { ...state, allServicesCollapsed: !state.allServicesCollapsed };
    case "OPEN_MODAL":
      return { ...state, isModalOpen: true };
    case "CLOSE_MODAL":
      return { ...state, isModalOpen: false };
    default:
      return state;
  }
}

function App() {
  const uri = new URL(window.location.href);

  const [allTacticConfigurations, setAllTacticConfigurations] =
    useState(buildInitialConfigs);
  const [selectedTactics, setSelectedTactics] = useState({});
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [executionMonthlyHours, setExecutionMonthlyHours] = useState(40);
  const [executionMonthlyDuration, setExecutionMonthlyDuration] = useState(6);

  const [show] = useState(!!uri.searchParams.get("show"));
  const [viewState, dispatch] = useReducer(viewReducer, initialViewState);

  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    websiteUrl: "",
    brief: "",
  });
  const clientDetailsEntered = !!(
    clientDetails.clientName ||
    clientDetails.websiteUrl ||
    clientDetails.brief
  );

  const totals = useMemo(
    () => computeTotals(selectedTactics, discountPercentage),
    [selectedTactics, discountPercentage],
  );

  const toggleTacticSelection = (service, currentServiceConfig) => {
    setSelectedTactics((prev) => {
      const newSelection = { ...prev };
      if (newSelection[service.ID]) {
        delete newSelection[service.ID];
        if (service.ID === STRATEGY_TACTIC_ID || service.ID === EXECUTION_TACTIC_ID) {
          delete newSelection[EXECUTION_TACTIC_ID];
          delete newSelection[STRATEGY_TACTIC_ID];
        }
      } else {
        const configToUse =
          currentServiceConfig || allTacticConfigurations[service.ID] || {};
        const { hours, cost } = calculateTacticCost(service, configToUse);
        newSelection[service.ID] = { tactic: service, config: configToUse, hours, cost };
      }
      return newSelection;
    });
  };

  const handleSelectPackage = (packageName) => {
    const pkg = packages[packageName];
    if (!pkg) return;

    const newSelectedTactics = {};
    const newAllTacticConfigurations = { ...allTacticConfigurations };

    pkg.serviceIds.forEach((serviceId) => {
      const service = data.find((t) => t.ID === serviceId);
      if (service) {
        const initialConfig = newAllTacticConfigurations[service.ID] || {};
        if (
          service.Type === "Execution" &&
          service.Variants?.length > 0 &&
          !initialConfig.selectedVariantName
        ) {
          initialConfig.selectedVariantName = service.Variants[0].Name;
        }
        const { hours, cost } = calculateTacticCost(service, initialConfig);
        newSelectedTactics[service.ID] = {
          tactic: service,
          config: initialConfig,
          hours,
          cost,
        };
        newAllTacticConfigurations[service.ID] = initialConfig;
      }
    });
    setSelectedTactics(newSelectedTactics);
    setAllTacticConfigurations(newAllTacticConfigurations);
    setDiscountPercentage(0);
  };

  const updateTacticConfig = (tacticId, newConfig) => {
    setAllTacticConfigurations((prev) => {
      const updatedAllConfigs = { ...prev, [tacticId]: newConfig };
      setSelectedTactics((selectedPrev) => {
        if (selectedPrev[tacticId]) {
          const updatedTactic = selectedPrev[tacticId].tactic;
          const { hours, cost } = calculateTacticCost(updatedTactic, newConfig);
          return {
            ...selectedPrev,
            [tacticId]: {
              ...selectedPrev[tacticId],
              config: newConfig,
              hours,
              cost
            },
          };
        }
        return selectedPrev;
      });
      return updatedAllConfigs;
    });
  };

  const handleExecutionToggle = (value, option) => {
    let newMonthlyHours = executionMonthlyHours;
    let newDuration = executionMonthlyDuration;

    switch (option) {
      case "Monthly_Hours":
        newMonthlyHours = parseInt(value);
        setExecutionMonthlyHours(newMonthlyHours);
        break;
      case "Duration_Months":
        newDuration = parseInt(value);
        setExecutionMonthlyDuration(newDuration);
        break;
      default:
        break;
    }

    const executionData = data.find((t) => t.Type === "Execution");
    const strategyData = data.find((t) => t.Type === "Strategy");

    if (executionData) {
      const selectedVariant = executionData.Variants.find(
        (v) =>
          v.Monthly_Hours === newMonthlyHours &&
          v.Duration_Months === newDuration,
      );
      if (selectedVariant) {
        updateTacticConfig(executionData.ID, {
          selectedVariantName: selectedVariant.Name,
        });
        updateTacticConfig(strategyData.ID, {
          selectedVariantName:
            selectedVariant.Duration_Months > 6
              ? "Large Strategy"
              : "Small Strategy",
        });
      }
    }
  };

  const handleExecutionAddRemove = () => {
    const executionData = data.find((t) => t.Type === "Execution");
    const strategyData = data.find((t) => t.Type === "Strategy");

    if (!selectedTactics[executionData.ID]) {
      toggleTacticSelection(
        executionData,
        allTacticConfigurations[executionData.ID],
      );
      toggleTacticSelection(
        strategyData,
        allTacticConfigurations[strategyData.ID],
      );
    } else {
      toggleTacticSelection(
        executionData,
        allTacticConfigurations[executionData.ID],
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-tertiary-light to-blue-100 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-tertiary-text mb-8 mt-4 leading-tight">
        Service Cost Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold text-primary-main mb-6 border-b pb-3 border-gray-200">
            Available Services
          </h2>

          <div className="mb-6 pb-4 border-b border-gray-200">
            {clientDetailsEntered ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-tertiary-text">
                    Client Project Information:
                  </h3>
                  <button
                    onClick={() => dispatch({ type: "OPEN_MODAL" })}
                    className="px-4 py-2 rounded-md text-sm font-medium btn-secondary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Details
                  </button>
                </div>
                <div className="text-gray-700 text-base space-y-1">
                  {clientDetails.clientName && (
                    <p>
                      <span className="font-semibold">Client Name:</span>{" "}
                      {clientDetails.clientName}
                    </p>
                  )}
                  {clientDetails.websiteUrl && (
                    <p>
                      <span className="font-semibold">Website URL:</span>{" "}
                      <a
                        href={clientDetails.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-main hover:underline"
                      >
                        {clientDetails.websiteUrl}
                      </a>
                    </p>
                  )}
                  {clientDetails.brief && (
                    <p>
                      <span className="font-semibold">Project Brief:</span>{" "}
                      {clientDetails.brief}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center py-6">
                <button
                  onClick={() => dispatch({ type: "OPEN_MODAL" })}
                  className="px-6 py-3 rounded-lg font-semibold shadow-md btn-primary flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Add Client Details
                </button>
              </div>
            )}
          </div>

          <PackageSelector onSelectPackage={handleSelectPackage} />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {show && (
                <>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_COST" })}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm flex items-center gap-2 min-w-[150px] cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    <Wallet className="w-4 h-4" />
                    {viewState.showCost ? "Hide Costs" : "Show Costs"}
                  </button>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_HOURS" })}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm flex items-center min-w-[150px] gap-2 cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    <Wallet className="w-4 h-4" />
                    {viewState.showHours ? "Hide hours" : "Show hours"}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: "TOGGLE_COLLAPSE" })}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm cursor-pointer"
            >
              {viewState.allServicesCollapsed
                ? "Expand All Services"
                : "Collapse All Services"}
            </button>
          </div>

          <div className="flex flex-col gap-6 scrollable-content overflow-y-auto flex-grow">
            {CATEGORY_ORDER.map((categoryType) => {
              const services = categorizedData[categoryType];
              if (
                services &&
                categoryType === "Auditing" &&
                services.length > 0
              ) {
                return (
                  <div key={categoryType} className="mb-8">
                    <h3 className="text-2xl font-bold text-tertiary-text mb-4 border-b pb-2 border-gray-200">
                      {categoryType} Services
                    </h3>
                    <div className="flex flex-col gap-6">
                      {services.map((service) => (
                        <TacticCard
                          key={service.ID}
                          tactic={service}
                          isSelected={!!selectedTactics[service.ID]}
                          onToggle={toggleTacticSelection}
                          onConfigChange={updateTacticConfig}
                          currentConfig={
                            allTacticConfigurations[service.ID] || {}
                          }
                          show={show}
                          forceCollapse={viewState.allServicesCollapsed}
                          showCost={viewState.showCost}
                          showHours={viewState.showHours}
                          allTacticConfigurations={allTacticConfigurations}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}

            <ExecutionConfigurator
              executionMonthlyHours={executionMonthlyHours}
              executionMonthlyDuration={executionMonthlyDuration}
              onToggle={handleExecutionToggle}
              onAddRemove={handleExecutionAddRemove}
              isSelected={!!selectedTactics[EXECUTION_TACTIC_ID]}
            />
          </div>

          <TotalsSummary
            totals={totals}
            selectedTactics={selectedTactics}
            executionMonthlyDuration={executionMonthlyDuration}
            showHours={viewState.showHours}
          />
        </div>

        <SelectionSidebar
          selectedTactics={selectedTactics}
          toggleTacticSelection={toggleTacticSelection}
          showHours={viewState.showHours}
          showCost={viewState.showCost}
        />
      </div>

      <ClientDetailsModal
        isOpen={viewState.isModalOpen}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        onSave={setClientDetails}
        initialData={clientDetails}
      />
    </div>
  );
}

export default App;
