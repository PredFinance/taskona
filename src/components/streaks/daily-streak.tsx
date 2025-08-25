"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame, Gift, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  runTransaction,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore"
import toast from "react-hot-toast"

interface StreakData {
  current_streak: number
  longest_streak: number
  last_claim_date: string | null
  total_claimed: number
  can_claim: boolean
  next_claim: string | null
}

interface StreakReward {
  id: string
  day: number
  base_amount: number
  bonus_amount: number
  is_special: boolean
  description: string
}

export default function DailyStreak({ userId }: { userId: string }) {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [rewards, setRewards] = useState<StreakReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
    loadStreakData()
    loadRewards()
  }, [userId])

  const loadStreakData = async () => {
    setIsLoading(true)
    try {
      const streakRef = doc(db, "streaks", userId)
      const streakSnap = await getDoc(streakRef)

      if (streakSnap.exists()) {
        const streak = streakSnap.data()
        const today = new Date().toISOString().split("T")[0]
        const lastClaim = streak.last_claim_date
        const canClaim = !lastClaim || lastClaim < today

        setStreakData({
          current_streak: streak.current_streak,
          longest_streak: streak.longest_streak,
          last_claim_date: streak.last_claim_date,
          total_claimed: streak.total_claimed,
          can_claim: canClaim,
          next_claim: canClaim ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
      } else {
        // No streak record yet, create one
        const initialStreakData = {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_claim_date: null,
          total_claimed: 0,
        }
        await setDoc(streakRef, initialStreakData)
        setStreakData({ ...initialStreakData, can_claim: true, next_claim: null })
      }
    } catch (error) {
      console.error("Error loading streak data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRewards = async () => {
    try {
      const rewardsQuery = query(collection(db, "streak_rewards"), orderBy("day", "asc"))
      const rewardsSnapshot = await getDocs(rewardsQuery)
      const rewardsData = rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StreakReward[]
      setRewards(rewardsData)
    } catch (error) {
      console.error("Error loading rewards:", error)
    }
  }

  const claimStreak = async () => {
    if (!streakData?.can_claim) {
      toast.error("You have already claimed your reward for today.")
      return
    }
    setIsClaiming(true)
    try {
      const nextDay = (streakData?.current_streak || 0) + 1
      const reward = rewards.find((r) => r.day === (nextDay > 15 ? 1 : nextDay)) // Loop after day 15
      if (!reward) {
        toast.error("Could not find a reward for today. Please try again later.")
        return
      }
      const claimAmount = reward.base_amount + reward.bonus_amount

      await runTransaction(db, async (transaction) => {
        const streakRef = doc(db, "streaks", userId)
        const userRef = doc(db, "users", userId)

        const streakSnap = await transaction.get(streakRef)
        const userSnap = await transaction.get(userRef)

        if (!streakSnap.exists() || !userSnap.exists()) {
          throw new Error("User or streak data not found.")
        }
        const currentStreakData = streakSnap.data()
        const currentUserData = userSnap.data()

        const newStreak = currentStreakData.current_streak + 1
        transaction.update(streakRef, {
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentStreakData.longest_streak),
          last_claim_date: new Date().toISOString().split("T")[0],
          total_claimed: increment(claimAmount),
        })

        transaction.update(userRef, {
          balance: increment(claimAmount),
          total_earned: increment(claimAmount),
        })
      })

      toast.success(`🎉 Day ${nextDay} claimed! +₦${claimAmount}`)
      loadStreakData() // Reload streak data
    } catch (error: any) {
      toast.error(error.message || "Failed to claim streak")
    } finally {
      setIsClaiming(false)
    }
  }

  const getNextReward = () => {
    if (!streakData) return null
    const nextDay = streakData.current_streak + 1
    return rewards.find((r) => r.day === (nextDay > 15 ? 1 : nextDay))
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

  const nextReward = getNextReward()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg mr-4">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Streak</h3>
            <p className="text-sm text-gray-600">Claim ₦50 daily + special bonuses!</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{streakData?.current_streak || 0}</div>
          <div className="text-xs text-gray-500">Current Streak</div>
        </div>
      </div>

      {/* Streak Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress to Day 15</span>
          <span className="text-sm text-gray-500">{streakData?.current_streak || 0}/15</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((streakData?.current_streak || 0) / 15) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Claim Section */}
      <div className="bg-white rounded-lg p-4 mb-4">
        {streakData?.can_claim ? (
          <div className="text-center">
            <div className="mb-3">
              <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">Ready to Claim!</div>
              {nextReward && (
                <div className="text-sm text-gray-600">
                  Day {nextReward.day}: ₦{nextReward.base_amount}
                  {nextReward.bonus_amount > 0 && (
                    <span className="text-orange-600 font-medium"> + ₦{nextReward.bonus_amount} bonus!</span>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={claimStreak}
              disabled={isClaiming}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isClaiming ? "Claiming..." : "Claim Today's Reward"}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-lg font-semibold text-gray-600">Already Claimed Today</div>
            <div className="text-sm text-gray-500">Come back tomorrow for your next reward!</div>
          </div>
        )}
      </div>

      {/* Reward Calendar */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {rewards.slice(0, 15).map((reward) => {
          const isCompleted = (streakData?.current_streak || 0) >= reward.day
          const isCurrent = (streakData?.current_streak || 0) + 1 === reward.day
          const isSpecial = reward.is_special

          return (
            <div
              key={reward.id}
              className={`
                relative p-2 rounded-lg text-center text-xs transition-all
                ${
                  isCompleted
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : isCurrent
                      ? "bg-orange-100 text-orange-800 border border-orange-300 ring-2 ring-orange-400"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                }
              `}
            >
              {isSpecial && <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />}
              <div className="font-medium">Day {reward.day}</div>
              <div className="text-xs">₦{reward.base_amount + reward.bonus_amount}</div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white rounded-lg p-3">
          <div className="text-lg font-bold text-gray-900">₦{streakData?.total_claimed || 0}</div>
          <div className="text-xs text-gray-500">Total Earned</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-lg font-bold text-gray-900">{streakData?.longest_streak || 0}</div>
          <div className="text-xs text-gray-500">Best Streak</div>
        </div>
      </div>
    </motion.div>
  )
}
