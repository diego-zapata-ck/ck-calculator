import {
  UserPlus,
  Bug,
  BarChart2,
  ClipboardList,
  Gauge,
  Map,
  Layout,
  Search,
  Users,
  Video,
  Swords,
  Layers,
  DollarSign,
  Lightbulb,
  Play,
} from "lucide-react";
import { data } from "./data";

export const HOURLY_RATE = 240;

export const TACTIC_ICONS = {
  1: UserPlus,
  2: Bug,
  3: BarChart2,
  4: ClipboardList,
  5: Gauge,
  6: Map,
  7: Layout,
  8: Search,
  9: Users,
  10: Video,
  11: Swords,
  12: Layers,
  13: DollarSign,
  14: Lightbulb,
  15: Play,
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

export const STRATEGY_TACTIC_ID = 14;
export const EXECUTION_TACTIC_ID = 15;

export const CATEGORY_ORDER = ["Auditing", "Strategy", "Execution"];

export const categorizedData = data.reduce((acc, service) => {
  acc[service.Type] = acc[service.Type] || [];
  acc[service.Type].push(service);
  return acc;
}, {});

const executionTactic = data.find((t) => t.Type === "Execution");
export const executionOptions = {
  Monthly_Hours: [...new Set(executionTactic.Variants.map((v) => v.Monthly_Hours))].sort((a, b) => a - b),
  Duration_Months: [...new Set(executionTactic.Variants.map((v) => v.Duration_Months))].sort((a, b) => a - b),
};

export const packages = {
  Light: {
    name: "Essential Optimisation",
    description:
      "Includes Onboarding, Baseline Performance Dashboard, UX/UI Review, Conversion Review, Strategy, and Execution.",
    serviceIds: [1, 4, 7, 13, 14, 15],
  },
  Full: {
    name: "Enterprise Optimisation",
    description: "Includes all tactics, strategy, and Execution",
    serviceIds: data.map((t) => t.ID),
  }
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
      (service.Type === "Strategy" || service.Type === "Execution") &&
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
  amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");


export const calculateTacticCost = (tactic, config) => {
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
      } else if (tactic.Type === "Strategy") {
        currentHours = selected.Monthly_Hours;
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

  const categoryTotals = {
    Auditing: { hours: 0, cost: 0 },
    Strategy: { hours: 0, cost: 0 },
    Execution: { hours: 0, cost: 0 },
  };

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

    categoryTotals[entry.tactic.Type].hours += itemHours;
    categoryTotals[entry.tactic.Type].cost += itemCost;
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

  categoryTotals.Auditing.hours = Math.max(
    0,
    categoryTotals.Auditing.hours - sharedTaskHoursSaved,
  );
  categoryTotals.Auditing.cost = Math.max(
    0,
    categoryTotals.Auditing.cost - sharedTaskCostSaved,
  );

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
  };
};
