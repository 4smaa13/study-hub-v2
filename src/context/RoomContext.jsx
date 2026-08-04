import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'

const RoomContext = createContext(null)
const STORAGE_PREFIX = 'studyhub_last_room_'

function storageKeyFor(uid) {
  return `${STORAGE_PREFIX}${uid}`
}

export function RoomProvider({ children }) {
  const { user } = useAuth()
  const [roomCode, setRoomCode] = useState(null)
  const [roomData, setRoomData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const attemptedAutoRejoin = useRef(false)
  const autoRejoinForUid = useRef(null)

  useEffect(() => {
    if (!user) {
      setRoomCode(null)
      setRoomData(null)
      attemptedAutoRejoin.current = false
      autoRejoinForUid.current = null
    }
  }, [user])

  useEffect(() => {
    if (!user || roomCode) return
    // Only attempt auto-rejoin once per signed-in user, not once globally —
    // otherwise switching accounts in the same browser can silently pull in
    // a room saved by whichever account used this browser last.
    if (attemptedAutoRejoin.current && autoRejoinForUid.current === user.uid) return

    attemptedAutoRejoin.current = true
    autoRejoinForUid.current = user.uid

    const savedCode = localStorage.getItem(storageKeyFor(user.uid))
    if (savedCode) {
      joinRoom(savedCode, { silent: true })
    }
  }, [user, roomCode])

  async function joinRoom(code, options = {}) {
    setError('')
    setLoading(true)
    try {
      const roomId = code.trim().toUpperCase()
      const ref = doc(db, 'rooms', roomId)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        if (options.silent) {
          localStorage.removeItem(storageKeyFor(user.uid))
        } else {
          setError('No room found with that code.')
        }
        return false
      }

      await updateDoc(ref, { members: arrayUnion(user.uid) })

      const data = snap.data()
      const members = data.members?.includes(user.uid)
        ? data.members
        : [...(data.members || []), user.uid]

      setRoomCode(snap.id)
      setRoomData({ ...data, members })
      localStorage.setItem(storageKeyFor(user.uid), snap.id)
      return true
    } catch (err) {
      console.error('Join room error:', err)
      if (!options.silent) {
        setError('Could not join room. Please try again.')
      }
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
      localStorage.setItem(storageKeyFor(user.uid), roomId)
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
    localStorage.removeItem(storageKeyFor(user.uid))
    setRoomCode(null)
    setRoomData(null)
  }

  async function leaveRoom() {
    if (roomCode && user) {
      try {
        await updateDoc(doc(db, 'rooms', roomCode), {
          members: arrayRemove(user.uid),
        })
      } catch (err) {
        console.error('Leave room error:', err)
      }
    }
    if (user) localStorage.removeItem(storageKeyFor(user.uid))
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