import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore";


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
      const { userId, type } = metadata;

      if (userId && type === "activation") {
        // Update transaction status
        const transactionRef = doc(db, "transactions", reference);
        await updateDoc(transactionRef, { status: "completed" });

        // Activate user account with welcome bonus
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, {
            is_activated: true,
            activation_date: new Date().toISOString(),
            balance: (userData.balance || 0) + 1500, // ₦1500 welcome bonus
          });

          // Add welcome bonus transaction
          await addDoc(collection(db, "transactions"), {
            user_id: userId,
            type: "welcome_bonus",
            amount: 1500,
            status: "completed",
            reference: `WELCOME_${Date.now()}`,
            description: "Welcome bonus for account activation",
            created_at: new Date().toISOString(),
          });

          // Process referral bonus if user was referred
          if (userData.referred_by) {
            const referrerRef = doc(db, "users", userData.referred_by);
            const referrerSnap = await getDoc(referrerRef);

            if (referrerSnap.exists()) {
              const referrerData = referrerSnap.data();
              await updateDoc(referrerRef, {
                balance: (referrerData.balance || 0) + 100, // changed from 300 to 100
                total_earned: (referrerData.total_earned || 0) + 100, // changed from 300 to 100
              });

              // Add referral transaction
              await addDoc(collection(db, "transactions"), {
                user_id: userData.referred_by,
                type: "referral_bonus",
                amount: 100, // changed from 300 to 100
                status: "completed",
                reference: `REF_${Date.now()}`,
                description: "Referral bonus payment",
                created_at: new Date().toISOString(),
              });
            }
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
