import { createContext, useContext, useState, useEffect } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'

const RoomContext = createContext(null)

export function RoomProvider({ children }) {
  const { user } = useAuth()
  const [roomCode, setRoomCode] = useState(null)
  const [roomData, setRoomData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset room when user logs out
  useEffect(() => {
    if (!user) {
      setRoomCode(null)
      setRoomData(null)
    }
  }, [user])

  async function joinRoom(code) {
    setError('')
    setLoading(true)
    try {
      const roomId = code.trim().toUpperCase()
      const ref = doc(db, 'rooms', roomId)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        setError('No room found with that code.')
        return false
      }

      // Record membership so Firestore rules can verify access
      await updateDoc(ref, { members: arrayUnion(user.uid) })

      const data = snap.data()
      const members = data.members?.includes(user.uid)
        ? data.members
        : [...(data.members || []), user.uid]

      setRoomCode(snap.id)
      setRoomData({ ...data, members })
      return true
    } catch (err) {
      console.error('Join room error:', err)
      setError('Could not join room. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function createRoom({ name, code, institution }) {
    setError('')
    setLoading(true)
    try {
      const roomId = code.trim().toUpperCase()
      const ref = doc(db, 'rooms', roomId)
      const existing = await getDoc(ref)
      if (existing.exists()) {
        setError('That room code is already taken.')
        return false
      }
      const newRoom = {
        name,
        institution,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp(),
      }
      await setDoc(ref, newRoom)
      setRoomCode(roomId)
      setRoomData(newRoom)
      return true
    } catch (err) {
      console.error('Create room error:', err)
      setError('Could not create room. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function deleteRoom() {
    if (!roomCode) return
    try {
      await deleteDoc(doc(db, 'rooms', roomCode))
    } catch (err) {
      console.error('Delete room error:', err)
      setError('Could not delete room. Please try again.')
      return
    }
    setRoomCode(null)
    setRoomData(null)
  }

  function leaveRoom() {
    setRoomCode(null)
    setRoomData(null)
  }

  const value = {
    roomCode,
    roomData,
    loading,
    error,
    joinRoom,
    createRoom,
    deleteRoom,
    leaveRoom,
    isAdmin: roomData && user ? roomData.createdBy === user.uid : false,
  }

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom must be used within a RoomProvider')
  return ctx
}