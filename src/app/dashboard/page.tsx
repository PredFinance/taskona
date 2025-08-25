"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import StatsCards from "@/components/dashboard/stats-cards"
import ActivationPayment from "@/components/payment/activation-payment"
import DailyStreak from "@/components/streaks/daily-streak"
import ReferralPriority from "@/components/referrals/referral-priority"
import ComingSoon from "@/components/coming-soon"
import { getCurrentUser } from "@/lib/supabase"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import type { User, UserTask } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { Calendar } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    completedTasks: 0,
    referrals: 0,
    recentTasks: [] as UserTask[],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setIsLoading(false)
        return
      }

      setUser(currentUser as User)

      // Load completed tasks count
      const completedTasksQuery = query(
        collection(db, "user_tasks"),
        where("user_id", "==", currentUser.id),
        where("status", "==", "completed"),
      )
      const tasksSnapshot = await getDocs(completedTasksQuery)
      const tasksCount = tasksSnapshot.size

      // Load referrals count
      const referralsQuery = query(collection(db, "referrals"), where("referrer_id", "==", currentUser.id))
      const referralsSnapshot = await getDocs(referralsQuery)
      const referralsCount = referralsSnapshot.size

      // Load recent tasks
      const recentTasksQuery = query(
        collection(db, "user_tasks"),
        where("user_id", "==", currentUser.id),
        orderBy("created_at", "desc"),
        limit(5),
      )
      const recentTasksSnapshot = await getDocs(recentTasksQuery)
      const recentTasks = recentTasksSnapshot.docs.map((doc) => doc.data() as UserTask)

      setStats({
        completedTasks: tasksCount,
        referrals: referralsCount,
        recentTasks: recentTasks,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivationSuccess = () => {
    loadDashboardData()
  }

  if (isLoading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  if (!user.is_activated) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Taskona!</h1>
            <p className="text-gray-600">Activate your account to start earning money through tasks and referrals.</p>
          </div>
          <ActivationPayment userEmail={user.email} userId={user.id} onSuccess={handleActivationSuccess} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white"
        >
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
          <p className="opacity-90">Ready to earn some money today? Check out your daily streak and refer friends!</p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards
          balance={user.balance}
          totalEarned={user.total_earned}
          referrals={stats.referrals}
          completedTasks={stats.completedTasks}
        />

        {/* Priority Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Streak - Priority Feature */}
          <DailyStreak userId={user.id} />

          {/* Referral Program - Priority Feature */}
          <ReferralPriority userId={user.id} referralCode={user.referral_code} />
        </div>

        {/* Quick Actions & Coming Soon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <ComingSoon title="Browse Tasks" description="Complete tasks to earn money" icon="zap" size="sm" />
              <a
                href="/dashboard/referrals"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Calendar className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Invite Friends</p>
                  <p className="text-sm text-green-600">Earn ₦300 per referral</p>
                </div>
              </a>
              <ComingSoon title="Withdraw Funds" description="Cash out your earnings" icon="star" size="sm" />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats.recentTasks.length > 0 ? (
                stats.recentTasks.map((userTask) => (
                  <div key={userTask.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{userTask.task?.title}</p>
                      <p className="text-sm text-gray-600">{new Date(userTask.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₦{userTask.reward_paid}</p>
                      <p className="text-xs text-gray-500 capitalize">{userTask.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <ComingSoon title="No Activity Yet" description="Your task activity will appear here" size="sm" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
