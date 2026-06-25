import {
  BusinessInputs,
  calculateAllScenarios,
  formatCurrency,
  formatNumber,
  formatPercent,
  ScenarioResult
} from "@/lib/businessCase";

const colors = {
  ink: "#10211c",
  pine: "#1f5c4f",
  aqua: "#73e2d6",
  gold: "#c7972d",
  cream: "#f4f1ea",
  mist: "#edf5f2",
  muted: "#53645f",
  white: "#ffffff"
};

const inputGroups: Array<{ title: string; items: Array<{ key: keyof BusinessInputs; label: string; format?: "currency" | "percent" | "number" | "days" }> }> = [
  {
    title: "Baseline",
    items: [
      { key: "annualApCost", label: "Annual AP department cost", format: "currency" },
      { key: "annualInvoices", label: "Annual invoice volume", format: "number" },
      { key: "staffFtes", label: "AP staff FTEs", format: "number" },
      { key: "loadedStaffCost", label: "Loaded cost per staff FTE", format: "currency" }
    ]
  },
  {
    title: "Cash & Working Capital",
    items: [
      { key: "availableDiscounts", label: "Available early-pay discounts", format: "currency" },
      { key: "discountsCaptured", label: "Discounts captured today", format: "currency" },
      { key: "latePenalties", label: "Annual late-payment penalties", format: "currency" },
      { key: "annualPayablesSpend", label: "Annual payables spend", format: "currency" },
      { key: "currentDpo", label: "Current DPO", format: "days" },
      { key: "targetDpo", label: "Target DPO", format: "days" }
    ]
  },
  {
    title: "Control & Risk",
    items: [
      { key: "errorRate", label: "Invoice exception rate", format: "percent" },
      { key: "reworkCostPerError", label: "Rework cost per exception", format: "currency" },
      { key: "auditControlCost", label: "Audit / control cost", format: "currency" },
      { key: "auditEfficiencyGain", label: "Audit efficiency gain", format: "percent" },
      { key: "fraudExposure", label: "Fraud exposure", format: "currency" },
      { key: "fraudRiskReduction", label: "Fraud risk reduction", format: "percent" },
      { key: "complianceCost", label: "Compliance cost", format: "currency" },
      { key: "complianceCostReduction", label: "Compliance cost reduction", format: "percent" }
    ]
  },
  {
    title: "Investment",
    items: [
      { key: "steadyStateStaffFtes", label: "Steady-state AP staff FTEs", format: "number" },
      { key: "discountRate", label: "Discount rate / WACC", format: "percent" },
      { key: "year0Investment", label: "Year 0 investment", format: "currency" },
      { key: "annualRecurringInvestment", label: "Annual recurring investment", format: "currency" }
    ]
  }
];

function valueForInput(inputs: BusinessInputs, item: { key: keyof BusinessInputs; format?: "currency" | "percent" | "number" | "days" }) {
  const value = inputs[item.key];
  if (item.format === "currency") return formatCurrency(value);
  if (item.format === "percent") return formatPercent(value, 1);
  if (item.format === "days") return `${formatNumber(value, 0)} days`;
  return formatNumber(value, 1);
}

function sumStream(values: [number, number, number]) {
  return values[0] + values[1] + values[2];
}

function streamRows(scenario: ScenarioResult) {
  return [
    { label: "Cost Efficiency & Productivity", value: sumStream(scenario.streams.costEfficiency), color: colors.aqua },
    { label: "Cash & Working Capital", value: sumStream(scenario.streams.cashWorkingCapital), color: colors.gold },
    { label: "Accuracy, Control & Risk", value: sumStream(scenario.streams.accuracyControlRisk), color: colors.pine },
    { label: "Resource Reallocation", value: sumStream(scenario.streams.resourceReallocation), color: colors.ink }
  ];
}

function metricCard(label: string, value: string) {
  return `<div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:18px;">
    <div style="color:rgba(255,255,255,0.62);font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">${label}</div>
    <div style="margin-top:8px;color:${colors.white};font-size:28px;font-weight:800;">${value}</div>
  </div>`;
}

function scenarioSection(scenario: ScenarioResult) {
  const rows = streamRows(scenario);
  const max = Math.max(...rows.map((row) => row.value));

  return `<section style="break-inside:avoid;margin-top:28px;border-radius:34px;overflow:hidden;border:1px solid rgba(16,33,28,0.1);background:${colors.white};box-shadow:0 18px 45px rgba(16,33,28,0.08);">
    <div style="background:${colors.ink};color:${colors.white};padding:28px;">
      <div style="color:${colors.aqua};font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">${scenario.label} scenario</div>
      <h2 style="margin:10px 0 0;font-size:30px;line-height:1.1;">CFO headline metrics</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:22px;">
        ${metricCard("3-year ROI", formatPercent(scenario.roi, 0))}
        ${metricCard("NPV", formatCurrency(scenario.npv, true))}
        ${metricCard("Payback", scenario.paybackYears ? `${formatNumber(scenario.paybackYears, 1)} yrs` : ">3 yrs")}
        ${metricCard("IRR", formatPercent(scenario.irr, 0))}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px;color:rgba(255,255,255,.75);font-size:14px;line-height:1.5;">
        <div><strong style="color:${colors.white};">Current cost/invoice</strong><br>${formatCurrency(scenario.steadyState.currentCostPerInvoice)}</div>
        <div><strong style="color:${colors.white};">Future cost/invoice</strong><br>${formatCurrency(scenario.steadyState.futureCostPerInvoice)}</div>
        <div><strong style="color:${colors.white};">Freed FTE capacity</strong><br>${formatNumber(scenario.steadyState.freedFtes, 1)} FTEs</div>
      </div>
    </div>
    <div style="padding:28px;">
      <h3 style="margin:0 0 18px;font-size:22px;color:${colors.ink};">Value breakdown by module</h3>
      ${rows.map((row) => `<div style="margin-top:14px;">
        <div style="display:flex;justify-content:space-between;gap:20px;font-size:15px;margin-bottom:8px;">
          <strong>${row.label}</strong>
          <span style="color:${colors.muted};">${formatCurrency(row.value, true)}</span>
        </div>
        <div style="height:13px;border-radius:999px;background:${colors.mist};overflow:hidden;">
          <div style="height:13px;border-radius:999px;background:${row.color};width:${Math.max(4, Math.min(100, (row.value / max) * 100))}%;"></div>
        </div>
      </div>`).join("")}
    </div>
  </section>`;
}

function assumptionsSection(inputs: BusinessInputs) {
  return `<section style="margin-top:28px;border-radius:34px;background:${colors.white};padding:28px;border:1px solid rgba(16,33,28,0.1);box-shadow:0 18px 45px rgba(16,33,28,0.08);">
    <div style="color:${colors.pine};font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">Customer assumptions</div>
    <h2 style="margin:10px 0 0;font-size:30px;line-height:1.1;color:${colors.ink};">Inputs used to generate this business case</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:22px;">
      ${inputGroups.map((group) => `<div style="break-inside:avoid;border-radius:24px;background:${colors.cream};padding:20px;">
        <h3 style="margin:0 0 12px;color:${colors.ink};font-size:18px;">${group.title}</h3>
        ${group.items.map((item) => `<div style="display:flex;justify-content:space-between;gap:18px;border-top:1px solid rgba(16,33,28,0.09);padding:10px 0;font-size:14px;line-height:1.35;">
          <span style="color:${colors.muted};">${item.label}</span>
          <strong style="color:${colors.ink};text-align:right;">${valueForInput(inputs, item)}</strong>
        </div>`).join("")}
      </div>`).join("")}
    </div>
  </section>`;
}

function buildReportHtml(inputs: BusinessInputs) {
  const scenarios = calculateAllScenarios(inputs);
  const generatedAt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());

  return `<div style="width:1120px;background:${colors.cream};color:${colors.ink};font-family:Inter,Arial,sans-serif;padding:40px;box-sizing:border-box;">
    <section style="background:${colors.ink};color:${colors.white};border-radius:38px;padding:38px;box-shadow:0 24px 60px rgba(16,33,28,.16);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:30px;">
        <div style="font-size:20px;font-weight:800;letter-spacing:-.02em;">Truvio AP Automation ROI Calculator</div>
        <div style="border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 16px;color:rgba(255,255,255,.75);font-size:13px;">Generated ${generatedAt}</div>
      </div>
      <div style="margin-top:42px;max-width:760px;">
        <div style="color:${colors.aqua};font-size:13px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;">PDF business case</div>
        <h1 style="margin:14px 0 0;font-size:56px;line-height:1.02;letter-spacing:-.04em;">Your AP automation business case</h1>
        <p style="margin:20px 0 0;color:rgba(255,255,255,.78);font-size:20px;line-height:1.55;">A finance-ready scenario comparison using your invoice volume, AP cost structure, payment mix, risk assumptions, and investment inputs.</p>
      </div>
    </section>
    ${assumptionsSection(inputs)}
    ${scenarios.map(scenarioSection).join("")}
    <section style="margin-top:28px;border-radius:28px;background:${colors.mist};padding:24px;color:${colors.muted};font-size:13px;line-height:1.55;">
      <strong style="color:${colors.ink};">Disclaimer:</strong> This business case provides directional estimates based on user-entered assumptions and benchmark logic. Results are not a guarantee of future performance. Validate assumptions with finance, IT, and AP stakeholders before making investment decisions.
    </section>
  </div>`;
}

export async function generateBusinessCasePdf(inputs: BusinessInputs) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.zIndex = "-1";
  container.innerHTML = buildReportHtml(inputs);
  document.body.appendChild(container);

  try {
    const report = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(report, {
      backgroundColor: colors.cream,
      scale: 2,
      useCORS: true,
      logging: false
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imageWidth = usableWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let renderedHeight = 0;
    let page = 0;

    while (renderedHeight < imageHeight) {
      if (page > 0) pdf.addPage();
      pdf.addImage(canvas, "PNG", margin, margin - renderedHeight, imageWidth, imageHeight, undefined, "FAST");
      renderedHeight += usableHeight;
      page += 1;
    }

    pdf.save("truvio-ap-automation-business-case.pdf");
  } finally {
    container.remove();
  }
}
