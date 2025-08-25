import { Suspense } from "react"
import SignInForm from "@/components/auth/signin-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
