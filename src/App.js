import { useState, useMemo } from "react";
import { data } from "./data";
import {
  CATEGORY_ORDER,
  categorizedData,
  packages,
  buildInitialConfigs,
  calculateTacticCost,
  computeTotals,
} from "./constants";
import Header from "./components/Header";
import PackageSelector from "./components/PackageSelector";
import ServiceCard from "./components/ServiceCard";
import TotalsSummary from "./components/TotalsSummary";
import Footer from "./components/Footer";

function App() {
  const uri = new URL(window.location.href);
  const [show] = useState(!!uri.searchParams.get("show"));

  const [allTacticConfigurations, setAllTacticConfigurations] =
    useState(buildInitialConfigs);
  const [selectedTactics, setSelectedTactics] = useState({});
  const [discountPercentage] = useState(0);
  const [showPrice, setShowPrice] = useState(true);
  const [kickoffDate, setKickoffDate] = useState("");
  const [activePackage, setActivePackage] = useState(null);

  const totals = useMemo(
    () => computeTotals(selectedTactics, discountPercentage),
    [selectedTactics, discountPercentage],
  );

  const toggleTacticSelection = (service, currentServiceConfig) => {
    setSelectedTactics((prev) => {
      const newSelection = { ...prev };
      if (newSelection[service.ID]) {
        delete newSelection[service.ID];
      } else {
        const configToUse =
          currentServiceConfig || allTacticConfigurations[service.ID] || {};
        const { hours, cost } = calculateTacticCost(service, configToUse);
        newSelection[service.ID] = {
          tactic: service,
          config: configToUse,
          hours,
          cost,
        };
      }
      return newSelection;
    });
    setActivePackage(null);
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
    setActivePackage(packageName);
  };

  const updateTacticConfig = (tacticId, newConfig) => {
    setAllTacticConfigurations((prev) => {
      const updatedAllConfigs = { ...prev, [tacticId]: newConfig };
      setSelectedTactics((selectedPrev) => {
        if (selectedPrev[tacticId]) {
          const updatedTactic = selectedPrev[tacticId].tactic;
          const { hours, cost } = calculateTacticCost(
            updatedTactic,
            newConfig,
          );
          return {
            ...selectedPrev,
            [tacticId]: {
              ...selectedPrev[tacticId],
              config: newConfig,
              hours,
              cost,
            },
          };
        }
        return selectedPrev;
      });
      return updatedAllConfigs;
    });
  };

  const hasSelectedTactics = Object.keys(selectedTactics).length > 0;

  // Divider categories — draw a line before "Strategy"
  const dividerBefore = new Set(["Strategy"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white font-sans text-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />

        <PackageSelector
          activePackage={activePackage}
          onSelectPackage={handleSelectPackage}
        />

        {/* Show price toggle */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show price</span>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                showPrice ? "bg-primary-main" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPrice ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Service categories */}
        {CATEGORY_ORDER.map((categoryName) => {
          const services = categorizedData[categoryName];
          if (!services || services.length === 0) return null;

          return (
            <div key={categoryName}>
              {dividerBefore.has(categoryName) && (
                <hr className="border-gray-200 my-8" />
              )}
              <section className="mb-8">
                <h3 className="text-lg font-bold text-tertiary-text mb-4">
                  {categoryName}
                </h3>
                <div className="flex flex-col gap-3">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.ID}
                      tactic={service}
                      isSelected={!!selectedTactics[service.ID]}
                      onToggle={toggleTacticSelection}
                      onConfigChange={updateTacticConfig}
                      currentConfig={
                        allTacticConfigurations[service.ID] || {}
                      }
                      showPrice={showPrice}
                      show={show}
                    />
                  ))}
                </div>
              </section>
            </div>
          );
        })}

        {/* Totals */}
        {hasSelectedTactics && (
          <TotalsSummary
            totals={totals}
            selectedTactics={selectedTactics}
          />
        )}

        <Footer kickoffDate={kickoffDate} onDateChange={setKickoffDate} />
      </div>
    </div>
  );
}

export default App;
