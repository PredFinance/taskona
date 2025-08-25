"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, User, Users, Sparkles, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { signUpUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get referral code from URL
  const refFromUrl = searchParams.get("ref") || ""

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      referralCode: refFromUrl,
    },
  })

  // If the user lands on the page and the ref param changes, update the field
  useEffect(() => {
    if (refFromUrl) {
      setValue("referralCode", refFromUrl)
    }
  }, [refFromUrl, setValue])

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      await signUpUser(data.email, data.password, data.fullName, data.referralCode)
      toast.success("Account created! Please check your email to verify your account.")
      router.push("/auth/verify-email")
    } catch (error: any) {
      console.error("Signup error:", error)
      toast.error(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Start your earning journey today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register("fullName")}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register("email")}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register("referralCode")}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter referral code"
                autoComplete="off"
              />
            </div>
            {errors.referralCode && <p className="mt-1 text-sm text-red-600">{errors.referralCode.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                Creating Your Account...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Create Account
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/signin"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
