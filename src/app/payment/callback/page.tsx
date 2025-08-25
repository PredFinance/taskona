"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")

  useEffect(() => {
    if (reference) {
      verifyPayment(reference)
    } else {
      setStatus("failed")
      setMessage("No payment reference found")
    }
  }, [reference])

  const verifyPayment = async (ref: string) => {
    try {
      const response = await fetch(`/api/payment/verify?reference=${ref}`)
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Payment successful! Your account has been activated.")
        toast.success("Account activated successfully!")
      } else {
        setStatus("failed")
        setMessage(data.message || "Payment verification failed")
        toast.error("Payment verification failed")
      }
    } catch (error) {
      setStatus("failed")
      setMessage("Failed to verify payment")
      toast.error("Failed to verify payment")
    }
  }

  const handleContinue = () => {
    if (status === "success") {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {status === "loading" && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Loader className="w-8 h-8 text-blue-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Continue to Dashboard
              </Button>
            </>
          )}

          {status === "failed" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="w-8 h-8 text-red-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
