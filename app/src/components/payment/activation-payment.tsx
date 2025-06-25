"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, Shield, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface ActivationPaymentProps {
  userEmail: string
  userId: string
  onSuccess: () => void
}

export default function ActivationPayment({ userEmail, userId, onSuccess }: ActivationPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Initialize payment with your backend
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: 35000, // ₦350 in kobo
          userId: userId,
          type: "activation",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect user to Paystack hosted payment page
      window.location.href = data.authorization_url
    } catch (error: any) {
      toast.error(error.message || "Payment failed")
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CreditCard className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activate Your Account</h2>
          <p className="text-gray-600">Pay ₦300 to unlock all features and start earning</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-semibold text-green-700">What you get:</span>
            </div>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• ₦1,500 welcome bonus</li>
              <li>• Access to daily tasks</li>
              <li>• Referral earning system</li>
              <li>• Withdrawal capabilities</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700">Secure payment powered by Paystack</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">₦300</div>
          <div className="text-gray-600">One-time activation fee</div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Spinner size="sm" className="mr-2" />
              Processing...
            </div>
          ) : (
            "Pay ₦300 & Activate"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
