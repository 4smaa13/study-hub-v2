import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'

export default function TaskBoard() {
  const { roomCode } = useRoom()
  const { t } = useLanguage()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    if (!roomCode) return
    const tasksRef = collection(db, 'rooms', roomCode, 'tasks')
    const q = query(tasksRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setTasks(items)
    })

    return unsubscribe
  }, [roomCode])

  async function handleAddTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    const tasksRef = collection(db, 'rooms', roomCode, 'tasks')
    await addDoc(tasksRef, {
      text: newTask.trim(),
      done: false,
      createdAt: serverTimestamp(),
    })
    setNewTask('')
  }

  async function toggleTask(task) {
    const taskRef = doc(db, 'rooms', roomCode, 'tasks', task.id)
    await updateDoc(taskRef, { done: !task.done })
  }

  async function deleteTask(taskId) {
    const taskRef = doc(db, 'rooms', roomCode, 'tasks', taskId)
    await deleteDoc(taskRef)
  }

  return (
    <div className="bg-card rounded-3xl shadow-card border border-border p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="var(--color-accent-ink)" strokeWidth="1.8"/>
            <path d="M8.5 12.5L11 15L16 9.5" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="font-serif font-medium text-xl text-ink">{t('taskBoardTitle')}</h2>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={t('addTaskPlaceholder')}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 border-[1.5px] border-almond bg-card rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition"
        />
        <button
          type="submit"
          className="bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-2xl px-5 py-2.5 transition"
        >
          {t('addTask')}
        </button>
      </form>

      {tasks.length === 0 && (
        <p className="text-ink-soft text-sm text-center py-6">
          {t('noTasks')}
        </p>
      )}

      {tasks.length > 0 && (
        <ul className="space-y-2">
          {tasks.map(function (task) {
            return (
              <li
                key={task.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${
                  task.done ? 'bg-sage-soft' : 'bg-almond'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task)}
                    className="w-4 h-4 accent-sage rounded"
                  />
                  <span
                    className={
                      task.done ? 'line-through text-ink-soft' : 'text-ink'
                    }
                  >
                    {task.text}
                  </span>
                </label>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-ink-soft hover:text-red-500 transition px-2"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}