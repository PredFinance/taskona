"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore"
import toast from "react-hot-toast"

interface StreakReward {
  id: string
  day: number
  base_amount: number
  bonus_amount: number
  is_special: boolean
  description: string
}

export default function StreakManagement() {
  const [rewards, setRewards] = useState<StreakReward[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    setIsLoading(true)
    try {
      const rewardsQuery = query(collection(db, "streak_rewards"), orderBy("day", "asc"))
      const rewardsSnapshot = await getDocs(rewardsQuery)
      const rewardsData = rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StreakReward[]
      setRewards(rewardsData)
    } catch (error) {
      console.error("Error loading rewards:", error)
      toast.error("Failed to load streak rewards")
    } finally {
      setIsLoading(false)
    }
  }

  const updateReward = async (id: string, updates: Partial<StreakReward>) => {
    try {
      const rewardRef = doc(db, "streak_rewards", id)
      await updateDoc(rewardRef, updates)

      setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
      setEditingId(null)
      toast.success("Reward updated successfully")
    } catch (error) {
      console.error("Error updating reward:", error)
      toast.error("Failed to update reward")
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Flame className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Streak Rewards Management</h3>
        </div>
        <p className="text-gray-600 mt-1">Configure daily streak rewards and bonuses</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {rewards.map((reward) => (
            <RewardRow
              key={reward.id}
              reward={reward}
              isEditing={editingId === reward.id}
              onEdit={() => setEditingId(reward.id)}
              onCancel={() => setEditingId(null)}
              onSave={(updates) => updateReward(reward.id, updates)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function RewardRow({
  reward,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: {
  reward: StreakReward
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (updates: Partial<StreakReward>) => void
}) {
  const [formData, setFormData] = useState({
    base_amount: reward.base_amount,
    bonus_amount: reward.bonus_amount,
    is_special: reward.is_special,
    description: reward.description,
  })

  const handleSave = () => {
    onSave(formData)
  }

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <div className="text-lg font-bold text-blue-600">{reward.day}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Amount</label>
            <input
              type="number"
              value={formData.base_amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, base_amount: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Amount</label>
            <input
              type="number"
              value={formData.bonus_amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, bonus_amount: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special</label>
            <input
              type="checkbox"
              checked={formData.is_special}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_special: e.target.checked }))}
              className="mt-2"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border rounded-lg p-4 ${reward.is_special ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}
    >
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div>
            <div className="text-sm text-gray-600">Day</div>
            <div className="text-lg font-bold text-gray-900">{reward.day}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Base Amount</div>
            <div className="text-lg font-semibold text-green-600">₦{reward.base_amount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Bonus</div>
            <div className="text-lg font-semibold text-orange-600">
              {reward.bonus_amount > 0 ? `₦${reward.bonus_amount}` : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-lg font-bold text-gray-900">₦{reward.base_amount + reward.bonus_amount}</div>
          </div>
        </div>
        <Button onClick={onEdit} size="sm" variant="outline">
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-2 text-sm text-gray-600">{reward.description}</div>
    </div>
  )
}
