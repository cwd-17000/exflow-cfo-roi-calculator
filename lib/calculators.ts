export type CalculatorType = "suite" | "banking" | "payments" | "ap" | "payrec" | "ecommerce";
export type FormulaType = "suite" | "banking" | "payments" | "ap" | "payrec" | "ecommerce";

export type FieldDef = {
  key: string;
  label: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  help?: string;
  advanced?: boolean;
};

export type ToggleDef = {
  key: string;
  label: string;
  description: string;
  impact: number;
  defaultChecked: boolean;
};

export type CalculatorDef = {
  id: CalculatorType;
  name: string;
  shortName: string;
  eyebrow: string;
  headline: string;
  description: string;
  poweredBy?: string;
  efficiency: number;
  formula: FormulaType;
  fields: FieldDef[];
  toggles: ToggleDef[];
  resultLabel: string;
  outcomeNotes: string[];
};

export type Inputs = Record<string, number>;
export type ToggleState = Record<string, boolean>;

export type Result = {
  manualHours: number;
  adjustedManualHours: number;
  hoursSavedMonthly: number;
  laborSavedMonthly: number;
  laborSavedAnnual: number;
  tasksReducedMonthly: number;
  multiplier: number;
  efficiency: number;
  revenueLiftMonthly?: number;
  activeToggleLabels: string[];
  explanation: string[];
};

const hourly = {
  key: "hourlyCost",
  label: "Fully loaded hourly labor cost",
  default: 45,
  min: 1,
  step: 1,
  suffix: "$/hr",
  help: "Editable assumption used to convert time savings into labor cost savings.",
  advanced: true
};

export const calculators: CalculatorDef[] = [
  {
    id: "suite",
    name: "Financial Automation Suite",
    shortName: "Suite",
    eyebrow: "Multi-product Finance Automation",
    headline: "Estimate the CFO-facing impact of AP, payments, banking, treasury, and close automation.",
    description: "Use this multi-product workflow when the business case spans invoice processing, vendor disbursements, bank activity, cash visibility, and month-end close work.",
    poweredBy: "Financial Automation Suite — Truvio solutions for AP, Banking, Treasury, Payments, and Reconciliation inside Microsoft Dynamics 365.",
    efficiency: 0.68,
    formula: "suite",
    resultLabel: "Finance automation suite impact estimated",
    fields: [
      { key: "invoices", label: "Monthly invoices processed", default: 1000, min: 0, step: 50 },
      { key: "payments", label: "Monthly vendor payments", default: 650, min: 0, step: 25 },
      { key: "transactions", label: "Monthly bank/payment transactions", default: 1400, min: 0, step: 50 },
      { key: "invoiceMinutes", label: "Manual minutes per invoice", default: 12, min: 0, step: 0.5, suffix: "min" },
      { key: "paymentMinutes", label: "Manual minutes per payment", default: 6, min: 0, step: 0.5, suffix: "min" },
      { key: "reconcileMinutes", label: "Manual minutes per transaction", default: 2, min: 0, step: 0.5, suffix: "min" },
      { key: "closeDays", label: "Manual month-end close duration", default: 10, min: 0, step: 0.5, suffix: "days", advanced: true },
      { key: "closeHoursPerDay", label: "Close effort hours per day", default: 6, min: 0, step: 0.5, suffix: "hrs", advanced: true },
      { key: "exceptionRate", label: "Invoice/payment exception rate", default: 7, min: 0, max: 100, step: 0.5, suffix: "%", advanced: true },
      { key: "exceptionMinutes", label: "Minutes to resolve each exception", default: 24, min: 0, step: 1, suffix: "min", advanced: true },
      hourly
    ],
    toggles: [
      { key: "invoice", label: "Manual invoice capture and approval routing", description: "Invoice intake, coding, validation, and approvals rely on manual effort.", impact: 0.16, defaultChecked: true },
      { key: "payments", label: "Manual vendor payment creation", description: "Payment batches, approvals, and status checks are handled across disconnected steps.", impact: 0.14, defaultChecked: true },
      { key: "reconciliation", label: "Manual bank and payment reconciliation", description: "Transactions require manual matching, research, and exception review.", impact: 0.15, defaultChecked: true },
      { key: "close", label: "Manual month-end close tasks", description: "Close work depends on exports, spreadsheets, status chasing, or delayed cash visibility.", impact: 0.12, defaultChecked: true },
      { key: "discounts", label: "Approval delays limit discount capture", description: "Slow invoice and payment workflows reduce on-time payments and early-pay discounts.", impact: 0.08, defaultChecked: false },
      { key: "risk", label: "Payment error, fraud, or compliance risk", description: "Manual controls create avoidable disbursement errors and payment-security exposure.", impact: 0.1, defaultChecked: true }
    ],
    outcomeNotes: [
      "$15 → $3 cost-per-invoice benchmark reflects a 70–80% processing-cost reduction opportunity.",
      "15 → 3 day invoice cycles and ~10 → ~3 day close cycles support faster throughput.",
      "50–75% payment-cycle-time reduction and 40–70% cash-forecasting accuracy improvement strengthen working capital visibility.",
      "40–60% error-free disbursement improvement and 50–90% payment-security risk reduction improve control posture.",
      "Frames value beyond time savings: risk, compliance, error reduction, working capital, and scale without added headcount."
    ]
  },
  {
    id: "banking",
    name: "Banking Automation",
    shortName: "Banking",
    eyebrow: "Banking & Treasury Automation",
    headline: "Estimate cash-visibility, control, and reconciliation impact from banking automation.",
    description: "Model the monthly effort tied to statement handling, unmatched exceptions, manual bank journals, reconciliation support, and close delays.",
    poweredBy: "Banking & Treasury Automation — powered by SKsoft. Solutions powered by SKsoft are SOC 2 compliant.",
    efficiency: 0.6,
    formula: "banking",
    resultLabel: "Banking work shifted toward exception review",
    fields: [
      { key: "bankAccounts", label: "Bank accounts managed", default: 5, min: 1, step: 1 },
      { key: "statements", label: "Monthly bank statements", default: 10, min: 0, step: 1 },
      { key: "transactions", label: "Monthly bank transactions", default: 1000, min: 0, step: 50 },
      { key: "unmatchedItems", label: "Monthly exceptions/unmatched items", default: 80, min: 0, step: 5 },
      { key: "manualJournalEntries", label: "Manual bank journal entries/month", default: 35, min: 0, step: 5 },
      { key: "exceptionMinutes", label: "Minutes reviewing/matching each exception", default: 8, min: 0, step: 0.5, suffix: "min" },
      { key: "statementMinutes", label: "Minutes downloading/organizing each statement", default: 10, min: 0, step: 1, suffix: "min", advanced: true },
      { key: "journalMinutes", label: "Minutes posting each manual bank journal", default: 5, min: 0, step: 0.5, suffix: "min", advanced: true },
      { key: "closeDelayHours", label: "Monthly close delay from reconciliation", default: 12, min: 0, step: 0.5, suffix: "hrs", advanced: true },
      { key: "annualAuditHours", label: "Annual audit hours gathering reconciliation support", default: 40, min: 0, step: 1, suffix: "hrs", advanced: true },
      { key: "growthRate", label: "Expected annual transaction growth", default: 10, min: 0, max: 200, step: 1, suffix: "%", advanced: true },
      hourly
    ],
    toggles: [
      { key: "download", label: "Manual statement downloads", description: "Teams collect and organize statements outside Dynamics 365.", impact: 0.08, defaultChecked: true },
      { key: "categorize", label: "Manual bank journal posting", description: "Fees, interest, sweeps, direct withdrawals, and other non-subledger activity are posted manually.", impact: 0.14, defaultChecked: true },
      { key: "match", label: "Manual exception matching", description: "Unmatched items require manual research, matching, and resolution.", impact: 0.18, defaultChecked: true },
      { key: "multi", label: "Multiple-account reconciliation", description: "Reconciliation spans entities, accounts, formats, or bank relationships.", impact: 0.1, defaultChecked: true },
      { key: "close", label: "Reconciliation delays month-end close", description: "Bank reconciliation work pushes close timing or creates late-cycle audit support requests.", impact: 0.12, defaultChecked: true },
      { key: "growth", label: "Transaction volume is scaling", description: "Future-state volume growth increases manual effort unless the process is automated.", impact: 0.08, defaultChecked: false }
    ],
    outcomeNotes: ["Supports a wide range of banking formats and communication requirements.", "Uses exception volume instead of total transaction volume to keep the estimate realistic.", "Adds manual bank journals, close-delay impact, audit-readiness effort, and transaction growth assumptions."]
  },
  {
    id: "payments",
    name: "Payment Automation",
    shortName: "Payments",
    eyebrow: "Vendor Payment Automation",
    headline: "Estimate payment-control, risk, and support-load impact from payment automation.",
    description: "Quantify payment-run effort across batch creation, validation, approvals, transmission, confirmations, exceptions, remittance follow-up, and bank-portal risk.",
    efficiency: 0.6,
    formula: "payments",
    resultLabel: "Payment operations labor reduced",
    fields: [
      { key: "payments", label: "Monthly vendor payments", default: 500, min: 0, step: 25 },
      { key: "paymentRuns", label: "Payment runs per month", default: 12, min: 0, step: 1 },
      { key: "paymentAccounts", label: "Payment accounts", default: 4, min: 0, step: 1 },
      { key: "legalEntities", label: "Legal entities processing payments", default: 2, min: 0, step: 1 },
      { key: "batchMinutes", label: "Minutes per payment run", default: 55, min: 0, step: 5, suffix: "min", help: "Includes file creation, validation, approvals, upload/transmission, confirmations, and issue resolution." },
      { key: "statusMinutes", label: "Minutes investigating status/exceptions/remittance per payment", default: 1.5, min: 0, step: 0.5, suffix: "min" },
      { key: "errorRate", label: "Rejected/exception payment rate", default: 2, min: 0, max: 100, step: 0.5, suffix: "%", advanced: true },
      { key: "resolveMinutes", label: "Minutes to resolve each rejected/exception payment", default: 20, min: 0, step: 1, suffix: "min", advanced: true },
      hourly
    ],
    toggles: [
      { key: "create", label: "Manual payment run creation", description: "Payment files, validations, approvals, transmissions, and confirmations are handled manually.", impact: 0.16, defaultChecked: true },
      { key: "accounts", label: "Multiple payment accounts", description: "Payment work is split across accounts, banks, rails, or payment methods.", impact: 0.1, defaultChecked: true },
      { key: "entities", label: "Multiple legal entities", description: "Entity-specific approvals, bank files, and controls add coordination effort.", impact: 0.1, defaultChecked: true },
      { key: "status", label: "Manual payment exception and remittance follow-up", description: "Teams investigate payment status, rejected payments, and vendor remittance questions.", impact: 0.12, defaultChecked: true },
      { key: "failed", label: "Manual failed/returned payment handling", description: "Returned payments create extra research, rework, and vendor support load.", impact: 0.1, defaultChecked: false },
      { key: "risk", label: "Manual bank portal and file handling risk", description: "Manual files and portal activity increase fraud, control, and compliance exposure.", impact: 0.12, defaultChecked: true }
    ],
    outcomeNotes: ["Reduces fragmented payment work without overstating cash impact.", "Models payment runs, accounts, legal entities, exception handling, and remittance/status investigation.", "Highlights cleaner approvals, lower payment risk, fewer errors, and fewer status-chasing tickets."]
  },
  {
    id: "ap",
    name: "AP Automation",
    shortName: "AP",
    eyebrow: "Accounts Payable Automation",
    headline: "Estimate AP impact across invoice cost, approval controls, errors, and working capital.",
    description: "Model AP effort from invoice intake through approval routing and exception handling.",
    poweredBy: "Accounts Payable Automation — powered by ExFlow.",
    efficiency: 0.65,
    formula: "ap",
    resultLabel: "Invoice processing effort automated",
    fields: [
      { key: "invoices", label: "Monthly invoices", default: 750, min: 0, step: 25 },
      { key: "captureMinutes", label: "Intake/capture minutes", default: 4, min: 0, step: 0.5, suffix: "min" },
      { key: "codeMinutes", label: "Code/validate minutes", default: 5, min: 0, step: 0.5, suffix: "min" },
      { key: "approvalMinutes", label: "Routing/chasing approvals minutes", default: 3, min: 0, step: 0.5, suffix: "min" },
      { key: "exceptionRate", label: "Exception rate", default: 8, min: 0, max: 100, step: 0.5, suffix: "%", advanced: true },
      { key: "exceptionMinutes", label: "Exception resolution minutes", default: 25, min: 0, step: 1, suffix: "min", advanced: true },
      hourly
    ],
    toggles: [
      { key: "email", label: "Invoices arrive by email/PDF", description: "Invoice intake is not standardized at the point of entry.", impact: 0.1, defaultChecked: true },
      { key: "enter", label: "Manual invoice data entry", description: "AP staff key invoice information into the system.", impact: 0.18, defaultChecked: true },
      { key: "code", label: "Manual GL/vendor coding", description: "Coding and validation rely on individual review.", impact: 0.15, defaultChecked: true },
      { key: "route", label: "Manual approval routing", description: "Approvals are routed or chased outside a unified workflow.", impact: 0.15, defaultChecked: true },
      { key: "duplicates", label: "Manual duplicate/mismatch checks", description: "Controls depend on manual matching and investigation.", impact: 0.12, defaultChecked: true },
      { key: "prep", label: "Manual payment prep after approval", description: "Approved invoices still require downstream payment preparation.", impact: 0.1, defaultChecked: false }
    ],
    outcomeNotes: ["Connects AP automation to stronger controls and faster time to value in Dynamics 365.", "Keeps exceptions visible instead of hiding them in manual follow-up.", "Surfaces invoice accuracy, compliance, discount capture, and AP scalability without additional headcount."]
  },
  {
    id: "payrec",
    name: "Payment & Reconciliation Automation",
    shortName: "Pay + Recon",
    eyebrow: "Payments and Reconciliation",
    headline: "Estimate close-speed, payment visibility, and reconciliation-control impact.",
    description: "Use this path when the workflow spans payment creation, status visibility, bank activity, and reconciliation after payment.",
    poweredBy: "Banking & Treasury Automation — powered by SKsoft.",
    efficiency: 0.6,
    formula: "payrec",
    resultLabel: "Combined payment and reconciliation work reduced",
    fields: [
      { key: "payments", label: "Monthly vendor payments", default: 500, min: 0, step: 25 },
      { key: "transactions", label: "Monthly bank/payment transactions to reconcile", default: 1000, min: 0, step: 50 },
      { key: "paymentMinutes", label: "Minutes prepare/send payment", default: 5, min: 0, step: 0.5, suffix: "min" },
      { key: "reconcileMinutes", label: "Minutes reconcile transaction", default: 2, min: 0, step: 0.5, suffix: "min" },
      { key: "exceptionRate", label: "Exception rate", default: 5, min: 0, max: 100, step: 0.5, suffix: "%", advanced: true },
      { key: "exceptionMinutes", label: "Minutes resolve exception", default: 25, min: 0, step: 1, suffix: "min", advanced: true },
      hourly
    ],
    toggles: [
      { key: "payment", label: "Manual payment creation", description: "Outgoing payments require manual preparation.", impact: 0.13, defaultChecked: true },
      { key: "routing", label: "Manual approval routing", description: "Approvals add follow-up time and delay.", impact: 0.12, defaultChecked: true },
      { key: "reconcile", label: "Manual bank/payment reconciliation", description: "Post-payment reconciliation depends on manual matching.", impact: 0.18, defaultChecked: true },
      { key: "systems", label: "Reconcile across multiple systems", description: "Data lives across portals, banks, entities, or ledgers.", impact: 0.12, defaultChecked: true },
      { key: "exceptions", label: "Exceptions require back-and-forth", description: "Research depends on email threads or disconnected notes.", impact: 0.12, defaultChecked: true },
      { key: "visibility", label: "Limited real-time status visibility", description: "Teams spend time searching for payment and bank activity status.", impact: 0.1, defaultChecked: true }
    ],
    outcomeNotes: ["Shows the value of exception-only review, faster cash visibility, and a shorter close.", "Useful for combined AP, AR, and cash-management labor scenarios.", "Reduces reconciliation risk, vendor follow-up, and manual status-chasing across payment operations."]
  },
  {
    id: "ecommerce",
    name: "eCommerce ROI",
    shortName: "eCommerce",
    eyebrow: "eCommerce & Product Information Management",
    headline: "Estimate revenue, support-load, order accuracy, and scalability impact from eCommerce automation.",
    description: "Model manual order entry, product content maintenance, reconciliation work, and a configurable digital revenue lift.",
    poweredBy: "eCommerce & Product Information Management — powered by DynamicWeb.",
    efficiency: 0.6,
    formula: "ecommerce",
    resultLabel: "Digital operations effort reduced",
    fields: [
      { key: "onlineRevenue", label: "Current monthly online revenue", default: 100000, min: 0, step: 5000, suffix: "$" },
      { key: "manualOrders", label: "Offline/manual order volume", default: 300, min: 0, step: 10 },
      { key: "aov", label: "Average order value", default: 250, min: 0, step: 10, suffix: "$" },
      { key: "digitalLift", label: "Expected digital revenue lift", default: 2, min: 0, max: 100, step: 0.25, suffix: "%", advanced: true },
      { key: "skuCount", label: "SKU count", default: 5000, min: 0, step: 100 },
      { key: "productHours", label: "Hours maintaining product data/month", default: 60, min: 0, step: 1, suffix: "hrs" },
      { key: "orderMinutes", label: "Minutes per manual order entry", default: 6, min: 0, step: 0.5, suffix: "min" },
      { key: "errorRate", label: "Order error/rework rate", default: 3, min: 0, max: 100, step: 0.5, suffix: "%", advanced: true },
      { key: "reworkMinutes", label: "Minutes per rework", default: 20, min: 0, step: 1, suffix: "min", advanced: true },
      hourly
    ],
    toggles: [
      { key: "entry", label: "Manual order entry", description: "Orders are keyed from emails, spreadsheets, or phone orders.", impact: 0.15, defaultChecked: true },
      { key: "spreadsheets", label: "Product data in spreadsheets", description: "Product information is maintained outside governed workflows.", impact: 0.12, defaultChecked: true },
      { key: "reconciliation", label: "Manual marketplace/payment/order reconciliation", description: "Orders and payments are reconciled by hand.", impact: 0.13, defaultChecked: true },
      { key: "selfservice", label: "Limited customer self-service", description: "Customers rely on staff for order status or repeat orders.", impact: 0.08, defaultChecked: false },
      { key: "launches", label: "Slow product launches/catalog updates", description: "Catalog changes take extra coordination and rework.", impact: 0.1, defaultChecked: true }
    ],
    outcomeNotes: ["Separates labor savings from incremental revenue, so the estimate stays transparent.", "Highlights product content, order accuracy, and faster catalog launch cycles.", "Adds the CFO-relevant lens of lower support load and more order volume without proportional headcount growth."]
  }
];

export function getDefaults(def: CalculatorDef): Inputs {
  return Object.fromEntries(def.fields.map((field) => [field.key, field.default]));
}

export function getToggleDefaults(def: CalculatorDef): ToggleState {
  return Object.fromEntries(def.toggles.map((toggle) => [toggle.key, toggle.defaultChecked]));
}

function value(inputs: Inputs, key: string): number {
  const current = inputs[key];
  return Number.isFinite(current) ? Math.max(0, current) : 0;
}

function toggleMultiplier(def: CalculatorDef, toggles: ToggleState): number {
  const raw = 1 + def.toggles.reduce((sum, toggle) => sum + (toggles[toggle.key] ? toggle.impact : 0), 0);
  return Math.min(raw, 1.5);
}

function baseHours(def: CalculatorDef, inputs: Inputs): { hours: number; tasks: number; extraExplanation: string[]; revenueLiftMonthly?: number } {
  switch (def.formula) {
    case "suite": {
      const invoices = value(inputs, "invoices");
      const payments = value(inputs, "payments");
      const transactions = value(inputs, "transactions");
      const invoiceHours = (invoices * value(inputs, "invoiceMinutes")) / 60;
      const paymentHours = (payments * value(inputs, "paymentMinutes")) / 60;
      const reconHours = (transactions * value(inputs, "reconcileMinutes")) / 60;
      const closeHours = value(inputs, "closeDays") * value(inputs, "closeHoursPerDay");
      const exceptions = ((invoices + payments) * (value(inputs, "exceptionRate") / 100) * value(inputs, "exceptionMinutes")) / 60;
      return {
        hours: invoiceHours + paymentHours + reconHours + closeHours + exceptions,
        tasks: invoices + payments + transactions,
        extraExplanation: [
          "Manual hours combine invoice processing, vendor payments, bank/payment reconciliation, close effort, and exception resolution.",
          "Benchmark lens: 70–80% invoice cost reduction, 60–80% faster invoice cycles, >70% shorter close duration, and 50–75% faster payment cycles."
        ]
      };
    }
    case "banking": {
      const statements = value(inputs, "statements");
      const unmatchedItems = value(inputs, "unmatchedItems");
      const manualJournalEntries = value(inputs, "manualJournalEntries");
      const statementHours = (statements * value(inputs, "statementMinutes")) / 60;
      const exceptionHours = (unmatchedItems * value(inputs, "exceptionMinutes")) / 60;
      const journalHours = (manualJournalEntries * value(inputs, "journalMinutes")) / 60;
      const closeDelayHours = value(inputs, "closeDelayHours");
      const auditHoursMonthly = value(inputs, "annualAuditHours") / 12;
      const growthHours = (unmatchedItems * (value(inputs, "growthRate") / 100) * value(inputs, "exceptionMinutes")) / 60;
      return {
        hours: statementHours + exceptionHours + journalHours + closeDelayHours + auditHoursMonthly + growthHours,
        tasks: statements + unmatchedItems + manualJournalEntries,
        extraExplanation: [
          "Manual hours combine statement handling, unmatched-item review, manual bank journal posting, close delay, and audit-support effort.",
          "Growth assumption adds future-state exception effort so scaling volume is visible before headcount becomes the default answer."
        ]
      };
    }
    case "payments": {
      const payments = value(inputs, "payments");
      const paymentRuns = value(inputs, "paymentRuns");
      const batchHours = (paymentRuns * value(inputs, "batchMinutes")) / 60;
      const statusHours = (payments * value(inputs, "statusMinutes")) / 60;
      const rework = (payments * (value(inputs, "errorRate") / 100) * value(inputs, "resolveMinutes")) / 60;
      const complexityHours = (paymentRuns * (value(inputs, "paymentAccounts") + value(inputs, "legalEntities")) * 2) / 60;
      return {
        hours: batchHours + statusHours + rework + complexityHours,
        tasks: payments + paymentRuns,
        extraExplanation: [
          "Manual hours include payment-run preparation, file validation, approvals, transmission, confirmations, status/remittance investigation, and exception rework.",
          "Account and legal-entity counts add a light complexity factor for fragmented payment operations."
        ]
      };
    }
    case "ap": {
      const invoices = value(inputs, "invoices");
      const core = (invoices * (value(inputs, "captureMinutes") + value(inputs, "codeMinutes") + value(inputs, "approvalMinutes"))) / 60;
      const exceptions = (invoices * (value(inputs, "exceptionRate") / 100) * value(inputs, "exceptionMinutes")) / 60;
      return { hours: core + exceptions, tasks: invoices, extraExplanation: ["Manual hours include invoice intake, coding/validation, approval follow-up, and exception handling."] };
    }
    case "payrec": {
      const paymentHours = (value(inputs, "payments") * value(inputs, "paymentMinutes")) / 60;
      const reconHours = (value(inputs, "transactions") * value(inputs, "reconcileMinutes")) / 60;
      const exceptions = ((value(inputs, "payments") + value(inputs, "transactions")) * (value(inputs, "exceptionRate") / 100) * value(inputs, "exceptionMinutes")) / 60;
      return { hours: paymentHours + reconHours + exceptions, tasks: value(inputs, "payments") + value(inputs, "transactions"), extraExplanation: ["Manual hours combine outgoing payment preparation, transaction reconciliation, and exception resolution."] };
    }
    case "ecommerce": {
      const orderEntry = (value(inputs, "manualOrders") * value(inputs, "orderMinutes")) / 60;
      const rework = (value(inputs, "manualOrders") * (value(inputs, "errorRate") / 100) * value(inputs, "reworkMinutes")) / 60;
      const productMaintenance = value(inputs, "productHours");
      const revenueLiftMonthly = value(inputs, "onlineRevenue") * (value(inputs, "digitalLift") / 100);
      return { hours: orderEntry + rework + productMaintenance, tasks: value(inputs, "manualOrders") + Math.round(value(inputs, "skuCount") / 100), revenueLiftMonthly, extraExplanation: ["Labor estimate includes manual order entry, order rework, and product content maintenance.", "Incremental digital revenue is shown separately from labor savings."] };
    }
  }
}

export function calculate(def: CalculatorDef, inputs: Inputs, toggles: ToggleState): Result {
  const multiplier = toggleMultiplier(def, toggles);
  const base = baseHours(def, inputs);
  const adjustedManualHours = base.hours * multiplier;
  const cap = def.formula === "payments" ? 0.85 : 0.9;
  const efficiency = Math.min(def.efficiency, cap);
  const hoursSavedMonthly = Math.min(adjustedManualHours * efficiency, adjustedManualHours * cap);
  const laborSavedMonthly = hoursSavedMonthly * value(inputs, "hourlyCost");
  const activeToggleLabels = def.toggles.filter((toggle) => toggles[toggle.key]).map((toggle) => toggle.label);
  return {
    manualHours: base.hours,
    adjustedManualHours,
    hoursSavedMonthly,
    laborSavedMonthly,
    laborSavedAnnual: laborSavedMonthly * 12,
    tasksReducedMonthly: Math.round(base.tasks * efficiency),
    multiplier,
    efficiency,
    revenueLiftMonthly: base.revenueLiftMonthly,
    activeToggleLabels,
    explanation: [
      ...base.extraExplanation,
      `${activeToggleLabels.length} selected practice${activeToggleLabels.length === 1 ? "" : "s"} adjusted the baseline effort by ${Math.round((multiplier - 1) * 100)}%.`,
      `Estimated automation efficiency is ${Math.round(efficiency * 100)}%; outputs are directional estimates, not guarantees.`
    ]
  };
}

export function formatCurrency(valueToFormat: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(valueToFormat);
}

export function formatNumber(valueToFormat: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: fractionDigits }).format(valueToFormat);
}
