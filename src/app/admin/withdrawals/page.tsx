"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AdminLayout from "@/components/admin/admin-layout"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  where,
  addDoc,
} from "firebase/firestore"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, Filter, Settings, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { Withdrawal } from "@/lib/types"
import toast from "react-hot-toast"

interface WithdrawalWithUser extends Withdrawal {
  processing_fee: number
  user?: {
    full_name: string
    email: string
    phone?: string
  }
}

interface WithdrawalSettings {
  id: string
  minimum_amount: number
  maximum_amount: number
  processing_fee: number
  processing_time: string
  is_active: boolean
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithUser[]>([])
  const [settings, setSettings] = useState<WithdrawalSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalWithUser | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load withdrawals with user data
      const withdrawalsQuery = query(collection(db, "withdrawals"), orderBy("created_at", "desc"))
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
      const withdrawalsData = await Promise.all(
        withdrawalsSnapshot.docs.map(async (withdrawalDoc) => {
          const data = withdrawalDoc.data()
          const userDoc = data.user_id ? await getDoc(doc(db, "users", data.user_id)) : null
          return {
            id: withdrawalDoc.id,
            ...data,
            user: userDoc?.exists() ? userDoc.data() : { full_name: "Unknown User" },
          } as WithdrawalWithUser
        }),
      )
      setWithdrawals(withdrawalsData)

      // Load withdrawal settings
      const settingsQuery = query(collection(db, "withdrawal_settings"), limit(1))
      const settingsSnapshot = await getDocs(settingsQuery)
      if (!settingsSnapshot.empty) {
        const settingsDoc = settingsSnapshot.docs[0]
        setSettings({ id: settingsDoc.id, ...settingsDoc.data() } as WithdrawalSettings)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load withdrawal data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId)
      if (!withdrawal) return

      await runTransaction(db, async (transaction) => {
        const withdrawalRef = doc(db, "withdrawals", withdrawalId)
        transaction.update(withdrawalRef, {
          status: "completed",
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes || "Approved by admin",
        })

        // Update transaction status
        if (withdrawal.reference) {
          const transQuery = query(collection(db, "transactions"), where("reference", "==", withdrawal.reference))
          const transSnapshot = await getDocs(transQuery)
          if (!transSnapshot.empty) {
            const transRef = transSnapshot.docs[0].ref
            transaction.update(transRef, { status: "completed" })
          }
        }
      })

      toast.success("Withdrawal approved successfully")
      setAdminNotes("")
      setSelectedWithdrawal(null)
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

      await runTransaction(db, async (transaction) => {
        const withdrawalRef = doc(db, "withdrawals", withdrawalId)
        const userRef = doc(db, "users", withdrawal.user_id)

        // Update withdrawal status
        transaction.update(withdrawalRef, {
          status: "failed",
          admin_notes: adminNotes || "Rejected by admin",
          processed_at: new Date().toISOString(),
        })

        // Update transaction status
        if (withdrawal.reference) {
          const transQuery = query(collection(db, "transactions"), where("reference", "==", withdrawal.reference))
          const transSnapshot = await getDocs(transQuery)
          if (!transSnapshot.empty) {
            const transRef = transSnapshot.docs[0].ref
            transaction.update(transRef, { status: "failed" })
          }
        }

        // Refund the amount to user's balance
        const userDoc = await transaction.get(userRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const refundAmount = withdrawal.amount + (withdrawal.processing_fee || 0)
          transaction.update(userRef, { balance: (userData.balance || 0) + refundAmount })
        }
      })

      // Create refund transaction
      await addDoc(collection(db, "transactions"), {
        user_id: withdrawal.user_id,
        type: "refund",
        amount: withdrawal.amount + (withdrawal.processing_fee || 0),
        status: "completed",
        reference: `REF_${Date.now()}`,
        description: `Refund for rejected withdrawal - ${withdrawal.reference}`,
        created_at: new Date().toISOString(),
      })

      toast.success("Withdrawal rejected and amount refunded")
      setAdminNotes("")
      setSelectedWithdrawal(null)
      loadData()
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      toast.error("Failed to reject withdrawal")
    }
  }

  const updateSettings = async (newSettings: Partial<WithdrawalSettings>) => {
    try {
      if (!settings) return
      const settingsRef = doc(db, "withdrawal_settings", settings.id)
      await updateDoc(settingsRef, newSettings)

      setSettings({ ...settings, ...newSettings })
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Failed to update settings")
    }
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (filterStatus === "all") return true
    return withdrawal.status === filterStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "processing":
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <AdminLayout activeTab="withdrawals">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="withdrawals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
            <p className="text-gray-600">Monitor and process withdrawal requests</p>
          </div>
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && settings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount (₦)</label>
                <input
                  type="number"
                  value={settings.minimum_amount}
                  onChange={(e) => updateSettings({ minimum_amount: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Amount (₦)</label>
                <input
                  type="number"
                  value={settings.maximum_amount}
                  onChange={(e) => updateSettings({ maximum_amount: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (₦)</label>
                <input
                  type="number"
                  value={settings.processing_fee}
                  onChange={(e) => updateSettings({ processing_fee: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time</label>
                <input
                  type="text"
                  value={settings.processing_time}
                  onChange={(e) => updateSettings({ processing_time: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={settings.is_active}
                onChange={(e) => updateSettings({ is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Enable Withdrawals
              </label>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {withdrawals.filter((w) => w.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {withdrawals.filter((w) => w.status === "processing").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {withdrawals.filter((w) => w.status === "completed").length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{withdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Withdrawals Table */}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">₦{withdrawal.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Fee: ₦{(withdrawal.processing_fee || 50).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{withdrawal.bank_name}</div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.account_number} - {withdrawal.account_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}
                      >
                        {getStatusIcon(withdrawal.status)}
                        <span className="ml-1">{withdrawal.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(withdrawal.created_at).toLocaleDateString()}</div>
                      <div className="text-xs">{new Date(withdrawal.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setAdminNotes("")
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setAdminNotes("")
                              }}
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

        {/* Action Modal */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Withdrawal Request</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>User:</strong> {selectedWithdrawal.user?.full_name}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₦{selectedWithdrawal.amount.toLocaleString()}
                      </p>
                      <p>
                        <strong>Bank:</strong> {selectedWithdrawal.bank_name}
                      </p>
                      <p>
                        <strong>Account:</strong> {selectedWithdrawal.account_number} -{" "}
                        {selectedWithdrawal.account_name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this withdrawal..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 mt-6">
                  <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRejectWithdrawal(selectedWithdrawal.id)}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveWithdrawal(selectedWithdrawal.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
