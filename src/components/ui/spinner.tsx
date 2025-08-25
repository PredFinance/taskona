"use client"

import { motion } from "framer-motion"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
  )
}
