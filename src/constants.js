import { data } from "./data";

export const HOURLY_RATE = 240;

const ICON_DIR = "/icons/[CK] Service Cost Calculator";

export const TACTIC_ICONS = {
  1: `${ICON_DIR}/image 65.png`,
  2: `${ICON_DIR}/image 50.png`,
  3: `${ICON_DIR}/image 51.png`,
  4: `${ICON_DIR}/image 52.png`,
  5: `${ICON_DIR}/image 58.png`,
  6: `${ICON_DIR}/image 64.png`,
  7: `${ICON_DIR}/image 54.png`,
  8: `${ICON_DIR}/image 55.png`,
  9: `${ICON_DIR}/image 59.png`,
  10: `${ICON_DIR}/image 60.png`,
  11: `${ICON_DIR}/image 62.png`,
  12: `${ICON_DIR}/image 61.png`,
  13: `${ICON_DIR}/image 63.png`,
  14: `${ICON_DIR}/image 61-1.png`,
  15: `${ICON_DIR}/image 67.png`,
  16: `${ICON_DIR}/image 61-2.png`,
  17: `${ICON_DIR}/image 62-1.png`,
  18: `${ICON_DIR}/image 66.png`,
  19: `${ICON_DIR}/image 67-1.png`,
  20: `${ICON_DIR}/image 67-2.png`,
};

export const COMMON_SUBTASK_NAMES = [
  "Discovery Document",
  "Discovery Agenda",
  "Discovery Meeting",
  "Send Discovery Notes",
  "Website Access",
  "GA Access",
  "QA",
  "Presentation",
  "Follow Up and Notes",
  "Pre-Discovery workshop",
  "Participant Recruitment (6 pax)",
  "Screener Questions",
  "Usability Questions & Scenarios",
  "Questions & Scenario Approved",
  "Follow Up and Notes",
  "Account Management",
];

export const getCroVariantDiscount = (duration, monthlyHours) => {
  if (duration === 6) {
    if (monthlyHours === 40) return 0;
    if (monthlyHours === 60) return 0.01;
    if (monthlyHours === 80) return 0.025;
  }
  if (duration === 12) {
    if (monthlyHours === 40) return 0.025;
    if (monthlyHours === 60) return 0.04;
    if (monthlyHours === 80) return 0.05;
  }
  if (duration === 24) {
    if (monthlyHours === 40) return 0.05;
    if (monthlyHours === 60) return 0.075;
    if (monthlyHours === 80) return 0.1;
  }
  return 0;
};

export const CATEGORY_ORDER = [
  "Account & project management",
  "Technical review",
  "Data analysis",
  "UX fundamentals",
  "Customer insights",
  "Conversion",
  "Strategy",
  "Experimentation",
];

export const categorizedData = data.reduce((acc, service) => {
  const cat = service.category;
  acc[cat] = acc[cat] || [];
  acc[cat].push(service);
  return acc;
}, {});

export const packages = {
  Essentials: {
    name: "Essentials",
    description: "Best for companies with smaller budgets",
    serviceIds: [1, 4, 7, 13, 14, 15, 20],
  },
  Pro: {
    name: "Pro",
    popular: true,
    description: "Best for medium-sized companies",
    serviceIds: [1, 2, 3, 4, 6, 7, 13, 14, 16, 15, 19, 20],
  },
  Enterprise: {
    name: "Enterprise",
    description: "Best for those who want all we offer",
    serviceIds: data.map((t) => t.ID),
  },
};

export const buildInitialConfigs = () => {
  const configs = {};
  data.forEach((service) => {
    const config = {};

    if (service.ID === 2) config.additionalpage = 0;
    if (service.ID === 3) config.additionalLeadGenEvent = 0;
    if (service.ID === 5) {
      config["specificTable"] = false;
      config["leadgenreport"] = false;
      config["hybridwebsite"] = false;
    }
    if (service.ID === 10) config.additionalpage = 0;
    if (service.ID === 11) config.additionalcompetitor = 0;
    if (service.ID === 13) config.additionalpersona = 0;
    if (service.ID === 13) config.numAdditionalUserJourneysMeclabs = 0;

    if (
      service.Type === "Execution" &&
      service.Variants &&
      service.Variants.length > 0
    ) {
      config.selectedVariantName = service.Variants[0].Name;
    }
    configs[service.ID] = config;
  });
  return configs;
};

export const formatHoursToMinutes = (decimalHours) => {
  if (isNaN(decimalHours) || decimalHours < 0) return "0 hrs 0 min";
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours} hrs ${minutes} min`;
};

export const formatCurrency = (amount) =>
  Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");


export const calculateTacticCost = (tactic, config) => {
  // Fixed monthly cost services (e.g. Optimisation software)
  if (tactic.fixedMonthlyCost) {
    return { hours: 0, cost: tactic.fixedMonthlyCost };
  }

  let currentHours = tactic["Base Hours"];
  let variantDiscountPct = 0;

  if (tactic.Adjustments) {
    tactic.Adjustments.forEach((adj) => {
      if (adj.Type === "per_unit") {
        const configKey = adj.Unit.replace(/\s/g, "");
        if (tactic.ID === 13 && adj.Unit === "additional user journey") {
          currentHours += (config.numAdditionalUserJourneysMeclabs || 0) * 1;
        } else if (config[configKey] !== undefined) {
          currentHours += config[configKey] * adj.Hours_Per_Unit;
        }
      } else if (adj.Type === "fixed_increase" && config[adj.Condition]) {
        currentHours += adj.Hours_Increase;
      }
    });
  }

  if (tactic.Variants && config.selectedVariantName) {
    const selected = tactic.Variants.find(
      (v) => v.Name === config.selectedVariantName
    );
    if (selected) {
      if (tactic.ID === 9) {
        currentHours += selected.Hours_Increase;
      } else if (tactic.Type === "Execution") {
        currentHours = selected.Monthly_Hours * selected.Duration_Months;
        variantDiscountPct = getCroVariantDiscount(
          selected.Duration_Months,
          selected.Monthly_Hours
        );
      }
    }
  }

  let currentCost = currentHours * HOURLY_RATE;
  currentCost *= 1 - variantDiscountPct;

  return { hours: currentHours, cost: currentCost };
};


export const computeTotals = (selectedTactics, discountPercentage) => {
  let sharedTaskHoursSaved = 0;
  let sharedTaskCostSaved = 0;
  let totalHoursBeforeAllSavings = 0;
  let totalCostBeforeAllSavings = 0;

  const categoryTotals = {};
  CATEGORY_ORDER.forEach((cat) => {
    categoryTotals[cat] = { hours: 0, cost: 0 };
  });

  const typeTotals = {};
  const seenSubtasks = new Set();
  let retainerDiscount = 0;

  Object.values(selectedTactics).forEach((entry) => {
    if (!entry || !entry.tactic) return;

    const { hours: itemHours, cost: itemCost } = calculateTacticCost(
      entry.tactic,
      entry.config,
    );

    if (entry.tactic.Type === "Execution") {
      retainerDiscount += itemHours * HOURLY_RATE - itemCost;
    }

    const cat = entry.tactic.category;
    if (categoryTotals[cat]) {
      categoryTotals[cat].hours += itemHours;
      categoryTotals[cat].cost += itemCost;
    }

    const type = entry.tactic.Type;
    if (!typeTotals[type]) typeTotals[type] = { hours: 0, cost: 0 };
    typeTotals[type].hours += itemHours;
    typeTotals[type].cost += itemCost;

    totalHoursBeforeAllSavings += itemHours;
    totalCostBeforeAllSavings += itemCost;

    if (entry.tactic["Sub-tasks"]) {
      entry.tactic["Sub-tasks"].forEach((sub) => {
        if (COMMON_SUBTASK_NAMES.includes(sub.Name)) {
          if (!seenSubtasks.has(sub.Name)) {
            seenSubtasks.add(sub.Name);
          } else {
            sharedTaskHoursSaved += sub.Hours;
            sharedTaskCostSaved += sub.Hours * HOURLY_RATE;
          }
        }
      });
    }
  });

  const costAfterCommonSavings =
    totalCostBeforeAllSavings - sharedTaskCostSaved;
  const hoursAfterCommonSavings =
    totalHoursBeforeAllSavings - sharedTaskHoursSaved;
  const generalDiscountValue =
    costAfterCommonSavings * (discountPercentage / 100);
  const totalCost = costAfterCommonSavings - generalDiscountValue;

  return {
    totalHours: hoursAfterCommonSavings,
    totalCost,
    totalSavingsCost:
      sharedTaskCostSaved + retainerDiscount + generalDiscountValue,
    croSpecificSavingsCost: retainerDiscount,
    generalDiscountValue,
    auditingCommonSubtaskSavingsCostDisplay: sharedTaskCostSaved,
    categoryTotals,
    typeTotals,
  };
};
