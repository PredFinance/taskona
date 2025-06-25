"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface EnhancedTopUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function EnhancedTopUpModal({ isOpen, onClose, onSuccess, userId }: EnhancedTopUpModalProps) {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000, 20000]
  const minAmount = 100
  const maxAmount = 500000 // ₦500,000 max per transaction

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString())
  }

  const handleTopUp = async () => {
    const topUpAmount = Number.parseFloat(amount)

    if (!amount || topUpAmount < minAmount) {
      toast.error(`Minimum top-up amount is ₦${minAmount.toLocaleString()}`)
      return
    }

    if (topUpAmount > maxAmount) {
      toast.error(`Maximum top-up amount is ₦${maxAmount.toLocaleString()}`)
      return
    }

    setIsProcessing(true)
    try {
      // Initialize payment with Paystack
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@example.com", // You'll need to pass user email
          amount: topUpAmount * 100, // Convert to kobo
          userId: userId,
          type: "top_up",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect to Paystack
      window.location.href = data.authorization_url
    } catch (error: any) {
      toast.error(error.message || "Failed to process top-up")
      setIsProcessing(false)
    }
  }

  const isValidAmount = amount && Number.parseFloat(amount) >= minAmount && Number.parseFloat(amount) <= maxAmount

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Up Wallet</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map((preAmount) => (
                    <button
                      key={preAmount}
                      onClick={() => handleAmountSelect(preAmount)}
                      className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                        amount === preAmount.toString()
                          ? "bg-green-100 border-green-500 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      ₦{preAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    placeholder="Enter any amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={minAmount}
                    max={maxAmount}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min: ₦{minAmount.toLocaleString()}</span>
                  <span>Max: ₦{maxAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Amount Validation */}
              {amount && !isValidAmount && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div className="text-sm text-red-700">
                    {Number.parseFloat(amount) < minAmount
                      ? `Amount must be at least ₦${minAmount.toLocaleString()}`
                      : `Amount cannot exceed ₦${maxAmount.toLocaleString()}`}
                  </div>
                </div>
              )}

              {/* Summary */}
              {isValidAmount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Amount to pay:</span>
                    <span className="text-green-800 font-bold text-lg">
                      ₦{Number.parseFloat(amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Powered by Paystack - Secure payment</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                onClick={handleTopUp}
                disabled={!isValidAmount || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Top Up ₦{Number.parseFloat(amount || "0").toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
