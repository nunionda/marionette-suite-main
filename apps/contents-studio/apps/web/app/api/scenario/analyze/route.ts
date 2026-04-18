import { NextRequest, NextResponse } from "next/server"

const SCENARIO_API = process.env.SCENARIO_API_URL || "http://localhost:4005"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${SCENARIO_API}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
