"use client"

import { motion } from "framer-motion"
import { Wallet, TrendingUp, Users, CheckCircle } from "lucide-react"

interface StatsCardsProps {
  balance: number
  totalEarned: number
  referrals: number
  completedTasks: number
}

export default function StatsCards({ balance, totalEarned, referrals, completedTasks }: StatsCardsProps) {
  const stats = [
    {
      title: "Current Balance",
      value: `₦${balance.toLocaleString()}`,
      icon: Wallet,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Earned",
      value: `₦${totalEarned.toLocaleString()}`,
      icon: TrendingUp,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Referrals",
      value: referrals.toString(),
      icon: Users,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Tasks Completed",
      value: completedTasks.toString(),
      icon: CheckCircle,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
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
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
