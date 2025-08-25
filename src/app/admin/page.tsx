"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AdminLayout from "@/components/admin/admin-layout"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, limit, orderBy, getDoc } from "firebase/firestore"
import { Spinner } from "@/components/ui/spinner"
import { Users, ClipboardList, CreditCard, AlertTriangle, DollarSign, Activity, Flame } from "lucide-react"
import StreakManagement from "@/components/admin/streak-management"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  activeTasks: number
  totalTransactions: number
  totalRevenue: number
  pendingWithdrawals: number
  totalReferrals: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    activeTasks: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    totalReferrals: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Load user stats
      const usersSnapshot = await getDocs(collection(db, "users"))
      const totalUsers = usersSnapshot.size
      const activeUsers = usersSnapshot.docs.filter((doc) => doc.data().is_activated).length

      // Load task stats
      const tasksSnapshot = await getDocs(collection(db, "tasks"))
      const totalTasks = tasksSnapshot.size
      const activeTasks = tasksSnapshot.docs.filter((doc) => doc.data().is_active).length

      // Load transaction stats
      const transactionsSnapshot = await getDocs(collection(db, "transactions"))
      const totalTransactions = transactionsSnapshot.size

      const revenueQuery = query(
        collection(db, "transactions"),
        where("type", "==", "activation"),
        where("status", "==", "completed"),
      )
      const revenueSnapshot = await getDocs(revenueQuery)
      const totalRevenue = revenueSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)

      // Load withdrawal stats
      const pendingWithdrawalsQuery = query(collection(db, "withdrawals"), where("status", "==", "pending"))
      const pendingWithdrawalsSnapshot = await getDocs(pendingWithdrawalsQuery)
      const pendingWithdrawals = pendingWithdrawalsSnapshot.size

      // Load referral stats
      const referralsSnapshot = await getDocs(collection(db, "referrals"))
      const totalReferrals = referralsSnapshot.size

      // Load recent activity
      const recentTransactionsQuery = query(collection(db, "transactions"), orderBy("created_at", "desc"), limit(5))
      const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery)
      const recentTransactions = await Promise.all(
        recentTransactionsSnapshot.docs.map(async (doc) => {
          const transaction = doc.data()
          const userDoc = await getDoc(transaction.user_id)
          return {
            id: doc.id,
            ...transaction,
            user: userDoc.exists() ? userDoc.data() : { full_name: "Unknown User" },
          }
        }),
      )

      setStats({
        totalUsers,
        activeUsers,
        totalTasks,
        activeTasks,
        totalTransactions,
        totalRevenue,
        pendingWithdrawals,
        totalReferrals,
      })

      setRecentActivity(recentTransactions)
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout activeTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      subtitle: `${stats.activeUsers} activated`,
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks.toLocaleString(),
      icon: ClipboardList,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      subtitle: `${stats.activeTasks} active`,
    },
    {
      title: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      subtitle: "From activations",
    },
    {
      title: "Pending Withdrawals",
      value: stats.pendingWithdrawals.toLocaleString(),
      icon: AlertTriangle,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      subtitle: "Requires attention",
    },
  ]

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your Taskona platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/users"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Manage Users</p>
                  <p className="text-sm text-blue-600">View and manage user accounts</p>
                </div>
              </a>
              <a
                href="/admin/tasks"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ClipboardList className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Create Tasks</p>
                  <p className="text-sm text-green-600">Add new tasks for users</p>
                </div>
              </a>
              <a
                href="/admin/transactions"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-900">Review Withdrawals</p>
                  <p className="text-sm text-purple-600">Process pending withdrawals</p>
                </div>
              </a>
              <a
                href="#streaks"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Flame className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-orange-900">Manage Streaks</p>
                  <p className="text-sm text-orange-600">Configure daily rewards</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "activation"
                            ? "bg-green-50"
                            : activity.type === "withdrawal"
                              ? "bg-red-50"
                              : "bg-blue-50"
                        }`}
                      >
                        <Activity
                          className={`w-4 h-4 ${
                            activity.type === "activation"
                              ? "text-green-600"
                              : activity.type === "withdrawal"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 text-sm">
                          {activity.user?.full_name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {activity.type.replace("_", " ")} - ₦{activity.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : activity.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {activity.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </motion.div>
        </div>
        <div className="mt-8">
          <StreakManagement />
        </div>
      </div>
    </AdminLayout>
  )
}
