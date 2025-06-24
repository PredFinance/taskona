import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    // Verify transaction with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const response = await res.json()

    if (!response.status) {
      return NextResponse.json({
        success: false,
        message: "Failed to verify transaction",
      })
    }

    const txStatus = response.data?.status

    // Only process if transaction is successful
    if (txStatus === "success") {
      const { metadata, amount } = response.data

      if (metadata?.userId && metadata?.type === "activation") {
        // Update transaction status
        await supabase.from("transactions").update({ status: "completed" }).eq("reference", reference)

        // Activate user account with welcome bonus
        await supabase
          .from("users")
          .update({
            is_activated: true,
            activation_date: new Date().toISOString(),
            balance: 1500, // ₦1500 welcome bonus
          })
          .eq("id", metadata.userId)

        // Add welcome bonus transaction
        await supabase.from("transactions").insert({
          user_id: metadata.userId,
          type: "welcome_bonus",
          amount: 1500,
          status: "completed",
          reference: `WELCOME_${Date.now()}`,
          description: "Welcome bonus for account activation",
        })

        // Process referral bonus if user was referred
        const { data: user } = await supabase.from("users").select("referred_by").eq("id", metadata.userId).single()

        if (user?.referred_by) {
          // Add referral bonus to referrer
          const { data: referrer } = await supabase
            .from("users")
            .select("balance, total_earned")
            .eq("id", user.referred_by)
            .single()

          if (referrer) {
            await supabase
              .from("users")
              .update({
                balance: referrer.balance + 300,
                total_earned: referrer.total_earned + 300,
              })
              .eq("id", user.referred_by)

            // Update referral record
            await supabase
              .from("referrals")
              .update({ bonus_paid: 300 })
              .eq("referrer_id", user.referred_by)
              .eq("referred_id", metadata.userId)

            // Add referral transaction
            await supabase.from("transactions").insert({
              user_id: user.referred_by,
              type: "referral_bonus",
              amount: 300,
              status: "completed",
              reference: `REF_${Date.now()}`,
              description: "Referral bonus payment",
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: txStatus === "success",
      status: txStatus,
      message: txStatus === "success" ? "Payment verified successfully" : `Transaction status: ${txStatus}`,
      data: response.data,
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Payment verification failed",
      },
      { status: 500 },
    )
  }
}
