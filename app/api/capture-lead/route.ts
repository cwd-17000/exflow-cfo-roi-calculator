import { NextResponse } from "next/server";

const portalId = "147279996";
const formId = "2b8b7dd9-aa18-4c0c-a8a0-2d4a15938806";
const hubspotFormSubmitUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const lead = payload?.lead;

  if (!lead?.workEmail) {
    return NextResponse.json({ error: "Missing lead email." }, { status: 400 });
  }

  const response = await fetch(hubspotFormSubmitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: [
        { name: "firstname", value: lead.firstName },
        { name: "lastname", value: lead.lastName },
        { name: "email", value: lead.workEmail },
        { name: "company", value: lead.companyName },
        { name: "jobtitle", value: lead.jobTitle },
        { name: "dynamics_platform", value: lead.dynamicsPlatform }
      ],
      context: {
        pageName: "Truvio AP Automation ROI Calculator",
        pageUri: request.headers.get("referer") ?? "https://exflow-cfo-roi-calculator.vercel.app/"
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: "HubSpot form submission failed.", detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
