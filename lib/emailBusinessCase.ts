import { BusinessInputs, calculateAllScenarios, calculateScenario, formatCurrency, formatNumber, formatPercent, ScenarioKey } from "@/lib/businessCase";

export type CapturedLead = {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyName: string;
  jobTitle: string;
  dynamicsPlatform: string;
  capturedAt?: string;
};

export function businessCaseSummary(lead: CapturedLead, inputs: BusinessInputs, activeScenario: ScenarioKey) {
  const active = calculateScenario(inputs, activeScenario);
  const comparison = calculateAllScenarios(inputs);
  const executiveSummary = `${lead.firstName}, based on your AP assumptions, the ${active.label} scenario shows ${formatPercent(active.roi, 0)} 3-year ROI, ${formatCurrency(active.npv, true)} NPV, and ${active.paybackYears ? `${formatNumber(active.paybackYears, 1)}-year` : ">3-year"} payback.`;

  return { active, comparison, executiveSummary };
}

export function businessCaseHtml(lead: CapturedLead, inputs: BusinessInputs, activeScenario: ScenarioKey) {
  const { active, comparison, executiveSummary } = businessCaseSummary(lead, inputs, activeScenario);
  const rows = comparison.map((scenario) => `
    <tr>
      <td style="padding:12px;border-top:1px solid #d9e4df;font-weight:700;">${scenario.label}</td>
      <td style="padding:12px;border-top:1px solid #d9e4df;">${formatCurrency(scenario.totalBenefits, true)}</td>
      <td style="padding:12px;border-top:1px solid #d9e4df;">${formatPercent(scenario.roi, 0)}</td>
      <td style="padding:12px;border-top:1px solid #d9e4df;">${formatCurrency(scenario.npv, true)}</td>
      <td style="padding:12px;border-top:1px solid #d9e4df;">${scenario.paybackYears ? `${formatNumber(scenario.paybackYears, 1)} yrs` : ">3 yrs"}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f1ea;color:#10211c;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
      <div style="background:#10211c;color:#ffffff;border-radius:28px;padding:32px;">
        <p style="margin:0 0 12px;color:#73e2d6;text-transform:uppercase;letter-spacing:0.14em;font-size:12px;font-weight:700;">Truvio AP Automation ROI Calculator</p>
        <h1 style="margin:0;font-size:32px;line-height:1.15;">Your AP Automation business case</h1>
        <p style="margin:16px 0 0;color:rgba(255,255,255,0.78);line-height:1.6;">${executiveSummary}</p>
      </div>

      <div style="background:#ffffff;border-radius:24px;padding:28px;margin-top:20px;">
        <h2 style="margin:0 0 16px;font-size:22px;">Headline business case metrics</h2>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px;background:#edf5f2;border-radius:16px;"><strong>3-year ROI</strong><br>${formatPercent(active.roi, 0)}</td>
            <td style="padding:12px;background:#edf5f2;border-radius:16px;"><strong>NPV</strong><br>${formatCurrency(active.npv, true)}</td>
          </tr>
          <tr>
            <td style="padding:12px;background:#edf5f2;border-radius:16px;"><strong>Payback period</strong><br>${active.paybackYears ? `${formatNumber(active.paybackYears, 1)} years` : ">3 years"}</td>
            <td style="padding:12px;background:#edf5f2;border-radius:16px;"><strong>IRR</strong><br>${formatPercent(active.irr, 0)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#ffffff;border-radius:24px;padding:28px;margin-top:20px;">
        <h2 style="margin:0 0 16px;font-size:22px;">Scenario comparison</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#edf5f2;text-align:left;">
              <th style="padding:12px;">Scenario</th>
              <th style="padding:12px;">Benefits</th>
              <th style="padding:12px;">ROI</th>
              <th style="padding:12px;">NPV</th>
              <th style="padding:12px;">Payback</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div style="background:#ffffff;border-radius:24px;padding:28px;margin-top:20px;">
        <h2 style="margin:0 0 12px;font-size:22px;">Executive summary</h2>
        <p style="margin:0;line-height:1.65;color:#53645f;">${executiveSummary} Current modeled cost per invoice is ${formatCurrency(active.steadyState.currentCostPerInvoice)}, compared with ${formatCurrency(active.steadyState.futureCostPerInvoice)} after automation. The model also estimates ${formatNumber(active.steadyState.freedFtes, 1)} FTEs of freed AP capacity.</p>
      </div>

      <p style="margin:20px 0 0;color:#53645f;font-size:12px;line-height:1.5;">This calculator provides directional estimates based on user-entered assumptions and benchmark logic. Results are not a guarantee of future performance.</p>
    </div>
  </body>
</html>`;
}
