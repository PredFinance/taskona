"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AdminLayout from "@/components/admin/admin-layout"
import { supabase } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, Filter } from "lucide-react"
import type { Transaction, Withdrawal } from "@/lib/types"
import toast from "react-hot-toast"

interface TransactionWithUser extends Transaction {
  user?: {
    full_name: string
    email: string
  }
}

interface WithdrawalWithUser extends Withdrawal {
  user?: {
    full_name: string
    email: string
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">("transactions")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          *,
          user:users(full_name, email)
        `)
        .order("created_at", { ascending: false })

      if (transactionsError) throw transactionsError

      // Load withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from("withdrawals")
        .select(`
          *,
          user:users(full_name, email)
        `)
        .order("created_at", { ascending: false })

      if (withdrawalsError) throw withdrawalsError

      setTransactions(transactionsData || [])
      setWithdrawals(withdrawalsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from("withdrawals")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)

      if (error) throw error

      toast.success("Withdrawal approved successfully")
      loadData()
    } catch (error) {
      console.error("Error approving withdrawal:", error)
      toast.error("Failed to approve withdrawal")
    }
  }

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    try {
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId)
      if (!withdrawal) return

      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from("withdrawals")
        .update({ status: "failed" })
        .eq("id", withdrawalId)

      if (withdrawalError) throw withdrawalError

      // Refund the amount to user's balance
      const { data: user } = await supabase.from("users").select("balance").eq("id", withdrawal.user_id).single()

      if (user) {
        await supabase
          .from("users")
          .update({ balance: user.balance + withdrawal.amount })
          .eq("id", withdrawal.user_id)
      }

      toast.success("Withdrawal rejected and amount refunded")
      loadData()
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      toast.error("Failed to reject withdrawal")
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterStatus === "all") return true
    return transaction.status === filterStatus
  })

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (filterStatus === "all") return true
    return withdrawal.status === filterStatus
  })

  if (isLoading) {
    return (
      <AdminLayout activeTab="transactions">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="transactions">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600">Monitor and manage all transactions and withdrawals</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "transactions" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "withdrawals" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              {activeTab === "withdrawals" && <option value="processing">Processing</option>}
            </select>
          </div>
        </div>

        {/* Content */}
        {activeTab === "transactions" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.user?.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === "activation"
                              ? "bg-green-100 text-green-800"
                              : transaction.type === "withdrawal"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {transaction.type.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal.user?.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{withdrawal.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{withdrawal.bank_name}</div>
                        <div className="text-sm text-gray-500">
                          {withdrawal.account_number} - {withdrawal.account_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            withdrawal.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : withdrawal.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : withdrawal.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {withdrawal.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {withdrawal.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectWithdrawal(withdrawal.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}
