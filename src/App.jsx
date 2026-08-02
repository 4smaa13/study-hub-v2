import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { RoomProvider, useRoom } from './context/RoomContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import RoomJoin from './components/Room/RoomJoin'
import RoomCreate from './components/Room/RoomCreate'
import RoomHeader from './components/Room/RoomHeader'
import TaskBoard from './components/Tasks/TaskBoard'
import PomodoroTimer from './components/Timer/PomodoroTimer'
import LinkList from './components/Links/LinkList'
import Schedule from './components/Schedule/Schedule'
import Chat from './components/Chats/Chat'
import VideoCall from './components/Video/VideoCall'

function AppShell() {
  const { user, loading: authLoading, logout } = useAuth()
  const { roomCode } = useRoom()
  const { t, language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [authView, setAuthView] = useState('login')
  const [roomView, setRoomView] = useState('join')

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">📚 {t('appName')}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="text-sm border border-border rounded-lg px-3 py-1 hover:bg-page transition"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={toggleLanguage}
              className="text-sm border border-border rounded-lg px-3 py-1 hover:bg-page transition"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
            {user && (
              <button
                onClick={logout}
                className="text-sm text-ink-soft hover:text-ink transition"
              >
                {t('logOut')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {!user ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              {t('welcome')}
            </h2>
            {authView === 'login' ? (
              <Login onSwitchToSignup={() => setAuthView('signup')} />
            ) : (
              <Signup onSwitchToLogin={() => setAuthView('login')} />
            )}
          </>
        ) : !roomCode ? (
          roomView === 'join' ? (
            <RoomJoin onShowCreate={() => setRoomView('create')} />
          ) : (
            <RoomCreate onBack={() => setRoomView('join')} />
          )
        ) : (
          <>
            <RoomHeader />
            <div className="grid md:grid-cols-2 gap-6">
              <TaskBoard />
              <PomodoroTimer />
              <Schedule />
              <LinkList />
              <Chat />
              <VideoCall />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RoomProvider>
            <AppShell />
          </RoomProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}