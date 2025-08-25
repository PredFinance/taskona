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
  writeBatch,
  addDoc,
} from "firebase/firestore"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Gift, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import type { User } from "@/lib/types"

interface ReferralWithUsers {
  id: string
  referrer_id: string
  referred_id: string
  bonus_paid: number
  created_at: string
  referrer: User | null
  referred: User | null
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
    setIsLoading(true)
    try {
      const referralsQuery = query(collection(db, "referrals"), orderBy("created_at", "desc"))
      const referralsSnapshot = await getDocs(referralsQuery)

      const referralsData: ReferralWithUsers[] = await Promise.all(
        referralsSnapshot.docs.map(async (referralDoc) => {
          const data = referralDoc.data()
          const referrerDoc = await getDoc(doc(db, "users", data.referrer_id))
          const referredDoc = await getDoc(doc(db, "users", data.referred_id))

          return {
            id: referralDoc.id,
            ...data,
            referrer: referrerDoc.exists() ? (referrerDoc.data() as User) : null,
            referred: referredDoc.exists() ? (referredDoc.data() as User) : null,
          } as ReferralWithUsers
        }),
      )

      // Calculate stats
      const totalReferrals = referralsData.length
      const activatedReferrals = referralsData.filter((r) => r.referred?.is_activated).length
      const totalBonusPaid = referralsData.reduce((sum, r) => sum + r.bonus_paid, 0)
      const pendingReferrals = totalReferrals - activatedReferrals

      setReferrals(referralsData)
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
      const referral = referrals.find((r) => r.id === referralId)
      if (!referral || !referral.referrer) return

      const batch = writeBatch(db)

      // Update referral bonus
      const referralRef = doc(db, "referrals", referralId)
      batch.update(referralRef, { bonus_paid: bonusAmount })

      // Update referrer balance
      const referrerRef = doc(db, "users", referral.referrer_id)
      const newBalance = (referral.referrer.balance || 0) + bonusAmount
      const newTotalEarned = (referral.referrer.total_earned || 0) + bonusAmount
      batch.update(referrerRef, { balance: newBalance, total_earned: newTotalEarned })

      // Create transaction record
      const transactionRef = doc(collection(db, "transactions"))
      batch.set(transactionRef, {
        user_id: referral.referrer_id,
        type: "referral_bonus",
        amount: bonusAmount,
        status: "completed",
        reference: `REF_${Date.now()}`,
        description: `Referral bonus for ${referral.referred?.full_name}`,
        created_at: new Date().toISOString(),
      })

      await batch.commit()
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
