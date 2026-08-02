import { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    appName: 'Uni Study Hub',
    logOut: 'Log Out',
    welcome: 'Welcome to the Study Hub',
    login: 'Log In',
    signup: 'Sign Up',
    emailPlaceholder: 'Email Address',
    passwordPlaceholder: 'Password',
    passwordMinPlaceholder: 'Password (min. 6 characters)',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    loggingIn: 'Logging in...',
    creatingAccount: 'Creating account...',
    noRoomJoined: 'No Room Joined',
    joinRoomHint: 'Join or create a room code below to view links and schedules.',
    roomCodePlaceholder: 'Room Code',
    joinRoom: 'Join Room',
    joining: 'Joining...',
    needNewRoom: 'Need to create a new room/server for your class?',
    createRoom: 'Create a Room',
    createLaunchRoom: 'Create & Launch Room',
    roomNamePlaceholder: 'Room / Class Name',
    roomCodeUniquePlaceholder: 'Unique Room Code (Letters & Numbers)',
    institutionPlaceholder: 'University / Institution Name',
    back: 'Back',
    creating: 'Creating...',
    createAndLaunch: 'Create & Launch',
    leaveRoom: 'Leave Room',
    deleteRoom: 'Delete Room',
    code: 'Code',
    taskBoardTitle: 'Room Assignment & Task Board',
    addTaskPlaceholder: 'Add a task...',
    addTask: 'Add Task',
    noTasks: 'No tasks yet. Add one above.',
    timerTitle: 'Pomodoro Study Timer',
    focusMinutes: 'Focus (min)',
    breakMinutes: 'Break (min)',
    focusSession: 'Focus Session',
    breakTime: 'Break Time',
    startFocus: 'Start Focus',
    pause: 'Pause',
    reset: 'Reset',
    skip: 'Skip',
    scheduleTitle: 'Schedule & Timetable',
    scheduleUrlPlaceholder: 'Paste Schedule Image URL (Admin Only)',
    upload: 'Upload',
    noSchedule: 'No official schedule image uploaded for this room yet.',
    lastUpdated: 'Last updated',
    removeSchedule: 'Remove Current Schedule',
    linksTitle: 'Important Room Links',
    linkTitlePlaceholder: 'Link Title / Name',
    linkUrlPlaceholder: 'URL / Address',
    isPdfLabel: 'This is a PDF / document link',
    addLink: 'Add Link',
    noLinks: 'No room links saved yet.',
    chatTitle: 'Room Chat',
    chatPlaceholder: 'Type a message...',
    send: 'Send',
    noMessages: 'No messages yet. Say hello!',
    loadingMessages: 'Loading messages...',
    chatNoAccess: "You don't have access to this room's chat.",
    chatConnectionError: 'Could not load messages. Check your connection.',
    sendFailed: 'Message failed to send. Try again.',
    deleteWord: 'delete',
    videoTitle: 'Video Call',
    joinRoomForVideo: 'Join a room to start a video call.',
    openNewTab: 'Open in new tab',
    joinCall: 'Join Call',
    leaveCall: 'Leave Call',
    connecting: 'Connecting...',
    joinCallHint: 'Camera and mic will only turn on once you join.',
  },
  ar: {
    appName: 'مركز الدراسة الجامعي',
    logOut: 'تسجيل الخروج',
    welcome: 'مرحبًا بك في مركز الدراسة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    emailPlaceholder: 'البريد الإلكتروني',
    passwordPlaceholder: 'كلمة المرور',
    passwordMinPlaceholder: 'كلمة المرور (6 أحرف على الأقل)',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    loggingIn: 'جاري تسجيل الدخول...',
    creatingAccount: 'جاري إنشاء الحساب...',
    noRoomJoined: 'لم تنضم إلى أي غرفة',
    joinRoomHint: 'انضم إلى غرفة أو أنشئ واحدة أدناه لعرض الروابط والجداول.',
    roomCodePlaceholder: 'رمز الغرفة',
    joinRoom: 'انضمام إلى الغرفة',
    joining: 'جاري الانضمام...',
    needNewRoom: 'هل تحتاج إلى إنشاء غرفة جديدة لصفك؟',
    createRoom: 'إنشاء غرفة',
    createLaunchRoom: 'إنشاء وتشغيل الغرفة',
    roomNamePlaceholder: 'اسم الغرفة / الصف',
    roomCodeUniquePlaceholder: 'رمز غرفة فريد (أحرف وأرقام)',
    institutionPlaceholder: 'اسم الجامعة / المؤسسة',
    back: 'رجوع',
    creating: 'جاري الإنشاء...',
    createAndLaunch: 'إنشاء وتشغيل',
    leaveRoom: 'مغادرة الغرفة',
    deleteRoom: 'حذف الغرفة',
    code: 'الرمز',
    taskBoardTitle: 'مهام الغرفة والواجبات',
    addTaskPlaceholder: 'أضف مهمة...',
    addTask: 'إضافة مهمة',
    noTasks: 'لا توجد مهام بعد. أضف واحدة أعلاه.',
    timerTitle: 'مؤقت بومودورو للدراسة',
    focusMinutes: 'التركيز (دقيقة)',
    breakMinutes: 'الاستراحة (دقيقة)',
    focusSession: 'جلسة تركيز',
    breakTime: 'وقت الاستراحة',
    startFocus: 'ابدأ التركيز',
    pause: 'إيقاف مؤقت',
    reset: 'إعادة تعيين',
    skip: 'تخطي',
    scheduleTitle: 'الجدول الزمني',
    scheduleUrlPlaceholder: 'الصق رابط صورة الجدول (للمشرف فقط)',
    upload: 'رفع',
    noSchedule: 'لم يتم رفع صورة الجدول الرسمي لهذه الغرفة بعد.',
    lastUpdated: 'آخر تحديث',
    removeSchedule: 'إزالة الجدول الحالي',
    linksTitle: 'روابط الغرفة المهمة',
    linkTitlePlaceholder: 'عنوان / اسم الرابط',
    linkUrlPlaceholder: 'الرابط / العنوان',
    isPdfLabel: 'هذا رابط ملف PDF / مستند',
    addLink: 'إضافة رابط',
    noLinks: 'لا توجد روابط محفوظة بعد.',
    chatTitle: 'دردشة الغرفة',
    chatPlaceholder: 'اكتب رسالة...',
    send: 'إرسال',
    noMessages: 'لا توجد رسائل بعد. قل مرحبًا!',
    loadingMessages: 'جاري تحميل الرسائل...',
    chatNoAccess: 'ليس لديك صلاحية الوصول إلى دردشة هذه الغرفة.',
    chatConnectionError: 'تعذر تحميل الرسائل. تحقق من اتصالك.',
    sendFailed: 'فشل إرسال الرسالة. حاول مرة أخرى.',
    deleteWord: 'حذف',
    videoTitle: 'مكالمة فيديو',
    joinRoomForVideo: 'انضم إلى غرفة لبدء مكالمة فيديو.',
    openNewTab: 'فتح في تبويب جديد',
    joinCall: 'الانضمام إلى المكالمة',
    leaveCall: 'مغادرة المكالمة',
    connecting: 'جاري الاتصال...',
    joinCallHint: 'سيتم تشغيل الكاميرا والميكروفون فقط عند الانضمام.',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  function toggleLanguage() {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'))
  }

  function t(key) {
    return translations[language][key] || key
  }

  const value = {
    language,
    isRtl: language === 'ar',
    toggleLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}