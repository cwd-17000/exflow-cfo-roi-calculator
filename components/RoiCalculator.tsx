"use client";

import { useMemo, useState } from "react";
import { CalculatorType, calculate, calculators, formatCurrency, formatNumber, getDefaults, getToggleDefaults, Inputs, ToggleState } from "@/lib/calculators";

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function RoiCalculator() {
  const [selectedId, setSelectedId] = useState<CalculatorType>("suite");
  const selected = calculators.find((calculator) => calculator.id === selectedId) ?? calculators[0];
  const [inputsById, setInputsById] = useState<Record<CalculatorType, Inputs>>(() => Object.fromEntries(calculators.map((calculator) => [calculator.id, getDefaults(calculator)])) as Record<CalculatorType, Inputs>);
  const [togglesById, setTogglesById] = useState<Record<CalculatorType, ToggleState>>(() => Object.fromEntries(calculators.map((calculator) => [calculator.id, getToggleDefaults(calculator)])) as Record<CalculatorType, ToggleState>);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const inputs = inputsById[selected.id];
  const toggles = togglesById[selected.id];
  const result = useMemo(() => calculate(selected, inputs, toggles), [selected, inputs, toggles]);
  const primaryFields = selected.fields.filter((field) => !field.advanced);
  const advancedFields = selected.fields.filter((field) => field.advanced);
  const impactSignals = getImpactSignals(selected.id);

  function updateInput(key: string, nextValue: string) {
    const parsed = Number(nextValue);
    setInputsById((current) => ({
      ...current,
      [selected.id]: {
        ...current[selected.id],
        [key]: Number.isFinite(parsed) ? parsed : 0
      }
    }));
  }

  function updateToggle(key: string) {
    setTogglesById((current) => ({
      ...current,
      [selected.id]: {
        ...current[selected.id],
        [key]: !current[selected.id][key]
      }
    }));
  }

  return (
    <section id="calculator" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="calculator-heading">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua">ROI calculator</p>
        <h2 id="calculator-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Choose a workflow. Adjust the assumptions. See the estimated impact.</h2>
        <p className="mt-4 text-lg leading-8 text-white/75">Each model is configurable and transparent, so the estimate reflects the practices you select — not a generic benchmark.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6" role="tablist" aria-label="ROI type">
        {calculators.map((calculator) => (
          <button
            key={calculator.id}
            type="button"
            role="tab"
            aria-selected={selected.id === calculator.id}
            onClick={() => {
              setSelectedId(calculator.id);
              setHasCalculated(false);
              setAdvancedOpen(false);
            }}
            className={classNames(
              "focus-ring rounded-2xl border p-4 text-left transition",
              selected.id === calculator.id ? "border-pine bg-pine text-white shadow-soft" : "border-ink/10 bg-white/80 text-ink hover:border-aqua hover:bg-white"
            )}
          >
            <span className={classNames("block text-xs font-semibold uppercase tracking-[0.18em]", selected.id === calculator.id ? "text-aqua" : "text-pine")}>{calculator.shortName}</span>
            <span className="mt-2 block text-sm font-semibold leading-5">{calculator.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-8">
          <div className="border-b border-ink/10 pb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{selected.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{selected.headline}</h3>
            <p className="mt-3 leading-7 text-muted">{selected.description}</p>
            {selected.poweredBy ? <p className="mt-4 rounded-2xl bg-mist px-4 py-3 text-sm font-medium text-pine">{selected.poweredBy}</p> : null}
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {primaryFields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-sm font-semibold text-ink">{field.label}</span>
                <div className="mt-2 flex rounded-2xl border border-ink/10 bg-cream focus-within:border-aqua focus-within:ring-4 focus-within:ring-aqua/15">
                  <input
                    className="w-full rounded-2xl bg-transparent px-4 py-3 text-base font-semibold text-ink outline-none"
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    value={inputs[field.key]}
                    onChange={(event) => updateInput(field.key, event.target.value)}
                  />
                  {field.suffix ? <span className="self-center pr-4 text-sm font-semibold text-muted">{field.suffix}</span> : null}
                </div>
                {field.help ? <span className="mt-1 block text-xs text-muted">{field.help}</span> : null}
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-pine transition hover:border-aqua hover:bg-mist"
            aria-expanded={advancedOpen}
          >
            {advancedOpen ? "Hide" : "Show"} advanced assumptions
            <span aria-hidden="true">{advancedOpen ? "−" : "+"}</span>
          </button>

          {advancedOpen ? (
            <div className="mt-5 grid gap-5 rounded-3xl bg-mist/70 p-5 sm:grid-cols-2">
              {advancedFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-sm font-semibold text-ink">{field.label}</span>
                  <div className="mt-2 flex rounded-2xl border border-ink/10 bg-white focus-within:border-aqua focus-within:ring-4 focus-within:ring-aqua/15">
                    <input
                      className="w-full rounded-2xl bg-transparent px-4 py-3 text-base font-semibold text-ink outline-none"
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 1}
                      value={inputs[field.key]}
                      onChange={(event) => updateInput(field.key, event.target.value)}
                    />
                    {field.suffix ? <span className="self-center pr-4 text-sm font-semibold text-muted">{field.suffix}</span> : null}
                  </div>
                  {field.help ? <span className="mt-1 block text-xs text-muted">{field.help}</span> : null}
                </label>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <h4 className="text-base font-semibold text-ink">Current manual practices</h4>
            <p className="mt-1 text-sm text-muted">Selected items increase the baseline effort before automation efficiency is applied.</p>
            <div className="mt-4 grid gap-3">
              {selected.toggles.map((toggle) => (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => updateToggle(toggle.key)}
                  className={classNames(
                    "focus-ring flex items-start gap-4 rounded-2xl border p-4 text-left transition",
                    toggles[toggle.key] ? "border-aqua bg-aqua/10" : "border-ink/10 bg-white hover:border-aqua"
                  )}
                  aria-pressed={toggles[toggle.key]}
                >
                  <span className={classNames("mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", toggles[toggle.key] ? "border-pine bg-pine text-white" : "border-ink/30 bg-white")} aria-hidden="true">
                    {toggles[toggle.key] ? "✓" : ""}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{toggle.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted">{toggle.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHasCalculated(true)}
            className="focus-ring mt-8 w-full rounded-full bg-pine px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink sm:w-auto"
          >
            Calculate estimated ROI
          </button>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start" aria-live="polite">
          <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-ink text-white shadow-soft">
            <div className="bg-[radial-gradient(circle_at_top_right,rgba(59,183,166,0.38),transparent_20rem)] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqua">Estimated results</p>
              <h3 className="mt-3 text-2xl font-semibold">{hasCalculated ? selected.resultLabel : "Ready when you are"}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">These estimates are directional planning inputs, not guarantees. Adjust assumptions with your actual volumes and labor rates.</p>

              <div className={classNames("mt-7 grid gap-3", !hasCalculated && "opacity-60")}> 
                <Metric label="Hours saved/month" value={hasCalculated ? formatNumber(result.hoursSavedMonthly, 1) : "—"} />
                <Metric label="Labor cost saved/month" value={hasCalculated ? formatCurrency(result.laborSavedMonthly) : "—"} />
                <Metric label="Labor cost saved/year" value={hasCalculated ? formatCurrency(result.laborSavedAnnual) : "—"} highlight />
                <Metric label="Manual tasks reduced/month" value={hasCalculated ? formatNumber(result.tasksReducedMonthly) : "—"} />
                {selected.id === "suite" ? <Metric label="Approx. automated cycle-time reduction" value={hasCalculated ? "50–75%" : "—"} /> : null}
                {selected.id === "suite" ? <Metric label="Benchmark invoice cost range" value={hasCalculated ? "$15 → $3" : "—"} /> : null}
                {selected.id === "ecommerce" ? <Metric label="Potential digital revenue lift/month" value={hasCalculated ? formatCurrency(result.revenueLiftMonthly ?? 0) : "—"} /> : null}
              </div>

              <div className={classNames("mt-5 grid gap-3 sm:grid-cols-2", !hasCalculated && "opacity-60")}>
                {impactSignals.map((signal) => (
                  <ImpactSignal key={signal.label} label={signal.label} value={hasCalculated ? signal.value : "—"} />
                ))}
              </div>

              <div className="mt-7 rounded-3xl bg-white/8 p-5 ring-1 ring-white/10">
                <h4 className="font-semibold text-white">What shaped this estimate</h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                  {(hasCalculated ? result.explanation : ["Complete the calculator to see the active assumptions and selected manual practices."]).map((item) => (
                    <li key={item} className="flex gap-2"><span className="text-aqua">•</span><span>{item}</span></li>
                  ))}
                </ul>
                {hasCalculated && result.activeToggleLabels.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.activeToggleLabels.map((label) => <span key={label} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{label}</span>)}
                  </div>
                ) : null}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => navigator.clipboard?.writeText(`Truvio ROI estimate: ${formatNumber(result.hoursSavedMonthly, 1)} hrs/month, ${formatCurrency(result.laborSavedMonthly)}/month, ${formatCurrency(result.laborSavedAnnual)}/year for ${selected.name}.`)} className="focus-ring inline-flex justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Copy summary</button>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white/80 p-5 shadow-line">
            <h4 className="font-semibold text-ink">Outcome lens</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              {selected.outcomeNotes.map((note) => <li key={note} className="flex gap-2"><span className="text-gold">•</span><span>{note}</span></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function getImpactSignals(id: CalculatorType): Array<{ label: string; value: string }> {
  switch (id) {
    case "suite":
      return [
        { label: "Risk reduction", value: "50–90% fewer payment incidents" },
        { label: "Error reduction", value: "40–60% better error-free disbursement" },
        { label: "Close acceleration", value: ">70% shorter close cycle" },
        { label: "Working capital", value: "25–40% more discounts captured" }
      ];
    case "ap":
      return [
        { label: "Compliance improvement", value: "Stronger approval audit trail" },
        { label: "Error reduction", value: "Fewer duplicate and mismatch issues" },
        { label: "Working capital", value: "More on-time and early-pay opportunities" },
        { label: "Scalability", value: "More invoices without linear headcount" }
      ];
    case "payments":
      return [
        { label: "Risk reduction", value: "Fewer payment-security incidents" },
        { label: "Compliance improvement", value: "Cleaner approvals and payment controls" },
        { label: "Error reduction", value: "Less failed/returned payment rework" },
        { label: "Support load", value: "Fewer status-chasing tickets" }
      ];
    case "banking":
      return [
        { label: "Close acceleration", value: "Faster reconciliation readiness" },
        { label: "Working capital", value: "Clearer cash visibility" },
        { label: "Compliance improvement", value: "More consistent bank controls" },
        { label: "Scalability", value: "More accounts without more manual effort" }
      ];
    case "payrec":
      return [
        { label: "Close acceleration", value: "Faster payment-to-bank matching" },
        { label: "Risk reduction", value: "Fewer unreconciled exceptions" },
        { label: "Working capital", value: "Better payment and cash visibility" },
        { label: "Support load", value: "Less vendor/payment status follow-up" }
      ];
    case "ecommerce":
      return [
        { label: "Support load", value: "More customer self-service" },
        { label: "Error reduction", value: "Fewer order-entry mistakes" },
        { label: "Scalability", value: "More orders without linear headcount" },
        { label: "Working capital", value: "Cleaner order-to-cash handoffs" }
      ];
  }
}

function ImpactSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aqua">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-5 text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={classNames("rounded-3xl p-5 ring-1", highlight ? "bg-aqua text-ink ring-aqua" : "bg-white/8 text-white ring-white/10")}> 
      <p className={classNames("text-sm font-medium", highlight ? "text-ink/70" : "text-white/65")}>{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
