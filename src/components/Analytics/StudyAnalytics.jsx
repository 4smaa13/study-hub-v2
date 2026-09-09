import { useState, useEffect } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { useLanguage } from '../../context/LanguageContext'

const Icons = {
  Flame: () => (
    <svg className="w-4 h-4 text-amber-500 fill-amber-500/20 stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
    </svg>
  ),
  Award: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

export default function StudyAnalytics() {
  const { language } = useLanguage()

  const [weeklyData, setWeeklyData] = useState([])
  const [streakDays, setStreakDays] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    // Read real study session logs from localStorage
    const logs = JSON.parse(localStorage.getItem('study_hub_sessions') || '[]')
    
    // Calculate total sessions and hours
    const completedSessions = logs.length
    const accumulatedMinutes = logs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0)
    const hoursCount = (accumulatedMinutes / 60).toFixed(1)

    setTotalSessions(completedSessions)
    setTotalHours(hoursCount)

    // Calculate weekly bar chart mapping for Monday - Sunday
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date()
    
    const chartMap = days.map((dayLabel, index) => {
      // Map 0-6 index to Monday-Sunday dates
      const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
      const targetDate = new Date()
      targetDate.setDate(today.getDate() - (currentDayOfWeek - index))
      const dateStr = targetDate.toISOString().split('T')[0]

      const dayLogs = logs.filter(log => log.date === dateStr)
      const dayMinutes = dayLogs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0)

      return {
        day: dayLabel,
        hours: Number((dayMinutes / 60).toFixed(2)),
        sessions: dayLogs.length
      }
    })

    setWeeklyData(chartMap)

    // Calculate consecutive day streak count
    let streak = 0
    let checkDate = new Date()
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasStudied = logs.some(log => log.date === dateStr)
      if (hasStudied) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // Allow streak to remain active if user hasn't completed today's session yet
        if (streak === 0 && checkDate.toDateString() === new Date().toDateString()) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        break
      }
    }
    setStreakDays(streak)
  }, [])

  const dict = {
    en: {
      title: 'Study Analytics & Milestones',
      streak: 'Day Streak',
      totalFocus: 'Total Focus',
      sessionsCompleted: 'Sessions Done',
      chartTitle: 'Weekly Focus Hours',
      badgesTitle: 'Achievement Badges',
      badge1: 'Starter Focus',
      badge1Desc: 'Completed 5 Pomodoro sessions',
      badge2: 'Night Owl',
      badge2Desc: 'Logged 10+ hours of study time',
      badge3: 'Consistency Champ',
      badge3Desc: 'Maintained a 5-day study streak',
    },
    ar: {
      title: 'تحليلات الدراسة والإنجازات',
      streak: 'أيام السلسلة',
      totalFocus: 'إجمالي التركيز',
      sessionsCompleted: 'الجلسات المكتملة',
      chartTitle: 'ساعات التركيز الأسبوعية',
      badgesTitle: 'شارات الإنجاز',
      badge1: 'بداية التركيز',
      badge1Desc: 'إكمال 5 جلسات بومودورو',
      badge2: 'بومة الليل',
      badge2Desc: 'تسجيل أكثر من 10 ساعات دراسة',
      badge3: 'بطل الاستمرارية',
      badge3Desc: 'الحفاظ على سلسلة دراسة لمدة 5 أيام',
    }
  }

  const t = dict[language] || dict.en

  const BADGES = [
    { title: t.badge1, desc: t.badge1Desc, unlocked: totalSessions >= 5 },
    { title: t.badge2, desc: t.badge2Desc, unlocked: Number(totalHours) >= 10 },
    { title: t.badge3, desc: t.badge3Desc, unlocked: streakDays >= 5 },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h3 className="font-bold text-xs flex items-center gap-1.5">
          <Icons.Award />
          <span>{t.title}</span>
        </h3>

        {/* Gamified Streak Pill */}
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-600 dark:text-amber-400 font-bold text-[11px]">
          <Icons.Flame />
          <span>{streakDays} {t.streak}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-page border border-border rounded-xl p-2 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Icons.Clock />
          </div>
          <div>
            <p className="text-[10px] text-ink-soft">{t.totalFocus}</p>
            <p className="font-bold text-xs">{totalHours} hrs</p>
          </div>
        </div>

        <div className="bg-page border border-border rounded-xl p-2 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
            <Icons.CheckCircle />
          </div>
          <div>
            <p className="text-[10px] text-ink-soft">{t.sessionsCompleted}</p>
            <p className="font-bold text-xs">{totalSessions} sessions</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-page border border-border rounded-xl p-2.5 space-y-1.5">
        <p className="text-[11px] font-semibold text-ink-soft">{t.chartTitle}</p>
        <div className="w-full h-32 text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="currentColor" className="text-ink-soft opacity-60" tickLine={false} />
              <YAxis stroke="currentColor" className="text-ink-soft opacity-60" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card, #ffffff)',
                  borderColor: 'var(--border, #e2e8f0)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-ink-soft">{t.badgesTitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {BADGES.map((badge, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-[11px] space-y-0.5 transition ${
                badge.unlocked
                  ? 'bg-card border-primary/30 text-ink shadow-2xs'
                  : 'bg-page border-border text-ink-soft opacity-50 grayscale'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                <Icons.Award />
                <span className="truncate">{badge.title}</span>
              </div>
              <p className="text-[10px] text-ink-soft leading-tight">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}