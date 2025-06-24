import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabase } from "@/lib/supabase" // <-- Use the exported supabase instance

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      const { reference, metadata, amount } = event.data
      const { userId, type } = metadata

      // Use the imported supabase instance
      // Update transaction status
      await supabase.from("transactions").update({ status: "completed" }).eq("reference", reference)

      if (type === "activation") {
        // Activate user account
        await supabase
          .from("taskona.users")
          .update({
            is_activated: true,
            activation_date: new Date().toISOString(),
            balance: 1500, // Add welcome bonus
          })
          .eq("id", userId)

        // Add welcome bonus transaction
        await supabase.from("transactions").insert({
          user_id: userId,
          type: "welcome_bonus",
          amount: 1500,
          status: "completed",
          description: "Welcome bonus for account activation",
        })

        // Process referral bonus if user was referred
        const { data: user } = await supabase.from("users").select("referred_by").eq("id", userId).single()

        if (user?.referred_by) {
          // Add referral bonus to referrer
          await supabase.rpc("add_referral_bonus", {
            referrer_id: user.referred_by,
            referred_id: userId,
            bonus_amount: 300,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
