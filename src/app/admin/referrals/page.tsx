"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AdminLayout from "@/components/admin/admin-layout"
import { supabase } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Gift, DollarSign } from "lucide-react"
import toast from "react-hot-toast"

interface ReferralWithUsers {
  id: string
  referrer_id: string
  referred_id: string
  bonus_paid: number
  created_at: string
  referrer: {
    full_name: string
    email: string
    referral_code: string
  }
  referred: {
    full_name: string
    email: string
    is_activated: boolean
  }
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralWithUsers[]>([])
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activatedReferrals: 0,
    totalBonusPaid: 0,
    pendingReferrals: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    try {
      // Load referrals with user details
      const { data: referralsData, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referrer:users!referrals_referrer_id_fkey(full_name, email, referral_code),
          referred:users!referrals_referred_id_fkey(full_name, email, is_activated)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Calculate stats
      const totalReferrals = referralsData?.length || 0
      const activatedReferrals = referralsData?.filter((r) => r.referred?.is_activated).length || 0
      const totalBonusPaid = referralsData?.reduce((sum, r) => sum + r.bonus_paid, 0) || 0
      const pendingReferrals = totalReferrals - activatedReferrals

      setReferrals(referralsData || [])
      setStats({
        totalReferrals,
        activatedReferrals,
        totalBonusPaid,
        pendingReferrals,
      })
    } catch (error) {
      console.error("Error loading referral data:", error)
      toast.error("Failed to load referral data")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayBonus = async (referralId: string) => {
    try {
      const bonusAmount = 300 // ₦300 referral bonus

      // Update referral bonus
      const { error: referralError } = await supabase
        .from("referrals")
        .update({ bonus_paid: bonusAmount })
        .eq("id", referralId)

      if (referralError) throw referralError

      // Get referrer details
      const referral = referrals.find((r) => r.id === referralId)
      if (!referral) return

      // Update referrer balance
      const { data: referrer } = await supabase
        .from("users")
        .select("balance, total_earned")
        .eq("id", referral.referrer_id)
        .single()

      if (referrer) {
        await supabase
          .from("users")
          .update({
            balance: referrer.balance + bonusAmount,
            total_earned: referrer.total_earned + bonusAmount,
          })
          .eq("id", referral.referrer_id)

        // Create transaction record
        await supabase.from("transactions").insert({
          user_id: referral.referrer_id,
          type: "referral_bonus",
          amount: bonusAmount,
          status: "completed",
          reference: `REF_${Date.now()}`,
          description: `Referral bonus for ${referral.referred?.full_name}`,
        })
      }

      toast.success("Referral bonus paid successfully")
      loadReferralData()
    } catch (error) {
      console.error("Error paying bonus:", error)
      toast.error("Failed to pay referral bonus")
    }
  }

  if (isLoading) {
    return (
      <AdminLayout activeTab="referrals">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: "Total Referrals",
      value: stats.totalReferrals.toLocaleString(),
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Activated Referrals",
      value: stats.activatedReferrals.toLocaleString(),
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Bonus Paid",
      value: `₦${stats.totalBonusPaid.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Referrals",
      value: stats.pendingReferrals.toLocaleString(),
      icon: Gift,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ]

  return (
    <AdminLayout activeTab="referrals">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-600">Monitor and manage referral program</p>
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Referrals Table */}
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
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus Paid
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
                {referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{referral.referrer?.full_name}</div>
                        <div className="text-sm text-gray-500">{referral.referrer?.email}</div>
                        <div className="text-xs text-blue-600">Code: {referral.referrer?.referral_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{referral.referred?.full_name}</div>
                        <div className="text-sm text-gray-500">{referral.referred?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          referral.referred?.is_activated
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {referral.referred?.is_activated ? "Activated" : "Pending"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{referral.bonus_paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {referral.referred?.is_activated && referral.bonus_paid === 0 && (
                        <Button
                          size="sm"
                          onClick={() => handlePayBonus(referral.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Pay Bonus
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {referrals.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals found</h3>
              <p className="text-gray-600">Referral data will appear here as users join.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}
