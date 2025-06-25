import { Suspense } from "react"
import SignUpForm from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
