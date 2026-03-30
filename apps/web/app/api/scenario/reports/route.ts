import { NextRequest, NextResponse } from "next/server"

const SCENARIO_API = process.env.SCENARIO_API_URL || "http://localhost:4005"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"

    const res = await fetch(`${SCENARIO_API}/reports?page=${page}&pageSize=${pageSize}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
