"use client"

import { motion } from "framer-motion"
import { Clock, Star, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"

interface TaskCardProps {
  task: Task
  onStart: (task: Task) => void
  isCompleted: boolean
}

export default function TaskCard({ task, onStart, isCompleted }: TaskCardProps) {
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Clock className="w-4 h-4" />
      case "social":
        return <Users className="w-4 h-4" />
      case "survey":
        return <Star className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800"
      case "social":
        return "bg-purple-100 text-purple-800"
      case "survey":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}
        >
          {getTaskTypeIcon(task.task_type)}
          <span className="ml-1 capitalize">{task.task_type}</span>
        </div>
        {isCompleted && (
          <div className="bg-green-100 text-green-800 p-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="text-green-600 font-bold text-lg">₦{task.reward_amount.toLocaleString()}</div>
        <Button
          onClick={() => onStart(task)}
          disabled={isCompleted}
          size="sm"
          className={isCompleted ? "bg-gray-300 text-gray-500" : ""}
        >
          {isCompleted ? "Completed" : "Start Task"}
        </Button>
      </div>
    </motion.div>
  )
}
