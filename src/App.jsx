import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { RoomProvider, useRoom } from './context/RoomContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import RoomJoin from './components/Room/RoomJoin'
import RoomCreate from './components/Room/RoomCreate'
import TaskBoard from './components/Tasks/TaskBoard'
import PomodoroTimer from './components/Timer/PomodoroTimer'
import LinkList from './components/Links/LinkList'
import Schedule from './components/Schedule/Schedule'
import Chat from './components/Chats/Chat'
import VideoCall from './components/Video/VideoCall'
import MembersList from './components/Members/MembersList'
import Whiteboard from './components/Whiteboard/Whiteboard'
import AISummarizer from './components/Ai/AiSummarizer'
import StudyAnalytics from './components/Analytics/StudyAnalytics'
import SpotifyPlayer from './components/Audio/SpotifyPlayer'

// Crisp SVG Vector Icons
const Icons = {
  Back: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Camera: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  LogOut: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  CheckList: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Link: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636"/>
    </svg>
  ),
  Chart: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  ChevronUp: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-4 relative animate-in fade-in zoom-in-95 duration-150 text-ink">
        <div className="flex justify-between items-center mb-2.5 border-b border-border pb-2">
          <h3 className="text-sm font-bold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-ink-soft hover:text-ink p-1 rounded-md hover:bg-page transition"
          >
            <Icons.Close />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AppShell() {
  const { user, loading: authLoading, logout, updateUsername, deleteAccount } = useAuth()
  const roomContext = useRoom() || {}
  
  // Safely extract properties with standard defaults
  const roomCode = roomContext.roomCode
  const leaveRoom = roomContext.leaveRoom
  const deleteRoom = roomContext.deleteRoom
  const isHost = roomContext.isAdmin ?? false

  const { t, language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const [authView, setAuthView] = useState('login')
  const [roomView, setRoomView] = useState('join')

  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isDeleteRoomModalOpen, setIsDeleteRoomModalOpen] = useState(false)

  const [isTasksDropdownOpen, setIsTasksDropdownOpen] = useState(false)
  const [isLinksDropdownOpen, setIsLinksDropdownOpen] = useState(false)
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false)
  const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newUsernameInput, setNewUsernameInput] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletePasswordInput, setDeletePasswordInput] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openEditModal() {
    setIsProfileMenuOpen(false)
    setNewUsernameInput(user?.displayName || '')
    setIsEditModalOpen(true)
  }

  async function handleSaveUsername(e) {
    e.preventDefault()
    if (newUsernameInput.trim()) {
      await updateUsername(newUsernameInput)
    }
    setIsEditModalOpen(false)
  }

  function openDeleteModal() {
    setIsProfileMenuOpen(false)
    setDeletePasswordInput('')
    setDeleteError('')
    setIsDeleteModalOpen(true)
  }

  async function handleConfirmDeleteAccount(e) {
    e.preventDefault()
    if (!deletePasswordInput) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount(deletePasswordInput)
      setIsDeleteModalOpen(false)
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteError(t('incorrectPasswordAccountNotDeleted'))
      } else {
        setDeleteError(t('somethingWentWrongTryAgain'))
      }
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConfirmDeleteRoom() {
    try {
      if (isHost && deleteRoom) {
        await deleteRoom()
      } else if (leaveRoom) {
        await leaveRoom()
      }
      setIsDeleteRoomModalOpen(false)
      setIsRoomInfoOpen(false)
    } catch (err) {
      console.error('Failed to delete room:', err)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft text-xs">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen text-ink bg-page text-xs">
      {/* Top Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          
          <h1 className="font-bold text-base tracking-tight">{t('appName')}</h1>

          <div className="flex items-center gap-2">

            {user && roomCode && (
              <>
                <button
                  onClick={leaveRoom}
                  className="p-1.5 border border-border rounded-lg hover:bg-page transition text-ink-soft hover:text-ink"
                  title={language === 'ar' ? 'مغادرة الغرفة' : 'Leave Room'}
                >
                  <Icons.Back />
                </button>

                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="p-1.5 border border-border rounded-lg hover:bg-page transition text-ink-soft hover:text-ink"
                  title={language === 'ar' ? 'مكالمة فيديو' : 'Video Call'}
                >
                  <Icons.Camera />
                </button>

                <button
                  onClick={() => setIsRoomInfoOpen(true)}
                  className="p-1.5 border border-border rounded-lg hover:bg-page transition text-ink-soft hover:text-ink"
                  title={language === 'ar' ? 'معلومات الغرفة' : 'Room Info'}
                >
                  <Icons.Info />
                </button>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="p-1.5 border border-border rounded-lg hover:bg-page transition text-ink-soft hover:text-ink"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>

            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 border border-border rounded-lg hover:bg-page transition text-[11px] font-medium"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>

            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-1.5 border border-border rounded-lg hover:bg-page transition text-ink-soft hover:text-ink"
                  title="Profile"
                >
                  <Icons.User />
                </button>

                {isProfileMenuOpen && (
                  <div className={`absolute top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-xl py-1 z-50 ${language === 'ar' ? 'left-0' : 'right-0'}`}>
                    <div className="px-3 py-1 border-b border-border">
                      <p className="text-[10px] text-ink-soft">{language === 'ar' ? 'المستخدم' : 'Signed in as'}</p>
                      <p className="text-xs font-bold truncate">{user.displayName || user.email?.split('@')[0]}</p>
                    </div>

                    <button
                      onClick={openEditModal}
                      className="w-full text-start px-3 py-1.5 text-xs hover:bg-page transition flex items-center gap-2"
                    >
                      <Icons.Edit /> {t('editUsername')}
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-start px-3 py-1.5 text-xs hover:bg-page transition flex items-center gap-2"
                    >
                      <Icons.LogOut /> {t('logOut')}
                    </button>

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={openDeleteModal}
                        className="w-full text-start px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition flex items-center gap-2"
                      >
                        <Icons.Trash /> {t('deleteAccount')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {!user ? (
          <div className="max-w-md mx-auto py-8">
            <h2 className="text-lg font-bold text-center mb-5">
              {t('welcome')}
            </h2>
            {authView === 'login' ? (
              <Login onSwitchToSignup={() => setAuthView('signup')} />
            ) : (
              <Signup onSwitchToLogin={() => setAuthView('login')} />
            )}
          </div>
        ) : !roomCode ? (
          <div className="max-w-md mx-auto py-8">
            {roomView === 'join' ? (
              <RoomJoin onShowCreate={() => setRoomView('create')} />
            ) : (
              <RoomCreate onBack={() => setRoomView('join')} />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

            {/* Column 1: Pomodoro, Schedule & Spotify Sidebar (3 Cols) */}
            <div className="lg:col-span-3 space-y-3 flex flex-col items-start w-full">
              <div className="w-56 h-56 bg-card border border-border rounded-2xl p-3 shadow-xs flex flex-col items-center justify-center text-center overflow-hidden mx-auto lg:mx-0 [&_*]:text-xs [&_h2]:text-xs [&_h3]:text-xs [&_.text-4xl]:text-2xl [&_.text-5xl]:text-2xl [&_.text-6xl]:text-2xl [&_button]:py-1 [&_button]:px-2 [&_button]:text-[11px]">
                <PomodoroTimer />
              </div>
              
              <div className="w-full space-y-3">
                <Schedule />
                <SpotifyPlayer />
              </div>
            </div>

            {/* Column 2: Compact Dropdowns & Chat Workspace (4 Cols) */}
            <div className="lg:col-span-4 space-y-2.5 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsTasksDropdownOpen(!isTasksDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg border border-border text-xs font-medium transition flex items-center gap-2 ${
                    isTasksDropdownOpen ? 'bg-primary text-white border-primary' : 'bg-card hover:bg-page text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icons.CheckList />
                  <span>{language === 'ar' ? 'المهام' : 'Tasks'}</span>
                  {isTasksDropdownOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </button>

                <button
                  onClick={() => setIsLinksDropdownOpen(!isLinksDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg border border-border text-xs font-medium transition flex items-center gap-2 ${
                    isLinksDropdownOpen ? 'bg-primary text-white border-primary' : 'bg-card hover:bg-page text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icons.Link />
                  <span>{language === 'ar' ? 'الروابط والملفات' : 'Links & PDFs'}</span>
                  {isLinksDropdownOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </button>

                <button
                  onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg border border-border text-xs font-medium transition flex items-center gap-2 ${
                    isAiDropdownOpen ? 'bg-primary text-white border-primary' : 'bg-card hover:bg-page text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icons.Sparkles />
                  <span>{language === 'ar' ? 'ملخص AI' : 'AI Summarizer'}</span>
                  {isAiDropdownOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </button>

                <button
                  onClick={() => setIsAnalyticsDropdownOpen(!isAnalyticsDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg border border-border text-xs font-medium transition flex items-center gap-2 ${
                    isAnalyticsDropdownOpen ? 'bg-primary text-white border-primary' : 'bg-card hover:bg-page text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icons.Chart />
                  <span>{language === 'ar' ? 'الإحصائيات' : 'Analytics'}</span>
                  {isAnalyticsDropdownOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </button>
              </div>

              {isTasksDropdownOpen && (
                <div className="bg-card border border-border rounded-xl p-2.5 shadow-xs max-h-52 overflow-y-auto animate-in slide-in-from-top-1 duration-150 [&_*]:text-xs [&_button]:py-1 [&_button]:px-2 [&_input]:py-1 [&_input]:px-2 [&_input]:text-xs">
                  <TaskBoard />
                </div>
              )}

              {isLinksDropdownOpen && (
                <div className="bg-card border border-border rounded-xl p-2.5 shadow-xs max-h-52 overflow-y-auto animate-in slide-in-from-top-1 duration-150 [&_*]:text-xs [&_button]:py-1 [&_button]:px-2 [&_input]:py-1 [&_input]:px-2 [&_input]:text-xs">
                  <LinkList />
                </div>
              )}

              {isAiDropdownOpen && (
                <div className="bg-card border border-border rounded-xl p-2.5 shadow-xs max-h-64 overflow-y-auto animate-in slide-in-from-top-1 duration-150 [&_*]:text-xs [&_button]:py-1 [&_button]:px-2 [&_input]:py-1 [&_input]:px-2 [&_input]:text-xs border-primary/30">
                  <AISummarizer />
                </div>
              )}

              {isAnalyticsDropdownOpen && (
                <div className="bg-card border border-border rounded-xl p-2.5 shadow-xs max-h-80 overflow-y-auto animate-in slide-in-from-top-1 duration-150 [&_*]:text-xs [&_button]:py-1 [&_button]:px-2 [&_input]:py-1 [&_input]:px-2 [&_input]:text-xs border-primary/30">
                  <StudyAnalytics />
                </div>
              )}

              <Chat />
            </div>

            {/* Column 3: Collaborative Drawing Whiteboard (5 Cols) */}
            <div className="lg:col-span-5 w-full">
              <Whiteboard />
            </div>

          </div>
        )}
      </main>

      {/* MODALS */}
      <Modal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        title={language === 'ar' ? 'مكالمة فيديو' : 'Video Call'}
      >
        <VideoCall />
      </Modal>

      {/* Room Info Modal */}
      <Modal
        isOpen={isRoomInfoOpen}
        onClose={() => setIsRoomInfoOpen(false)}
        title={language === 'ar' ? 'معلومات الغرفة' : 'Room Info'}
      >
        <div className="space-y-3">
          <div className="p-2.5 bg-page rounded-lg border border-border">
            <p className="text-[10px] text-ink-soft">{language === 'ar' ? 'رمز الغرفة' : 'Room Code'}</p>
            <p className="text-sm font-mono font-bold text-primary">{roomCode}</p>
          </div>
          
          <MembersList />

          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <button
              onClick={leaveRoom}
              className="w-full py-1.5 px-3 rounded-lg border border-border hover:bg-page transition text-xs font-medium flex items-center justify-center gap-2"
            >
              <Icons.Back />
              <span>{language === 'ar' ? 'مغادرة الغرفة' : 'Leave Room'}</span>
            </button>

            {/* Delete Room is only available to the room creator */}
            {isHost && (
              <button
                onClick={() => setIsDeleteRoomModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition text-xs font-medium flex items-center justify-center gap-2"
              >
                <Icons.Trash />
                <span>{language === 'ar' ? 'حذف الغرفة' : 'Delete Room'}</span>
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Room Confirmation Modal */}
      <Modal
        isOpen={isDeleteRoomModalOpen}
        onClose={() => setIsDeleteRoomModalOpen(false)}
        title={language === 'ar' ? 'تأكيد حذف الغرفة' : 'Delete Room'}
      >
        <div className="space-y-3">
          <p className="text-xs text-ink-soft">
            {language === 'ar' 
              ? 'هل أنت تأكد من أنك تريد حذف هذه الغرفة؟ سيتم إغلاقها لجميع الأعضاء.' 
              : 'Are you sure you want to delete this room? It will be closed for all members.'}
          </p>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsDeleteRoomModalOpen(false)}
              className="px-2.5 py-1 text-xs rounded-lg border border-border hover:bg-page transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteRoom}
              className="px-2.5 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('editUsername')}
      >
        <form onSubmit={handleSaveUsername} className="space-y-2.5">
          <input
            type="text"
            value={newUsernameInput}
            onChange={(e) => setNewUsernameInput(e.target.value)}
            className="w-full px-2.5 py-1 text-xs border border-border rounded-lg bg-page text-ink focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t('enterNewUsername')}
            autoFocus
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-2.5 py-1 text-xs rounded-lg border border-border hover:bg-page transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 text-xs rounded-lg bg-primary text-white hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('deleteAccount')}
      >
        <form onSubmit={handleConfirmDeleteAccount} className="space-y-2.5">
          <p className="text-xs text-ink-soft">{t('confirmDeleteAccount')}</p>
          <input
            type="password"
            value={deletePasswordInput}
            onChange={(e) => setDeletePasswordInput(e.target.value)}
            className="w-full px-2.5 py-1 text-xs border border-border rounded-lg bg-page text-ink focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder={t('enterPasswordConfirm')}
            required
            autoFocus
          />
          {deleteError && (
            <p className="text-[10px] text-red-500">{deleteError}</p>
          )}
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-2.5 py-1 text-xs rounded-lg border border-border hover:bg-page transition"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : t('deleteAccount')}
            </button>
          </div>
        </form>
      </Modal>

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