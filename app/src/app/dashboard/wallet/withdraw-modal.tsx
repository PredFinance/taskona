"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  currentBalance: number
}

export default function WithdrawModal({ isOpen, onClose, onSuccess, userId, currentBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const minimumWithdrawal = 1000
  const withdrawalFee = 50

  const handleWithdraw = async () => {
    const withdrawAmount = Number.parseFloat(amount)

    if (!amount || withdrawAmount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₦${minimumWithdrawal.toLocaleString()}`)
      return
    }

    if (withdrawAmount > currentBalance) {
      toast.error("Insufficient balance")
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all bank details")
      return
    }

    if (accountNumber.length < 10) {
      toast.error("Please enter a valid account number")
      return
    }

    setIsSubmitting(true)
    try {
      // Create withdrawal request
      const { error: withdrawalError } = await supabase.from("withdrawals").insert({
        user_id: userId,
        amount: withdrawAmount,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        status: "pending",
        reference: `WTH_${Date.now()}`,
      })

      if (withdrawalError) throw withdrawalError

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "withdrawal",
        amount: withdrawAmount,
        status: "pending",
        reference: `WTH_${Date.now()}`,
        description: `Withdrawal to ${bankName} - ${accountNumber}`,
      })

      if (transactionError) throw transactionError

      // Update user balance (deduct the amount immediately)
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: currentBalance - withdrawAmount })
        .eq("id", userId)

      if (balanceError) throw balanceError

      toast.success("Withdrawal request submitted successfully!")
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to submit withdrawal request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount("")
    setBankName("")
    setAccountNumber("")
    setAccountName("")
  }

  const totalDeduction = Number.parseFloat(amount || "0") + withdrawalFee
  const canWithdraw = totalDeduction <= currentBalance && Number.parseFloat(amount || "0") >= minimumWithdrawal

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Current Balance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">Available Balance:</span>
                  <span className="text-blue-800 font-bold text-lg">₦{currentBalance.toLocaleString()}</span>
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={minimumWithdrawal}
                    max={currentBalance}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₦{minimumWithdrawal.toLocaleString()} • Maximum: ₦{currentBalance.toLocaleString()}
                </p>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Bank Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="UBA">UBA</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="Union Bank">Union Bank</option>
                    <option value="Sterling Bank">Sterling Bank</option>
                    <option value="Stanbic IBTC">Stanbic IBTC</option>
                    <option value="Ecobank">Ecobank</option>
                    <option value="FCMB">FCMB</option>
                    <option value="Heritage Bank">Heritage Bank</option>
                    <option value="Keystone Bank">Keystone Bank</option>
                    <option value="Polaris Bank">Polaris Bank</option>
                    <option value="Unity Bank">Unity Bank</option>
                    <option value="Wema Bank">Wema Bank</option>
                    <option value="Kuda Bank">Kuda Bank</option>
                    <option value="Opay">Opay</option>
                    <option value="PalmPay">PalmPay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                  <input
                    type="text"
                    placeholder="Enter account holder name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Fees and Summary */}
              {amount && Number.parseFloat(amount) >= minimumWithdrawal && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Withdrawal Amount:</span>
                    <span className="text-gray-900">₦{Number.parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="text-gray-900">₦{withdrawalFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-medium">
                    <span className="text-gray-900">Total Deduction:</span>
                    <span className="text-gray-900">₦{totalDeduction.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Notice:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Withdrawals are processed within 24-48 hours</li>
                      <li>Ensure your bank details are correct to avoid delays</li>
                      <li>A processing fee of ₦{withdrawalFee} applies to all withdrawals</li>
                      <li>Minimum withdrawal amount is ₦{minimumWithdrawal.toLocaleString()}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={!canWithdraw || isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Withdraw ₦{Number.parseFloat(amount || "0").toLocaleString()}
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
