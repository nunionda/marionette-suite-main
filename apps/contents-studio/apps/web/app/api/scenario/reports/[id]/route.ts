import { NextRequest, NextResponse } from "next/server"

const SCENARIO_API = process.env.SCENARIO_API_URL || "http://localhost:4005"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const res = await fetch(`${SCENARIO_API}/report/${encodeURIComponent(id)}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
