interface SignUpData {
  email: string
  password: string
  fullName: string
  referralCode?: string
}

interface SignInData {
  email: string
  password: string
}

export const signUpWithAPI = async (data: SignUpData) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to create account")
  }

  return result
}

export const signInWithAPI = async (data: SignInData) => {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to sign in")
  }

  return result
}
