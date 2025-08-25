"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, AlertCircle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { collection, addDoc, doc, runTransaction } from "firebase/firestore"
import toast from "react-hot-toast"

interface ComprehensiveWithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  currentBalance: number
  userEmail: string
}

export default function ComprehensiveWithdrawModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  currentBalance,
  userEmail,
}: ComprehensiveWithdrawModalProps) {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Withdrawal criteria - can be configured by admin
  const minimumWithdrawal = 10000 // Changed from 1000 to 10000
  const maximumWithdrawal = 100000 // ₦100,000 per request
  const withdrawalFee = 50
  const processingTime = "24-48 hours"

  const handleWithdraw = async () => {
    const withdrawAmount = Number.parseFloat(amount)

    // Validation
    if (!amount || withdrawAmount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₦${minimumWithdrawal.toLocaleString()}`)
      return
    }

    if (withdrawAmount > maximumWithdrawal) {
      toast.error(`Maximum withdrawal amount is ₦${maximumWithdrawal.toLocaleString()}`)
      return
    }

    if (withdrawAmount + withdrawalFee > currentBalance) {
      toast.error("Insufficient balance (including processing fee)")
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all bank details")
      return
    }

    if (accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit account number")
      return
    }

    setIsSubmitting(true)
    try {
      const withdrawalRef = doc(collection(db, "withdrawals"))
      const transactionRef = doc(collection(db, "transactions"))
      const userRef = doc(db, "users", userId)
      const withdrawalReference = `WTH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef)
        if (!userDoc.exists()) {
          throw new Error("User does not exist.")
        }
        const currentBalance = userDoc.data().balance || 0
        const totalDeduction = withdrawAmount + withdrawalFee

        if (totalDeduction > currentBalance) {
          throw new Error("Insufficient balance.")
        }

        // 1. Create withdrawal request
        transaction.set(withdrawalRef, {
          user_id: userId,
          amount: withdrawAmount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          status: "pending",
          reference: withdrawalReference,
          processing_fee: withdrawalFee,
          user_email: userEmail,
          created_at: new Date().toISOString(),
        })

        // 2. Create transaction record
        transaction.set(transactionRef, {
          user_id: userId,
          type: "withdrawal_request",
          amount: withdrawAmount,
          status: "pending",
          reference: withdrawalReference,
          description: `Withdrawal request to ${bankName} - ${accountNumber}`,
          created_at: new Date().toISOString(),
        })

        // 3. Deduct amount from balance immediately
        transaction.update(userRef, { balance: currentBalance - totalDeduction })
      })

      toast.success("Withdrawal request submitted successfully!")
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error("Withdrawal error:", error)
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

  const nigerianBanks = [
    "Access Bank",
    "Zenith Bank",
    "GTBank",
    "First Bank",
    "UBA",
    "Fidelity Bank",
    "Union Bank",
    "Sterling Bank",
    "Stanbic IBTC",
    "Ecobank",
    "FCMB",
    "Heritage Bank",
    "Keystone Bank",
    "Polaris Bank",
    "Unity Bank",
    "Wema Bank",
    "Kuda Bank",
    "Opay",
    "PalmPay",
    "Moniepoint",
    "VFD Microfinance Bank",
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
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

              {/* Withdrawal Limits Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Withdrawal Limits:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Min: ₦{minimumWithdrawal.toLocaleString()}</li>
                      <li>• Max: ₦{maximumWithdrawal.toLocaleString()} per request</li>
                      <li>• Processing fee: ₦{withdrawalFee}</li>
                      <li>• Processing time: {processingTime}</li>
                    </ul>
                  </div>
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
                    max={Math.min(maximumWithdrawal, currentBalance - withdrawalFee)}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min: ₦{minimumWithdrawal.toLocaleString()}</span>
                  <span>Max: ₦{Math.min(maximumWithdrawal, currentBalance - withdrawalFee).toLocaleString()}</span>
                </div>
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
                    {nigerianBanks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">You will receive:</span>
                    <span className="text-green-600 font-medium">₦{Number.parseFloat(amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Success Criteria */}
              {canWithdraw && amount && bankName && accountNumber && accountName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium">Ready to submit!</p>
                    <p className="text-xs mt-1">Your withdrawal request will be processed within {processingTime}</p>
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
                      <li>Ensure your bank details are correct to avoid delays</li>
                      <li>Funds will be deducted immediately upon request</li>
                      <li>Processing fee is non-refundable</li>
                      <li>Contact support if payment is delayed beyond {processingTime}</li>
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
                    Submit Request
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
