import { useState, useMemo, useCallback } from "react";
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
import OrderSummary from "./components/OrderSummary";
import TotalsSummary from "./components/TotalsSummary";
import Footer from "./components/Footer";
import PrintQuote from "./components/PrintQuote";
import ClientModal from "./components/ClientModal";

function App() {
  const [allTacticConfigurations, setAllTacticConfigurations] =
    useState(buildInitialConfigs);
  const [selectedTactics, setSelectedTactics] = useState({});
  const [discountPercentage] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [kickoffDate, setKickoffDate] = useState("");
  const [activePackage, setActivePackage] = useState(null);
  const [showQuote, setShowQuote] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    name: "",
    website: "",
    brief: "",
  });

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

    // Package-specific duration defaults
    const pkgDuration = 6;

    pkg.serviceIds.forEach((serviceId) => {
      const service = data.find((t) => t.ID === serviceId);
      if (service) {
        const initialConfig = { ...(newAllTacticConfigurations[service.ID] || {}) };

        // Set duration for Relationship and Execution based on package
        if (service.ID === 19) {
          initialConfig.selectedDuration = pkgDuration;
        }
        if (service.ID === 15) {
          const hours = initialConfig.selectedMonthlyHours || 40;
          initialConfig.selectedDuration = pkgDuration;
          initialConfig.selectedVariantName = `${pkgDuration} Months @ ${hours} hrs/month`;
        }

        const result = calculateTacticCost(service, initialConfig);
        newSelectedTactics[service.ID] = {
          tactic: service,
          config: initialConfig,
          hours: result.hours,
          cost: result.cost,
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

      // Cross-sync: Relationship duration ↔ Execution variant
      if (tacticId === 19 && newConfig.selectedDuration) {
        // Relationship changed duration → update Execution's variant
        const execConfig = updatedAllConfigs[15] || {};
        const hours = execConfig.selectedMonthlyHours || 40;
        const variantName = `${newConfig.selectedDuration} Months @ ${hours} hrs/month`;
        updatedAllConfigs[15] = { ...execConfig, selectedDuration: newConfig.selectedDuration, selectedVariantName: variantName };
      }
      if (tacticId === 15 && newConfig.selectedMonthlyHours) {
        // Execution changed hours → update variant with current duration
        const relConfig = updatedAllConfigs[19] || {};
        const duration = relConfig.selectedDuration || newConfig.selectedDuration || 3;
        const variantName = `${duration} Months @ ${newConfig.selectedMonthlyHours} hrs/month`;
        updatedAllConfigs[15] = { ...updatedAllConfigs[15], selectedDuration: duration, selectedVariantName: variantName };
      }

      // Recalculate costs for all affected tactics
      setSelectedTactics((selectedPrev) => {
        let updated = { ...selectedPrev };
        [tacticId, 15, 19].forEach((id) => {
          if (updated[id]) {
            const t = updated[id].tactic;
            const c = updatedAllConfigs[id] || {};
            const result = calculateTacticCost(t, c);
            updated[id] = { ...updated[id], config: c, hours: result.hours, cost: result.cost };
          }
        });
        return updated;
      });

      return updatedAllConfigs;
    });
  };

  const hasSelectedTactics = Object.keys(selectedTactics).length > 0;

  // Divider categories — draw a line before "Strategy"
  const dividerBefore = new Set(["Strategy", "Experimentation"]);

  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    const ids = Object.keys(selectedTactics).join(",");
    if (ids) params.set("s", ids);
    // Execution config
    const execConfig = allTacticConfigurations[15] || {};
    if (execConfig.selectedMonthlyHours) params.set("hours", execConfig.selectedMonthlyHours);
    // Duration from Relationship
    const relConfig = allTacticConfigurations[19] || {};
    if (relConfig.selectedDuration) params.set("duration", relConfig.selectedDuration);
    // Software
    const techConfig = allTacticConfigurations[20] || {};
    if (techConfig.selectedSoftware) params.set("software", techConfig.selectedSoftware);
    // Baseline
    const baseConfig = allTacticConfigurations[4] || {};
    if (baseConfig.baselineOption) params.set("baseline", baseConfig.baselineOption);
    // Usability participants
    const usConfig = allTacticConfigurations[9] || {};
    if (usConfig.selectedParticipants) params.set("participants", usConfig.selectedParticipants);
    // Info architecture
    const iaConfig = allTacticConfigurations[12] || {};
    if (iaConfig.pageHierarchy) params.set("pages", iaConfig.pageHierarchy);
    // Conversion review personas
    const crConfig = allTacticConfigurations[13] || {};
    if (crConfig.additionalpersona) params.set("personas", crConfig.additionalpersona);
    // Kickoff date
    if (kickoffDate) params.set("kickoff", kickoffDate);
    // Client details
    if (clientDetails.name) params.set("client", clientDetails.name);
    if (clientDetails.website) params.set("website", clientDetails.website);

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [selectedTactics, allTacticConfigurations, kickoffDate, clientDetails]);

  const handleShare = useCallback(async () => {
    const url = buildShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: clientDetails.name ? `Quote for ${clientDetails.name}` : "Service Cost Calculator Quote",
          url,
        });
      } catch (e) {
        // User cancelled share — ignore
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  }, [buildShareUrl, clientDetails.name]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8${showQuote ? ' print-main-content' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Header with gradient background */}
            <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ background: '#F8F8F8' }}>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, #EFF2F9 0%, rgba(239,242,249,0) 50%)',
                }}
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  width: 537,
                  height: 557,
                  top: -100,
                  right: -150,
                  background: 'linear-gradient(to bottom, rgba(66,142,255,0.5) 0%, rgba(63,38,72,0.23) 100%)',
                  borderRadius: '50%',
                  filter: 'blur(95px)',
                  transform: 'rotate(81deg)',
                  opacity: 0.5,
                }}
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  width: 537,
                  height: 557,
                  bottom: -200,
                  left: -200,
                  background: 'linear-gradient(to bottom, rgba(66,142,255,0.5) 0%, rgba(63,38,72,0.23) 100%)',
                  borderRadius: '50%',
                  filter: 'blur(95px)',
                  transform: 'rotate(-80deg)',
                  opacity: 0.5,
                }}
              />
              <div className="relative">
                <Header />
                <div className="print-hide"><PackageSelector
                  activePackage={activePackage}
                  onSelectPackage={handleSelectPackage}
                /></div>
                <div className="pb-8" />
              </div>
            </div>

            {/* Show/Hide cost & hours buttons */}
            <div className="flex gap-3 mb-4 mt-4 print-hide">
              <button
                onClick={() => setShowPrice(!showPrice)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: showPrice ? '#25B1A2' : 'white',
                  color: showPrice ? 'white' : '#494949',
                  border: showPrice ? '1.5px solid #25B1A2' : '1.5px solid #DFDFDF',
                }}
              >
                {showPrice ? 'Hide costs' : 'Show costs'}
              </button>
              <button
                onClick={() => setShowHours(!showHours)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: showHours ? '#25B1A2' : 'white',
                  color: showHours ? 'white' : '#494949',
                  border: showHours ? '1.5px solid #25B1A2' : '1.5px solid #DFDFDF',
                }}
              >
                {showHours ? 'Hide hours' : 'Show hours'}
              </button>
            </div>

            {/* Service categories */}
            {CATEGORY_ORDER.map((categoryName) => {
              const services = categorizedData[categoryName];
              if (!services || services.length === 0) return null;

              return (
                <div key={categoryName}>
                  {dividerBefore.has(categoryName) && (
                    <hr className="my-10" style={{ borderColor: '#E4E4E4' }} />
                  )}
                  <section className="mb-8">
                    <h3
                      className="font-bold mb-5"
                      style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, lineHeight: 1.3, color: '#494949' }}
                    >
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
                          showHours={showHours}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              );
            })}

            {/* Investment totals */}
            {hasSelectedTactics && (
              <TotalsSummary
                totals={totals}
                selectedTactics={selectedTactics}
              />
            )}

            <Footer
              kickoffDate={kickoffDate}
              onDateChange={setKickoffDate}
              onQuote={() => setShowQuote(true)}
              onClientDetails={() => setShowClientModal(true)}
              hasClientDetails={!!clientDetails.name}
              onShare={handleShare}
            />
          </div>

          {/* Right column — Order summary sidebar */}
          <div className="hidden lg:block min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
            <OrderSummary
              showPrice={showPrice}
              setShowPrice={setShowPrice}
              selectedTactics={selectedTactics}
              onRemoveTactic={toggleTacticSelection}
              totals={totals}
            />
          </div>
        </div>
      </div>
      {showClientModal && (
        <ClientModal
          clientDetails={clientDetails}
          onSave={(details) => {
            setClientDetails(details);
            setShowClientModal(false);
          }}
          onClose={() => setShowClientModal(false)}
        />
      )}
      {showQuote && (
        <PrintQuote
          selectedTactics={selectedTactics}
          totals={totals}
          kickoffDate={kickoffDate}
          clientDetails={clientDetails}
          onClose={() => setShowQuote(false)}
          onShare={handleShare}
        />
      )}
    </div>
  );
}

export default App;
