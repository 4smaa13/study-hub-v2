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
  sendPasswordResetEmail,
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
  writeBatch,
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

// Helper to clean up all subcollections inside a room document before deleting the room
async function deleteRoomWithSubcollections(roomId) {
  const roomRef = doc(db, 'rooms', roomId)
  const subcollections = ['tasks', 'links', 'messages', 'members', 'meta']

  for (const sub of subcollections) {
    const subRef = collection(db, 'rooms', roomId, sub)
    const snap = await getDocs(subRef)
    if (!snap.empty) {
      const batch = writeBatch(db)
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
  }

  await deleteDoc(roomRef)
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

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email)
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

    // Re-authenticate if user logged in via password
    if (password) {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
      await reauthenticateWithCredential(auth.currentUser, credential)
    }

    // Deep-delete rooms created by this user along with their subcollections
    try {
      const roomsRef = collection(db, 'rooms')
      const q = query(roomsRef, where('createdBy', '==', uid))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map((roomDoc) => deleteRoomWithSubcollections(roomDoc.id)))
    } catch (err) {
      console.error('Owned rooms cleanup error:', err)
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
    resetPassword,
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