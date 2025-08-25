"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Share2, TrendingUp, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface ReferralStats {
  totalReferrals: number
  activatedReferrals: number
  totalEarned: number
  pendingReferrals: number
}

export default function ReferralPriority({
  userId,
  referralCode,
}: {
  userId: string
  referralCode: string
}) {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activatedReferrals: 0,
    totalEarned: 0,
    pendingReferrals: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReferralStats()
  }, [userId])

  const loadReferralStats = async () => {
    try {
      // Load referral data
      const { data: referrals } = await supabase
        .from("referrals")
        .select(`
          *,
          referred_user:users!referrals_referred_id_fkey(is_activated)
        `)
        .eq("referrer_id", userId)

      if (referrals) {
        const totalReferrals = referrals.length
        const activatedReferrals = referrals.filter((r) => r.referred_user?.is_activated).length
        const totalEarned = referrals.reduce((sum, r) => sum + r.bonus_paid, 0)
        const pendingReferrals = totalReferrals - activatedReferrals

        setStats({
          totalReferrals,
          activatedReferrals,
          totalEarned,
          pendingReferrals,
        })
      }
    } catch (error) {
      console.error("Error loading referral stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${referralCode}`
    navigator.clipboard.writeText(referralLink)
    toast.success("Referral link copied! 🎉")
  }

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Taskona and Earn Money!",
        text: `Use my referral code ${referralCode} to join Taskona and start earning!`,
        url: `${window.location.origin}/auth/signup?ref=${referralCode}`,
      })
    } else {
      copyReferralLink()
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <Crown className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Referral Program</h3>
            <p className="text-sm text-green-600 font-medium">🔥 Priority Feature - Earn ₦300 per friend!</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalReferrals}</div>
          <div className="text-xs text-gray-500">Total Referrals</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">₦{stats.totalEarned}</div>
          <div className="text-xs text-gray-500">Total Earned</div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Your Referral Code</div>
          <div className="text-2xl font-mono font-bold text-green-600 mb-4">{referralCode}</div>
          <div className="flex gap-2">
            <Button onClick={copyReferralLink} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={shareReferralCode}
              variant="outline"
              className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-green-100 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">How it works:</h4>
        <div className="space-y-2 text-sm text-green-700">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Share your referral code with friends
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            They sign up and activate their account
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            You earn ₦300 instantly!
          </div>
        </div>
      </div>

      {/* Pending Status */}
      {stats.pendingReferrals > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center text-yellow-800">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {stats.pendingReferrals} referral{stats.pendingReferrals > 1 ? "s" : ""} pending activation
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
