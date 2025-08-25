import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Auth functions using Firebase
export const signUpUser = async (email: string, password: string, fullName: string, referralCode?: string) => {
  console.log("Signing up user:", { email, fullName, referralCode });

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      email: user.email,
      full_name: fullName,
      referral_code: referralCode || null,
      is_activated: false,
      balance: 0,
      total_earned: 0,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await sendEmailVerification(user);

    return userCredential;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const signInUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  return signOut(auth);
};

export const getCurrentUser = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            resolve({ ...user, ...userDoc.data() });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
};
