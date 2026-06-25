import { NextResponse } from "next/server";

const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const lead = payload?.lead;

  if (!lead?.workEmail) {
    return NextResponse.json({ error: "Missing lead email." }, { status: 400 });
  }

  if (!hubspotToken) {
    return NextResponse.json({ ok: true, skipped: "HubSpot token is not configured." });
  }

  const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hubspotToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        email: lead.workEmail,
        firstname: lead.firstName,
        company: lead.companyName,
        jobtitle: lead.jobTitle,
        erp_system: lead.erp,
        roi_calculator_scenario: payload?.scenario ?? "expected"
      }
    })
  });

  if (response.status === 409) {
    return NextResponse.json({ ok: true, existing: true });
  }

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: "HubSpot lead capture failed.", detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
