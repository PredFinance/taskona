"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { getCurrentUser } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Copy, Users, Gift, Share2, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"

interface ReferralData {
  id: string
  referrer_id: string
  referred_id: string
  bonus_paid: number
  created_at: string
  referred_user: {
    id: string
    full_name: string
    email: string
    is_activated: boolean
    created_at: string
  } | null
}

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [referrals, setReferrals] = useState<ReferralData[]>([])
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarned: 0,
    pendingReferrals: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) return

      setUser(currentUser)

      // Load referrals with user details
      const { data: referralsData, error } = await supabase
        .from("referrals")
        .select(`
          id,
          referrer_id,
          referred_id,
          bonus_paid,
          created_at,
          referred_user:users!referrals_referred_id_fkey(
            id,
            full_name,
            email,
            is_activated,
            created_at
          )
        `)
        .eq("referrer_id", currentUser.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading referrals:", error)
        // If there's an error, set empty data
        setReferrals([])
        setStats({
          totalReferrals: 0,
          totalEarned: 0,
          pendingReferrals: 0,
        })
      } else {
        // Map referred_user from array to object
        const normalizedReferrals =
          referralsData?.map((ref) => ({
            ...ref,
            referred_user: Array.isArray(ref.referred_user)
              ? ref.referred_user[0] || null
              : ref.referred_user || null,
          })) || []

        // Calculate stats
        const totalReferrals = normalizedReferrals.length
        const totalEarned = normalizedReferrals.reduce((sum, ref) => sum + ref.bonus_paid, 0)
        const pendingReferrals = normalizedReferrals.filter((ref) => !ref.referred_user?.is_activated).length

        setReferrals(normalizedReferrals)
        setStats({
          totalReferrals,
          totalEarned,
          pendingReferrals,
        })
      }
    } catch (error) {
      console.error("Error loading referral data:", error)
      setReferrals([])
      setStats({
        totalReferrals: 0,
        totalEarned: 0,
        pendingReferrals: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${user?.referral_code}`
    navigator.clipboard.writeText(referralLink)
    toast.success("Referral link copied to clipboard!")
  }

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Taskona and Earn Money!",
        text: `Use my referral code ${user?.referral_code} to join Taskona and start earning money through tasks!`,
        url: `${window.location.origin}/auth/signup?ref=${user?.referral_code}`,
      })
    } else {
      copyReferralLink()
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout activeTab="referrals">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user?.is_activated) {
    return (
      <DashboardLayout activeTab="referrals">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Not Activated</h2>
          <p className="text-gray-600">Please activate your account to access referrals.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="referrals">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-gray-600">Earn ₦300 for every friend you refer to Taskona!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalEarned.toLocaleString()}</p>
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
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReferrals}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your Referral Code</h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-3xl font-mono font-bold tracking-wider">{user?.referral_code}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={copyReferralLink} className="bg-white text-green-600 hover:bg-gray-100">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={shareReferralCode}
                className="bg-white/20 text-white border-white hover:bg-white/30"
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Code
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Referrals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Referrals</h3>
            <p className="text-gray-600">People who joined using your referral code</p>
          </div>

          <div className="divide-y divide-gray-200">
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <div key={referral.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">{referral.referred_user?.full_name || "Unknown User"}</p>
                      <p className="text-sm text-gray-600">{referral.referred_user?.email || "No email"}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        referral.referred_user?.is_activated
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {referral.referred_user?.is_activated ? "Activated" : "Pending"}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">₦{referral.bonus_paid.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
                <p className="text-gray-600">Start sharing your referral code to earn money!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
