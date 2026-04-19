import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

/**
 * POST /api/score/callback
 *
 * Called by Python service when scoring is complete.
 * Saves result to Supabase and updates application status.
 * Protected by shared secret header.
 */
export async function POST(req: NextRequest) {
  // Verify internal secret
  const secret = req.headers.get("x-internal-secret")
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await req.json()

    if (!result.application_id) {
      return NextResponse.json({ error: "application_id required" }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from("applications")
      .update({
        status: result.status === "completed" ? "completed" : "failed",
        score: result.score ?? null,
        candidate_name: result.candidate_name ?? null,
        candidate_email: result.candidate_email ?? null,
        result_json: result,
      })
      .eq("id", result.application_id)

    if (error) {
      console.error("Callback DB update error:", error)
      return NextResponse.json({ error: "DB update failed" }, { status: 500 })
    }

    console.log(`✓ Scored application ${result.application_id}: ${result.score}/100`)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("Callback error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
