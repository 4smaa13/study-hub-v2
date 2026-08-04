import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)
const googleProvider = new GoogleAuthProvider()

async function syncUserProfile(firebaseUser) {
  if (!firebaseUser) return
  try {
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      {
        displayName:
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        email: firebaseUser.email,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    console.error('Profile sync error:', err)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      syncUserProfile(firebaseUser)
    })
    return unsubscribe
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signup = async (email, password, displayName) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName?.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() })
    }
    await credential.user.reload()
    setUser(auth.currentUser)
    await syncUserProfile(auth.currentUser)
    return credential
  }

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider)
    await syncUserProfile(credential.user)
    return credential
  }

  const logout = () => signOut(auth)

  const updateUsername = async (newName) => {
    if (!auth.currentUser || !newName?.trim()) return
    await updateProfile(auth.currentUser, { displayName: newName.trim() })
    await auth.currentUser.reload()
    setUser(auth.currentUser)
    await syncUserProfile(auth.currentUser)
  }

  const deleteAccount = async (password) => {
    if (!auth.currentUser) return
    const uid = auth.currentUser.uid
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
    await reauthenticateWithCredential(auth.currentUser, credential)

    // If this person created any rooms, delete those too — an admin-less
    // room with no way to manage it left behind isn't useful to anyone.
    try {
      const roomsRef = collection(db, 'rooms')
      const q = query(roomsRef, where('createdBy', '==', uid))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map((roomDoc) => deleteDoc(roomDoc.ref)))
    } catch (err) {
      console.error('Owned rooms cleanup error:', err)
      // Don't block account deletion if this step fails — the account
      // deletion itself is the priority the person asked for.
    }

    try {
      await deleteDoc(doc(db, 'users', uid))
    } catch (err) {
      console.error('Profile cleanup error:', err)
    }

    await deleteUser(auth.currentUser)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUsername,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}