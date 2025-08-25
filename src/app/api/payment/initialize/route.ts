import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const { email, amount, userId, type } = await request.json()

    // Validate amount (convert to kobo if needed)
    const amountInKobo = typeof amount === "number" ? amount : Math.round(Number.parseFloat(amount) * 100)

    if (amountInKobo < 100) {
      // Minimum 1 naira
      return NextResponse.json({ error: "Minimum amount is ₦1" }, { status: 400 })
    }

    // Get the origin from the request URL
    const origin = new URL(request.url).origin

    // Generate unique reference
    const reference = `TSK_${type.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize payment with Paystack
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo, // Amount in kobo
        reference,
        callback_url: `${origin}/payment/callback`,
        metadata: {
          userId,
          type,
        },
      }),
    })

    const response = await res.json()

    if (response.status) {
      // Store transaction in Firestore
      await addDoc(collection(db, "transactions"), {
        user_id: userId,
        type,
        amount: amountInKobo / 100, // Store in naira
        reference,
        status: "pending",
        description: type === "activation" ? "Account activation fee" : `${type} payment`,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        reference,
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
      })
    } else {
      throw new Error(response.message || "Payment initialization failed")
    }
  } catch (error: any) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: error.message || "Payment initialization failed" }, { status: 500 })
  }
}
