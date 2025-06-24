"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Smartphone, Building, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function TopUpModal({ isOpen, onClose, onSuccess, userId }: TopUpModalProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const predefinedAmounts = [1000, 2000, 5000, 10000, 20000, 50000]

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString())
  }

  const handleTopUp = async () => {
    if (!amount || Number.parseFloat(amount) < 100) {
      toast.error("Minimum top-up amount is ₦100")
      return
    }

    setIsProcessing(true)
    try {
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "top_up",
          amount: Number.parseFloat(amount),
          status: "pending",
          reference: `TOP_${Date.now()}`,
          description: `Wallet top-up via ${paymentMethod}`,
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // In a real app, you would integrate with payment providers like Paystack, Flutterwave, etc.
      // For demo purposes, we'll simulate a successful payment
      await simulatePayment(transaction.id, Number.parseFloat(amount))

      toast.success("Top-up successful!")
      onSuccess()
      onClose()
      setAmount("")
    } catch (error: any) {
      toast.error(error.message || "Failed to process top-up")
    } finally {
      setIsProcessing(false)
    }
  }

  const simulatePayment = async (transactionId: string, amount: number) => {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update transaction status
    await supabase.from("transactions").update({ status: "completed" }).eq("id", transactionId)

    // Update user balance
    const { data: user } = await supabase.from("users").select("balance").eq("id", userId).single()

    if (user) {
      await supabase
        .from("users")
        .update({ balance: user.balance + amount })
        .eq("id", userId)
    }
  }

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
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum amount: ₦100</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Debit/Credit Card</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, Verve</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Building className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Bank Transfer</p>
                      <p className="text-sm text-gray-600">Direct bank transfer</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ussd"
                      checked={paymentMethod === "ussd"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">USSD</p>
                      <p className="text-sm text-gray-600">*737# and other USSD codes</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              {amount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Amount to pay:</span>
                    <span className="text-green-800 font-bold text-lg">
                      ₦{Number.parseFloat(amount || "0").toLocaleString()}
                    </span>
                  </div>
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
                disabled={!amount || Number.parseFloat(amount) < 100 || isProcessing}
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
