"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { getCurrentUser } from "@/lib/supabase"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import type { User, Transaction, Withdrawal } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, Minus, CreditCard, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import toast from "react-hot-toast"

// Import the new enhanced components
import EnhancedTopUpModal from "@/components/wallet/enhanced-top-up-modal"
import ComprehensiveWithdrawModal from "@/components/wallet/comprehensive-withdraw-modal"

export default function WalletPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    setIsLoading(true)
    try {
      const currentUser = (await getCurrentUser()) as User | null
      if (!currentUser) {
        setIsLoading(false)
        return
      }

      setUser(currentUser)

      // Load transactions
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("user_id", "==", currentUser.id),
        orderBy("created_at", "desc"),
        limit(10),
      )
      const transactionsSnapshot = await getDocs(transactionsQuery)
      const transactionsData = transactionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[]

      // Load withdrawals
      const withdrawalsQuery = query(
        collection(db, "withdrawals"),
        where("user_id", "==", currentUser.id),
        orderBy("created_at", "desc"),
        limit(5),
      )
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
      const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Withdrawal[]

      setTransactions(transactionsData)
      setWithdrawals(withdrawalsData)
    } catch (error) {
      console.error("Error loading wallet data:", error)
      toast.error("Failed to load wallet data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopUp = () => {
    setShowTopUpModal(true)
  }

  const handleWithdraw = () => {
    if (user && user.balance < 1000) {
      toast.error("Minimum withdrawal amount is ₦1,000")
      return
    }
    setShowWithdrawModal(true)
  }

  const handleModalSuccess = () => {
    loadWalletData() // Reload data after successful transaction
  }

  if (isLoading) {
    return (
      <DashboardLayout activeTab="wallet">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user?.is_activated) {
    return (
      <DashboardLayout activeTab="wallet">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Not Activated</h2>
          <p className="text-gray-600">Please activate your account to access wallet features.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="wallet">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your earnings and withdrawals</p>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-2">Current Balance</p>
              <p className="text-4xl font-bold">₦{user?.balance.toLocaleString()}</p>
              <p className="text-green-100 mt-2">Total Earned: ₦{user?.total_earned.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <Wallet className="w-8 h-8" />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button onClick={handleTopUp} className="bg-white text-green-600 hover:bg-gray-100 flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Top Up
            </Button>
            <Button
              onClick={handleWithdraw}
              className="bg-white/20 text-white border-white hover:bg-white/30 flex-1"
              variant="outline"
            >
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <ArrowDownLeft className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦
                  {transactions
                    .filter(
                      (t) => t.type !== "withdrawal" && new Date(t.created_at).getMonth() === new Date().getMonth(),
                    )
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="bg-red-50 p-3 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦
                  {withdrawals
                    .filter((w) => w.status === "completed")
                    .reduce((sum, w) => sum + w.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦
                  {withdrawals
                    .filter((w) => w.status === "pending" || w.status === "processing")
                    .reduce((sum, w) => sum + w.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full ${transaction.type === "withdrawal" ? "bg-red-50" : "bg-green-50"}`}
                    >
                      {transaction.type === "withdrawal" ? (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900 capitalize">{transaction.type.replace("_", " ")}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"}`}
                    >
                      {transaction.type === "withdrawal" ? "-" : "+"}₦{transaction.amount.toLocaleString()}
                    </p>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Withdrawal Requests */}
        {withdrawals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawal Requests</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">₦{withdrawal.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {withdrawal.bank_name} - {withdrawal.account_number}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                  </div>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      withdrawal.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : withdrawal.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : withdrawal.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {withdrawal.status}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <EnhancedTopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={handleModalSuccess}
        userId={user?.id || ""}
      />

      <ComprehensiveWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleModalSuccess}
        userId={user?.id || ""}
        currentBalance={user?.balance || 0}
        userEmail={user?.email || ""}
      />
    </DashboardLayout>
  )
}
