export type ScenarioKey = "base" | "expected" | "upside";

export type BusinessInputs = {
  annualApCost: number;
  annualInvoices: number;
  staffFtes: number;
  managerFtes: number;
  loadedStaffCost: number;
  otherOpex: number;
  availableDiscounts: number;
  discountsCaptured: number;
  latePenalties: number;
  annualPayablesSpend: number;
  currentDpo: number;
  targetDpo: number;
  errorRate: number;
  reworkCostPerError: number;
  auditControlCost: number;
  auditEfficiencyGain: number;
  fraudExposure: number;
  fraudRiskReduction: number;
  complianceCost: number;
  complianceCostReduction: number;
  steadyStateStaffFtes: number;
  discountRate: number;
  year0Investment: number;
  annualRecurringInvestment: number;
};

export type ScenarioDrivers = {
  label: string;
  adoption: [number, number, number];
  opexEfficiency: number;
  costPerInvoiceReduction: number;
  discountCaptureRate: number;
  latePenaltyAvoidance: number;
  dpoRealization: number;
  errorReduction: number;
  auditRealization: number;
  fraudRealization: number;
  complianceRealization: number;
  pctFreedFtesReallocated: number;
  reallocatedWorkMultiplier: number;
};

export type YearlyValue = [number, number, number];

export type ValueStreams = {
  costEfficiency: YearlyValue;
  cashWorkingCapital: YearlyValue;
  accuracyControlRisk: YearlyValue;
  resourceReallocation: YearlyValue;
};

export type ScenarioResult = {
  key: ScenarioKey;
  label: string;
  streams: ValueStreams;
  annualBenefits: YearlyValue;
  totalBenefits: number;
  totalInvestment: number;
  netCashFlows: [number, number, number, number];
  cumulativeCashFlows: [number, number, number, number];
  roi: number;
  irr: number;
  npv: number;
  paybackYears: number | null;
  steadyState: {
    currentCostPerInvoice: number;
    futureCostPerInvoice: number;
    costPerInvoiceSavings: number;
    workingCapitalAnnualValue: number;
    freedFtes: number;
    reallocatedFtes: number;
    removedFtes: number;
  };
};

export const benchmarkInputs: BusinessInputs = {
  annualApCost: 8665000,
  annualInvoices: 50000,
  staffFtes: 10,
  managerFtes: 1,
  loadedStaffCost: 720000,
  otherOpex: 385000,
  availableDiscounts: 100000,
  discountsCaptured: 10000,
  latePenalties: 0,
  annualPayablesSpend: 50000000,
  currentDpo: 30,
  targetDpo: 35,
  errorRate: 0.05,
  reworkCostPerError: 25,
  auditControlCost: 120000,
  auditEfficiencyGain: 0.25,
  fraudExposure: 80000,
  fraudRiskReduction: 0.4,
  complianceCost: 60000,
  complianceCostReduction: 0.2,
  steadyStateStaffFtes: 6,
  discountRate: 0.1,
  year0Investment: 570000,
  annualRecurringInvestment: 380000
};

export const scenarios: Record<ScenarioKey, ScenarioDrivers> = {
  base: {
    label: "Base",
    adoption: [0.4, 0.65, 0.9],
    opexEfficiency: 0.3,
    costPerInvoiceReduction: 0.3,
    discountCaptureRate: 0.5,
    latePenaltyAvoidance: 0.7,
    dpoRealization: 0.5,
    errorReduction: 0.4,
    auditRealization: 0.6,
    fraudRealization: 0.6,
    complianceRealization: 0.6,
    pctFreedFtesReallocated: 0.4,
    reallocatedWorkMultiplier: 1.3
  },
  expected: {
    label: "Expected",
    adoption: [0.5, 0.75, 1],
    opexEfficiency: 0.4,
    costPerInvoiceReduction: 0.4,
    discountCaptureRate: 0.7,
    latePenaltyAvoidance: 0.85,
    dpoRealization: 0.75,
    errorReduction: 0.6,
    auditRealization: 0.8,
    fraudRealization: 0.8,
    complianceRealization: 0.8,
    pctFreedFtesReallocated: 0.5,
    reallocatedWorkMultiplier: 1.5
  },
  upside: {
    label: "Upside",
    adoption: [0.65, 0.9, 1],
    opexEfficiency: 0.5,
    costPerInvoiceReduction: 0.5,
    discountCaptureRate: 0.9,
    latePenaltyAvoidance: 1,
    dpoRealization: 1,
    errorReduction: 0.8,
    auditRealization: 1,
    fraudRealization: 1,
    complianceRealization: 1,
    pctFreedFtesReallocated: 0.7,
    reallocatedWorkMultiplier: 1.8
  }
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const yearly = (steadyStateValue: number, adoption: [number, number, number]): YearlyValue => [steadyStateValue * adoption[0], steadyStateValue * adoption[1], steadyStateValue * adoption[2]];

function npv(rate: number, flows: [number, number, number, number]) {
  return flows.reduce((total, flow, index) => total + flow / Math.pow(1 + rate, index), 0);
}

function irr(flows: [number, number, number, number]) {
  let rate = 0.5;
  for (let i = 0; i < 80; i += 1) {
    let value = 0;
    let derivative = 0;
    flows.forEach((flow, period) => {
      value += flow / Math.pow(1 + rate, period);
      if (period > 0) derivative -= period * flow / Math.pow(1 + rate, period + 1);
    });
    const next = rate - value / derivative;
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - rate) < 0.0000001) return next;
    rate = Math.max(-0.99, Math.min(next, 10));
  }
  return rate;
}

function payback(flows: [number, number, number, number]) {
  let cumulative = flows[0];
  if (cumulative >= 0) return 0;
  for (let year = 1; year < flows.length; year += 1) {
    const previous = cumulative;
    cumulative += flows[year];
    if (cumulative >= 0) return year + Math.abs(previous) / flows[year];
  }
  return null;
}

export function calculateScenario(inputs: BusinessInputs, key: ScenarioKey): ScenarioResult {
  const scenario = scenarios[key];
  const currentCostPerInvoice = inputs.annualApCost / inputs.annualInvoices;
  const futureCostPerInvoice = currentCostPerInvoice * (1 - scenario.costPerInvoiceReduction);
  const costPerInvoiceSavings = inputs.annualInvoices * (currentCostPerInvoice - futureCostPerInvoice);
  const opexSavings = inputs.otherOpex * scenario.opexEfficiency;
  const costEfficiency = yearly(costPerInvoiceSavings + opexSavings, scenario.adoption);

  const incrementalDiscounts = Math.max(0, inputs.availableDiscounts * scenario.discountCaptureRate - inputs.discountsCaptured);
  const avoidedLatePenalties = inputs.latePenalties * scenario.latePenaltyAvoidance;
  const dpoDaysRealized = (inputs.targetDpo - inputs.currentDpo) * scenario.dpoRealization;
  const workingCapitalAnnualValue = (inputs.annualPayablesSpend / 365) * dpoDaysRealized * inputs.discountRate;
  const cashWorkingCapital = yearly(incrementalDiscounts + avoidedLatePenalties + workingCapitalAnnualValue, scenario.adoption);

  const avoidedRework = inputs.annualInvoices * inputs.errorRate * scenario.errorReduction * inputs.reworkCostPerError;
  const auditSavings = inputs.auditControlCost * inputs.auditEfficiencyGain * scenario.auditRealization;
  const fraudSavings = inputs.fraudExposure * inputs.fraudRiskReduction * scenario.fraudRealization;
  const complianceSavings = inputs.complianceCost * inputs.complianceCostReduction * scenario.complianceRealization;
  const accuracyControlRisk = yearly(avoidedRework + auditSavings + fraudSavings + complianceSavings, scenario.adoption);

  const freedFtes = Math.max(0, inputs.staffFtes - inputs.steadyStateStaffFtes);
  const reallocatedFtes = freedFtes * scenario.pctFreedFtesReallocated;
  const removedFtes = freedFtes - reallocatedFtes;
  const reallocSteadyValue = reallocatedFtes * inputs.loadedStaffCost * (scenario.reallocatedWorkMultiplier - 1);
  const resourceReallocation = yearly(reallocSteadyValue, scenario.adoption);

  const annualBenefits: YearlyValue = [0, 1, 2].map((index) => costEfficiency[index] + cashWorkingCapital[index] + accuracyControlRisk[index] + resourceReallocation[index]) as YearlyValue;
  const netCashFlows: [number, number, number, number] = [
    -inputs.year0Investment,
    annualBenefits[0] - inputs.annualRecurringInvestment,
    annualBenefits[1] - inputs.annualRecurringInvestment,
    annualBenefits[2] - inputs.annualRecurringInvestment
  ];
  const cumulativeCashFlows: [number, number, number, number] = [
    netCashFlows[0],
    netCashFlows[0] + netCashFlows[1],
    netCashFlows[0] + netCashFlows[1] + netCashFlows[2],
    netCashFlows[0] + netCashFlows[1] + netCashFlows[2] + netCashFlows[3]
  ];
  const totalBenefits = sum(annualBenefits);
  const totalInvestment = inputs.year0Investment + inputs.annualRecurringInvestment * 3;

  return {
    key,
    label: scenario.label,
    streams: { costEfficiency, cashWorkingCapital, accuracyControlRisk, resourceReallocation },
    annualBenefits,
    totalBenefits,
    totalInvestment,
    netCashFlows,
    cumulativeCashFlows,
    roi: totalBenefits / totalInvestment - 1,
    irr: irr(netCashFlows),
    npv: npv(inputs.discountRate, netCashFlows),
    paybackYears: payback(netCashFlows),
    steadyState: {
      currentCostPerInvoice,
      futureCostPerInvoice,
      costPerInvoiceSavings,
      workingCapitalAnnualValue,
      freedFtes,
      reallocatedFtes,
      removedFtes
    }
  };
}

export function calculateAllScenarios(inputs: BusinessInputs) {
  return (Object.keys(scenarios) as ScenarioKey[]).map((key) => calculateScenario(inputs, key));
}

export function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard"
  }).format(value);
}

export function formatPercent(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: digits }).format(value);
}

export function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}
