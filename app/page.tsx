"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  benchmarkInputs,
  BusinessInputs,
  calculateAllScenarios,
  calculateScenario,
  formatCurrency,
  formatNumber,
  formatPercent,
  ScenarioKey,
  scenarios
} from "@/lib/businessCase";

type Field = {
  key: keyof BusinessInputs;
  label: string;
  help: string;
  suffix?: string;
  step?: number;
  percent?: boolean;
  module: "Baseline" | "Cost" | "Cash" | "Control" | "Resource" | "Investment";
};

type LeadForm = {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyName: string;
  jobTitle: string;
  dynamicsPlatform: "" | "Finance & Supply Chain Management" | "Business Central" | "Other";
};

type CapturedLead = LeadForm & { capturedAt: string };

type EmailStatus = "idle" | "sending" | "sent" | "error";

const freeEmailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "zoho.com",
  "yandex.com"
]);

const fields: Field[] = [
  { key: "annualApCost", label: "Annual AP department cost", help: "Total AP operating cost used to calculate current cost per invoice.", module: "Baseline", step: 50000 },
  { key: "annualInvoices", label: "Annual invoice volume", help: "Total invoices processed each year.", module: "Baseline", step: 1000 },
  { key: "staffFtes", label: "AP staff FTEs", help: "Front-line AP analysts, clerks, specialists, or accountants.", module: "Baseline", step: 1 },
  { key: "loadedStaffCost", label: "Loaded cost per staff FTE", help: "Salary plus benefits / overhead allocation per AP staff FTE.", module: "Resource", step: 10000 },
  { key: "otherOpex", label: "Other AP operating expense", help: "Systems, storage, postage, copying, and other AP operating costs.", module: "Cost", step: 10000 },
  { key: "availableDiscounts", label: "Available early-pay discounts", help: "Annual supplier discounts available if AP can process and approve fast enough.", module: "Cash", step: 10000 },
  { key: "discountsCaptured", label: "Discounts captured today", help: "Current annual early-payment discounts already captured.", module: "Cash", step: 5000 },
  { key: "latePenalties", label: "Annual late-payment penalties", help: "Current penalties, fees, or avoidable payment leakage from late AP execution.", module: "Cash", step: 5000 },
  { key: "annualPayablesSpend", label: "Annual payables spend", help: "Total annual spend flowing through AP.", module: "Cash", step: 1000000 },
  { key: "currentDpo", label: "Current DPO", help: "Current days payable outstanding.", module: "Cash", suffix: "days", step: 1 },
  { key: "targetDpo", label: "Target DPO", help: "Post-automation DPO target enabled by faster, controlled processing.", module: "Cash", suffix: "days", step: 1 },
  { key: "errorRate", label: "Invoice exception rate", help: "Percent of invoices requiring error handling or rework.", module: "Control", percent: true, step: 0.005 },
  { key: "reworkCostPerError", label: "Rework cost per exception", help: "Fully loaded cost to investigate and correct one invoice exception.", module: "Control", step: 5 },
  { key: "auditControlCost", label: "Audit / control cost", help: "Annual AP audit prep, control testing, and internal control effort.", module: "Control", step: 10000 },
  { key: "auditEfficiencyGain", label: "Audit efficiency gain", help: "Potential reduction in audit/control effort from traceability and automation.", module: "Control", percent: true, step: 0.01 },
  { key: "fraudExposure", label: "Fraud exposure", help: "Expected annual loss/exposure from duplicate payments, fraud, or payment risk.", module: "Control", step: 10000 },
  { key: "fraudRiskReduction", label: "Fraud risk reduction", help: "Potential reduction in exposure from automated validation and controls.", module: "Control", percent: true, step: 0.01 },
  { key: "complianceCost", label: "Compliance cost", help: "Regulatory, tax, or AP compliance effort cost.", module: "Control", step: 10000 },
  { key: "complianceCostReduction", label: "Compliance cost reduction", help: "Potential compliance effort reduction from automated evidence and traceability.", module: "Control", percent: true, step: 0.01 },
  { key: "steadyStateStaffFtes", label: "Steady-state AP staff FTEs", help: "Target front-line AP FTE level after automation reaches steady state.", module: "Resource", step: 1 },
  { key: "discountRate", label: "Discount rate / WACC", help: "Cost of capital used for NPV.", module: "Investment", percent: true, step: 0.01 },
  { key: "year0Investment", label: "Year 0 investment", help: "Initial license and implementation investment.", module: "Investment", step: 10000 },
  { key: "annualRecurringInvestment", label: "Annual recurring investment", help: "Year 1–3 license, support, and run-cost investment.", module: "Investment", step: 10000 }
];

const modules = [
  {
    name: "Cost Efficiency & Productivity",
    short: "Cost",
    body: "Lower cost per invoice, reduce processing effort, and increase AP throughput without making headcount the only story."
  },
  {
    name: "Cash & Working Capital",
    short: "Cash",
    body: "Model discount capture, penalty avoidance, and DPO-driven working-capital value."
  },
  {
    name: "Accuracy, Control & Risk",
    short: "Control",
    body: "Quantify avoided rework, audit efficiency, fraud-risk reduction, and compliance effort reduction."
  },
  {
    name: "Resource Reallocation",
    short: "Talent",
    body: "Separate FTEs removed from FTE capacity redeployed into higher-value finance work."
  }
];

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

function validateLeadForm(form: LeadForm) {
  if (!form.firstName.trim()) return "Please enter your first name.";
  if (!form.lastName.trim()) return "Please enter your last name.";
  if (!form.companyName.trim()) return "Please enter your company name.";
  if (!form.jobTitle.trim()) return "Please enter your job title.";
  if (!form.dynamicsPlatform) return "Please select your Dynamics Platform.";
  if (!/^\S+@\S+\.\S+$/.test(form.workEmail.trim())) return "Please enter a valid work email.";
  if (freeEmailDomains.has(getEmailDomain(form.workEmail))) return "Please use a work email address, not a free personal email domain.";
  return null;
}

export default function Home() {
  const [inputs, setInputs] = useState<BusinessInputs>(benchmarkInputs);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("expected");
  const [openModule, setOpenModule] = useState<Field["module"]>("Baseline");
  const [leadForm, setLeadForm] = useState<LeadForm>({ firstName: "", lastName: "", workEmail: "", companyName: "", jobTitle: "", dynamicsPlatform: "" });
  const [capturedLead, setCapturedLead] = useState<CapturedLead | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const active = useMemo(() => calculateScenario(inputs, activeScenario), [inputs, activeScenario]);
  const comparison = useMemo(() => calculateAllScenarios(inputs), [inputs]);
  const visibleFields = fields.filter((field) => field.module === openModule);
  const maxStream = Math.max(...Object.values(active.streams).flat());

  function updateInput(field: Field, value: string) {
    const parsed = Number(value);
    setInputs((current) => ({ ...current, [field.key]: Number.isFinite(parsed) ? parsed : 0 }));
  }

  function resetBenchmark() {
    setInputs(benchmarkInputs);
    setActiveScenario("expected");
    setEmailStatus("idle");
    setEmailError(null);
  }

  function updateLeadForm(field: keyof LeadForm, value: string) {
    setLeadForm((current) => ({ ...current, [field]: value }));
    setFormError(null);
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateLeadForm(leadForm);
    if (error) {
      setFormError(error);
      return;
    }

    const lead = { ...leadForm, workEmail: leadForm.workEmail.trim().toLowerCase(), capturedAt: new Date().toISOString() };
    setCapturedLead(lead);
    setFormError(null);

    await fetch("/api/capture-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead, inputs, scenario: activeScenario })
    }).catch(() => undefined);
  }

  async function emailBusinessCase() {
    if (!capturedLead || emailStatus === "sending") return;

    setEmailStatus("sending");
    setEmailError(null);

    try {
      const response = await fetch("/api/email-business-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: capturedLead, inputs, activeScenario })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Email could not be sent.");
      }

      setEmailStatus("sent");
    } catch (error) {
      setEmailStatus("error");
      setEmailError(error instanceof Error ? error.message : "Email could not be sent.");
    }
  }

  return (
    <main>
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center justify-between rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm backdrop-blur">
            <span className="font-semibold tracking-tight text-white">Truvio AP Automation ROI Calculator</span>
            <a href="#calculator" className="focus-ring rounded-full bg-aqua px-4 py-2 font-semibold text-ink transition hover:bg-white">Build the case</a>
          </nav>

          <div className="grid gap-10 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-aqua">AP automation business case</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">Build your AP automation business case in under 5 minutes</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">Adjust your invoice volume, team size, and payment mix to generate a finance-ready business case with NPV, payback period, and scenario comparison.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#calculator" className="focus-ring inline-flex justify-center rounded-full bg-aqua px-6 py-4 font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-white">Open calculator</a>
                <button onClick={resetBenchmark} className="focus-ring inline-flex justify-center rounded-full border border-white/20 px-6 py-4 font-semibold text-white transition hover:bg-white/10">Reset to benchmark</button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white p-5 text-ink shadow-soft sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine">Benchmark expected scenario</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <HeroMetric label="3-year ROI" value={formatPercent(active.roi, 0)} active={activeScenario === "expected"} />
                <HeroMetric label="NPV" value={formatCurrency(active.npv, true)} active={activeScenario === "expected"} />
                <HeroMetric label="Payback" value={active.paybackYears ? `${formatNumber(active.paybackYears, 1)} years` : ">3 years"} active={activeScenario === "expected"} />
                <HeroMetric label="IRR" value={formatPercent(active.irr, 0)} active={activeScenario === "expected"} />
              </div>
              <p className="mt-5 text-sm leading-6 text-muted">With benchmark inputs, Expected produces ~498% ROI, ~$6.8M NPV, and ~1.3-year payback — matching the source business-case model.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-12 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {modules.map((module) => (
            <div key={module.name} className="rounded-3xl border border-ink/10 bg-white p-5 shadow-line">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{module.short}</p>
              <h2 className="mt-3 text-lg font-semibold">{module.name}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{module.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="calculator" className="bg-white px-4 py-14 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine">Scenario engine</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Adjust assumptions. Compare finance outcomes.</h2>
              <p className="mt-3 max-w-3xl leading-7 text-muted">Use benchmark values for a fast estimate, then replace them with your own AP operating data to generate a complete business case.</p>
            </div>
            <div className="flex rounded-full bg-mist p-1">
              {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
                <button key={key} onClick={() => setActiveScenario(key)} className={classNames("focus-ring rounded-full px-4 py-2 text-sm font-semibold transition", activeScenario === key ? "bg-pine text-white shadow-line" : "text-pine hover:bg-white")}>
                  {scenarios[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-ink/10 bg-cream p-5 shadow-line sm:p-6">
              <div className="flex flex-wrap gap-2">
                {(["Baseline", "Cost", "Cash", "Control", "Resource", "Investment"] as Field["module"][]).map((module) => (
                  <button key={module} onClick={() => setOpenModule(module)} className={classNames("focus-ring rounded-full px-4 py-2 text-sm font-semibold transition", openModule === module ? "bg-ink text-white" : "bg-white text-pine hover:bg-mist")}>
                    {module}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4">
                {visibleFields.map((field) => (
                  <label key={field.key} className="block rounded-3xl bg-white p-4 shadow-line">
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
                      {field.label}
                      {field.percent ? <span className="text-xs text-muted">%</span> : field.suffix ? <span className="text-xs text-muted">{field.suffix}</span> : null}
                    </span>
                    <input
                      type="number"
                      value={field.percent ? Number((inputs[field.key] * 100).toFixed(3)) : inputs[field.key]}
                      step={field.percent ? (field.step ?? 0.01) * 100 : field.step ?? 1}
                      onChange={(event) => {
                        const value = field.percent ? String(Number(event.target.value) / 100) : event.target.value;
                        updateInput(field, value);
                      }}
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-base font-semibold outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15"
                    />
                    <span className="mt-2 block text-xs leading-5 text-muted">{field.help}</span>
                  </label>
                ))}
              </div>
            </div>

            {capturedLead ? (
              <ResultsPanel active={active} comparison={comparison} maxStream={maxStream} onEmailBusinessCase={emailBusinessCase} emailStatus={emailStatus} emailError={emailError} />
            ) : (
              <LeadGate leadForm={leadForm} formError={formError} onChange={updateLeadForm} onSubmit={submitLead} />
            )}
          </div>
        </div>
      </section>

      <section className="bg-mist px-4 py-12 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-6 shadow-line sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine">Positioning note</p>
          <h2 className="mt-3 text-2xl font-semibold">Designed for lead generation, not black-box claims.</h2>
          <p className="mt-3 leading-7 text-muted">The strongest AP automation business case is collaborative: replace benchmarks with real data, compare scenarios, and give finance leaders a concise model they can circulate internally.</p>
        </div>
      </section>
    </main>
  );
}

function LeadGate({ leadForm, formError, onChange, onSubmit }: { leadForm: LeadForm; formError: string | null; onChange: (field: keyof LeadForm, value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-ink p-5 text-white shadow-soft sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua">Unlock your business case</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">Your numbers suggest real savings potential.</h3>
      <p className="mt-3 leading-7 text-white/75">Enter your details to view your complete 3-year business case, including NPV, payback period, and scenario comparison.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <LeadInput label="First name" value={leadForm.firstName} onChange={(value) => onChange("firstName", value)} autoComplete="given-name" />
          <LeadInput label="Last name" value={leadForm.lastName} onChange={(value) => onChange("lastName", value)} autoComplete="family-name" />
        </div>
        <LeadInput label="Work email" type="email" value={leadForm.workEmail} onChange={(value) => onChange("workEmail", value)} autoComplete="email" />
        <LeadInput label="Company name" value={leadForm.companyName} onChange={(value) => onChange("companyName", value)} autoComplete="organization" />
        <div className="grid gap-4 sm:grid-cols-2">
          <LeadInput label="Job title" value={leadForm.jobTitle} onChange={(value) => onChange("jobTitle", value)} autoComplete="organization-title" />
          <LeadSelect label="Dynamics Platform" value={leadForm.dynamicsPlatform} onChange={(value) => onChange("dynamicsPlatform", value)} options={["Finance & Supply Chain Management", "Business Central", "Other"]} />
        </div>
        {formError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</p> : null}
        <button type="submit" className="focus-ring rounded-full bg-aqua px-6 py-4 font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-white">Show my results</button>
        <p className="text-xs leading-5 text-white/55">We’ll use this to personalize your business case and follow up with relevant AP automation resources.</p>
      </form>
    </div>
  );
}

function ResultsPanel({ active, comparison, maxStream, onEmailBusinessCase, emailStatus, emailError }: { active: ReturnType<typeof calculateScenario>; comparison: ReturnType<typeof calculateAllScenarios>; maxStream: number; onEmailBusinessCase: () => void; emailStatus: EmailStatus; emailError: string | null }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] bg-ink p-5 text-white shadow-soft sm:p-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua">{active.label} scenario</p>
            <h3 className="mt-3 text-2xl font-semibold">CFO headline metrics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigator.clipboard?.writeText(`Truvio AP automation business case (${active.label}): ${formatPercent(active.roi, 0)} 3-year ROI, ${formatCurrency(active.npv)} NPV, ${active.paybackYears ? formatNumber(active.paybackYears, 1) + " year" : ">3 year"} payback.`)} className="focus-ring rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Copy summary</button>
            <button onClick={onEmailBusinessCase} disabled={emailStatus === "sending" || emailStatus === "sent"} className="focus-ring rounded-full bg-aqua px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70">{emailStatus === "sending" ? "Sending…" : emailStatus === "sent" ? "Email sent" : "Email me this business case"}</button>
          </div>
        </div>
        {emailError ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{emailError}</p> : null}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ResultMetric label="3-year ROI" value={formatPercent(active.roi, 0)} />
          <ResultMetric label="NPV" value={formatCurrency(active.npv, true)} />
          <ResultMetric label="Payback" value={active.paybackYears ? `${formatNumber(active.paybackYears, 1)} yrs` : ">3 yrs"} />
          <ResultMetric label="IRR" value={formatPercent(active.irr, 0)} />
        </div>
        <div className="mt-6 grid gap-3 text-sm text-white/75 sm:grid-cols-3">
          <p><strong className="text-white">Current cost/invoice:</strong><br />{formatCurrency(active.steadyState.currentCostPerInvoice)}</p>
          <p><strong className="text-white">Future cost/invoice:</strong><br />{formatCurrency(active.steadyState.futureCostPerInvoice)}</p>
          <p><strong className="text-white">Freed FTE capacity:</strong><br />{formatNumber(active.steadyState.freedFtes, 1)} FTEs</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-line sm:p-7">
        <h3 className="text-xl font-semibold">Value breakdown by module</h3>
        <div className="mt-5 space-y-4">
          <StreamBar label="Cost Efficiency & Productivity" value={sumStream(active.streams.costEfficiency)} max={maxStream * 3} color="bg-aqua" />
          <StreamBar label="Cash & Working Capital" value={sumStream(active.streams.cashWorkingCapital)} max={maxStream * 3} color="bg-gold" />
          <StreamBar label="Accuracy, Control & Risk" value={sumStream(active.streams.accuracyControlRisk)} max={maxStream * 3} color="bg-pine" />
          <StreamBar label="Resource Reallocation" value={sumStream(active.streams.resourceReallocation)} max={maxStream * 3} color="bg-ink" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-line">
        <div className="border-b border-ink/10 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="text-xl font-semibold">Base / Expected / Upside comparison</h3>
            <button disabled title="Phase 2" className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-muted">Download PDF Business Case</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-[0.14em] text-muted">
              <tr><th className="p-4">Scenario</th><th className="p-4">Benefits</th><th className="p-4">ROI</th><th className="p-4">NPV</th><th className="p-4">Payback</th></tr>
            </thead>
            <tbody>
              {comparison.map((scenario) => (
                <tr key={scenario.key} className="border-t border-ink/10">
                  <td className="p-4 font-semibold">{scenario.label}</td>
                  <td className="p-4">{formatCurrency(scenario.totalBenefits, true)}</td>
                  <td className="p-4">{formatPercent(scenario.roi, 0)}</td>
                  <td className="p-4">{formatCurrency(scenario.npv, true)}</td>
                  <td className="p-4">{scenario.paybackYears ? `${formatNumber(scenario.paybackYears, 1)} yrs` : ">3 yrs"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadInput({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/85">{label}</span>
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-ink outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/20" />
    </label>
  );
}

function LeadSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/85">{label}</span>
      <select required value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-ink outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/20">
        <option value="">Select one</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function sumStream(values: [number, number, number]) {
  return values[0] + values[1] + values[2];
}

function HeroMetric({ label, value, active }: { label: string; value: string; active: boolean }) {
  return <div className={classNames("rounded-3xl p-4", active ? "bg-mist" : "bg-cream")}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p><p className="mt-2 text-2xl font-semibold text-ink">{value}</p></div>;
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>;
}

function StreamBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = Math.max(4, Math.min(100, (value / max) * 100));
  return <div><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold">{label}</span><span className="text-muted">{formatCurrency(value, true)}</span></div><div className="h-3 rounded-full bg-mist"><div className={classNames("h-3 rounded-full", color)} style={{ width: `${width}%` }} /></div></div>;
}
