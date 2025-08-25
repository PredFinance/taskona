"use client"

import { motion } from "framer-motion"
import { Clock, Zap, Star } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon?: "clock" | "zap" | "star"
  size?: "sm" | "md" | "lg"
}

export default function ComingSoon({ title, description, icon = "clock", size = "md" }: ComingSoonProps) {
  const icons = {
    clock: Clock,
    zap: Zap,
    star: Star,
  }

  const IconComponent = icons[icon]

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 ${sizeClasses[size]}`}
    >
      <div className="text-center">
        <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-4">
          <IconComponent className={`${iconSizes[size]} text-blue-600`} />
        </div>
        <h3 className={`${titleSizes[size]} font-semibold text-gray-900 mb-2`}>{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
          <Clock className="w-4 h-4 mr-1" />
          Coming Soon
        </div>
      </div>
    </motion.div>
  )
}
