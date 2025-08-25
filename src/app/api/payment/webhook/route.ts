import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc, collection, addDoc, runTransaction } from "firebase/firestore";

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
      const { reference, metadata } = event.data
      const { userId, type } = metadata

      if (type === "activation") {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, "users", userId);
          const userSnap = await transaction.get(userRef);

          if (!userSnap.exists()) {
            throw "User does not exist.";
          }
          
          const userData = userSnap.data();

          // Activate user account
          transaction.update(userRef, {
            is_activated: true,
            activation_date: new Date().toISOString(),
            balance: (userData.balance || 0) + 1500, // Add welcome bonus
          });

          // Add welcome bonus transaction
          const welcomeBonusRef = doc(collection(db, "transactions"));
          transaction.set(welcomeBonusRef, {
            user_id: userId,
            type: "welcome_bonus",
            amount: 1500,
            status: "completed",
            description: "Welcome bonus for account activation",
            created_at: new Date().toISOString(),
          });

          // Process referral bonus if user was referred
          if (userData.referred_by) {
            const referrerRef = doc(db, "users", userData.referred_by);
            const referrerSnap = await transaction.get(referrerRef);
            if (referrerSnap.exists()) {
              const referrerData = referrerSnap.data();
              transaction.update(referrerRef, {
                balance: (referrerData.balance || 0) + 300,
                total_earned: (referrerData.total_earned || 0) + 300,
              });

              const referralBonusRef = doc(collection(db, "transactions"));
              transaction.set(referralBonusRef, {
                user_id: userData.referred_by,
                type: "referral_bonus",
                amount: 300,
                status: "completed",
                description: `Referral bonus for ${userData.full_name}`,
                 created_at: new Date().toISOString(),
              });
            }
          }
        });
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
