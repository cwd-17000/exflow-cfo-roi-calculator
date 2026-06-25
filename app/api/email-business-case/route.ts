import { NextResponse } from "next/server";
import { BusinessInputs, ScenarioKey } from "@/lib/businessCase";
import { businessCaseHtml, businessCaseSummary, CapturedLead } from "@/lib/emailBusinessCase";

const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const transactionalEmailId = process.env.HUBSPOT_TRANSACTIONAL_EMAIL_ID;

const subject = "Your AP Automation business case from Truvio";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { lead?: CapturedLead; inputs?: BusinessInputs; activeScenario?: ScenarioKey } | null;

  if (!payload?.lead?.workEmail || !payload.inputs || !payload.activeScenario) {
    return NextResponse.json({ error: "Missing business case details." }, { status: 400 });
  }

  if (!hubspotToken || !transactionalEmailId) {
    return NextResponse.json({ error: "HubSpot email is not configured. Add HUBSPOT_PRIVATE_APP_TOKEN and HUBSPOT_TRANSACTIONAL_EMAIL_ID." }, { status: 501 });
  }

  const html = businessCaseHtml(payload.lead, payload.inputs, payload.activeScenario);
  const { executiveSummary } = businessCaseSummary(payload.lead, payload.inputs, payload.activeScenario);

  const response = await fetch("https://api.hubapi.com/marketing/v3/transactional/single-email/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hubspotToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emailId: Number(transactionalEmailId),
      message: {
        to: payload.lead.workEmail,
        subject
      },
      customProperties: {
        first_name: payload.lead.firstName,
        company_name: payload.lead.companyName,
        executive_summary: executiveSummary,
        business_case_html: html
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: "HubSpot email send failed.", detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
