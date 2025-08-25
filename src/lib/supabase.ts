import { auth, db } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy,
  limit,
  writeBatch,
  runTransaction,
} from "firebase/firestore"
import type { User as UserType } from "./types"

// Auth functions using Firebase
export const signUpUser = async (email: string, password: string, fullName: string, referralCode?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await updateProfile(user, { displayName: fullName })

  // Find referrer user by referral code
  let referred_by = null
  if (referralCode) {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("referral_code", "==", referralCode))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      referred_by = querySnapshot.docs[0].id
    }
  }

  // Generate a unique referral code for the new user
  const newReferralCode = `${fullName.split(" ")[0].toLowerCase()}${Math.random().toString(36).substring(2, 6)}`

  // Create user profile in Firestore
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email,
    full_name: fullName,
    referral_code: newReferralCode,
    referred_by: referred_by,
    is_activated: false,
    balance: 0,
    total_earned: 0,
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // If referred, create referral record
  if (referred_by) {
    await addDoc(collection(db, "referrals"), {
      referrer_id: referred_by,
      referred_id: user.uid,
      bonus_paid: 0,
      created_at: new Date().toISOString(),
    })
  }

  await sendEmailVerification(user)

  return userCredential
}

export const signInUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const signOutUser = async () => {
  return signOut(auth)
}

export const getCurrentUser = (): Promise<UserType | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe()
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            resolve({ ...user, ...(userDoc.data() as UserType) })
          } else {
            // This case might happen if the user exists in Auth but not in Firestore.
            // You might want to create the Firestore doc here or just resolve null.
            resolve(null)
          }
        } else {
          resolve(null)
        }
      },
      reject,
    )
  })
}
