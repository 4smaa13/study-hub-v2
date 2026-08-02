import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This listener fires whenever auth state changes (login, logout, page refresh)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  const value = { user, loading, login, signup, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook so components just call useAuth() instead of useContext(AuthContext)
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
