import { useState, useRef, useEffect } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'

// Crisp SVG Icons
const Icons = {
  Undo: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
    </svg>
  ),
  Redo: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Download: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Pen: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Line: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="19" x2="19" y2="5"/>
    </svg>
  ),
  Square: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>
  ),
  Circle: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  Triangle: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L22 20H2L12 3Z"/>
    </svg>
  ),
  Arrow: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/>
    </svg>
  ),
  Eraser: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8l10-10c.8-.8 2-.8 2.8 0l6 6c.8.8.8 2 0 2.8L13 20"/><path d="M18 12l-5-5"/>
    </svg>
  ),
  Palette: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.062 0-.877.734-1.625 1.625-1.625H16c3.312 0 6-2.688 6-6C22 6.5 17.5 2 12 2z"/>
    </svg>
  ),
}

const COLOR_SWATCHES = [
  '#1C1917', '#FFFFFF', '#BF6E52', '#E8A94C', '#7C8F5E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981',
  '#F59E0B', '#78716C',
]

const PEN_STYLES = ['pen', 'marker', 'pencil', 'highlighter']
const SIZES = [
  { id: 'thin', value: 2 },
  { id: 'medium', value: 4 },
  { id: 'thick', value: 8 },
]

export default function Whiteboard() {
  const { language } = useLanguage()
  const { roomCode } = useRoom()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('pen')
  const [penStyle, setPenStyle] = useState('pen')
  const [color, setColor] = useState('#1C1917')
  const [size, setSize] = useState('medium')
  const [gridType, setGridType] = useState('none')
  const [syncing, setSyncing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)

  const startPos = useRef({ x: 0, y: 0 })
  const snapshotRef = useRef(null)
  const lastSyncedRef = useRef(null)
  const hasLoadedRef = useRef(false)

  const dict = {
    en: {
      scratchpadTitle: 'Scratchpad & Solving Space',
      pen: 'Pen', line: 'Line', rect: 'Rectangle', circle: 'Circle',
      triangle: 'Triangle', arrow: 'Arrow', eraser: 'Eraser',
      styPen: 'Pen', styMarker: 'Marker', styPencil: 'Pencil', styHighlighter: 'Highlighter',
      sizeThin: 'Thin', sizeMedium: 'Medium', sizeThick: 'Thick',
      undo: 'Undo', redo: 'Redo', clear: 'Clear',
      gridNone: 'Blank', gridLines: 'Grid', gridDots: 'Dots', gridRuled: 'Ruled', gridGraph: 'Graph',
      save: 'Save Image', synced: 'Synced with room', customColor: 'Custom',
    },
    ar: {
      scratchpadTitle: 'مساحة الحل والرسم',
      pen: 'قلم', line: 'خط', rect: 'مستطيل', circle: 'دائرة',
      triangle: 'مثلث', arrow: 'سهم', eraser: 'ممحاة',
      styPen: 'قلم', styMarker: 'ماركر', styPencil: 'رصاص', styHighlighter: 'هايلايتر',
      sizeThin: 'رفيع', sizeMedium: 'متوسط', sizeThick: 'سميك',
      undo: 'تراجع', redo: 'إعادة', clear: 'مسح الكل',
      gridNone: 'بدون', gridLines: 'شبكة', gridDots: 'نقاط', gridRuled: 'أسطر', gridGraph: 'مربعات',
      save: 'حفظ الصورة', synced: 'متزامن مع الغرفة', customColor: 'مخصص',
    },
  }

  const t = dict[language] || dict.en

  const TOOLS = [
    { id: 'pen', label: t.pen, Icon: Icons.Pen },
    { id: 'line', label: t.line, Icon: Icons.Line },
    { id: 'rectangle', label: t.rect, Icon: Icons.Square },
    { id: 'circle', label: t.circle, Icon: Icons.Circle },
    { id: 'triangle', label: t.triangle, Icon: Icons.Triangle },
    { id: 'arrow', label: t.arrow, Icon: Icons.Arrow },
    { id: 'eraser', label: t.eraser, Icon: Icons.Eraser },
  ]

  const PEN_STYLE_LABELS = {
    pen: t.styPen, marker: t.styMarker, pencil: t.styPencil, highlighter: t.styHighlighter,
  }

  // Set up the canvas once, then wait for the shared whiteboard doc before
  // drawing anything — this avoids briefly showing a blank board and then
  // popping in the real content a moment later.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }, [])

  // Live sync: listen for the shared whiteboard image for this room.
  useEffect(() => {
    if (!roomCode) return
    hasLoadedRef.current = false

    const boardRef = doc(db, 'rooms', roomCode, 'meta', 'whiteboard')

    const unsubscribe = onSnapshot(boardRef, (snap) => {
      const remoteDataUrl = snap.exists() ? snap.data().imageData : null

      // Skip if this update is just an echo of what we ourselves just sent.
      if (remoteDataUrl && remoteDataUrl === lastSyncedRef.current) return

      if (remoteDataUrl) {
        restoreState(remoteDataUrl, () => pushHistory(remoteDataUrl))
      } else if (!hasLoadedRef.current) {
        // No board saved yet for this room — start from a blank canvas.
        pushHistory(canvasRef.current?.toDataURL())
      }
      hasLoadedRef.current = true
    })

    return unsubscribe
  }, [roomCode])

  function pushHistory(dataUrl) {
    if (!dataUrl) return
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyStep + 1)
      return [...nextHistory, dataUrl]
    })
    setHistoryStep((prev) => prev + 1)
  }

  // Saves the current canvas locally (for undo/redo) and, unless this state
  // came from a remote update, pushes it to Firestore so other room members
  // see it too.
  async function saveCanvasState({ broadcast = true } = {}) {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    pushHistory(dataUrl)

    if (broadcast && roomCode) {
      lastSyncedRef.current = dataUrl
      setSyncing(true)
      try {
        const boardRef = doc(db, 'rooms', roomCode, 'meta', 'whiteboard')
        await setDoc(boardRef, { imageData: dataUrl, updatedAt: new Date() })
      } catch (err) {
        console.error('Whiteboard sync error:', err)
      } finally {
        setSyncing(false)
      }
    }
  }

  function handleUndo() {
    if (historyStep <= 0) return
    const newStep = historyStep - 1
    setHistoryStep(newStep)
    restoreState(history[newStep])
    broadcastDataUrl(history[newStep])
  }

  function handleRedo() {
    if (historyStep >= history.length - 1) return
    const newStep = historyStep + 1
    setHistoryStep(newStep)
    restoreState(history[newStep])
    broadcastDataUrl(history[newStep])
  }

  async function broadcastDataUrl(dataUrl) {
    if (!roomCode || !dataUrl) return
    lastSyncedRef.current = dataUrl
    try {
      const boardRef = doc(db, 'rooms', roomCode, 'meta', 'whiteboard')
      await setDoc(boardRef, { imageData: dataUrl, updatedAt: new Date() })
    } catch (err) {
      console.error('Whiteboard sync error:', err)
    }
  }

  function restoreState(dataUrl, onDone) {
    const canvas = canvasRef.current
    if (!canvas || !dataUrl) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = dataUrl
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      onDone?.()
    }
  }

  function getCoordinates(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  function baseWidth() {
    return SIZES.find((s) => s.id === size)?.value ?? 4
  }

  function startDrawing(e) {
    setIsDrawing(true)
    const pos = getCoordinates(e)
    startPos.current = pos

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  function draw(e) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const currentPos = getCoordinates(e)

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = baseWidth() * 2.5
      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.stroke()
      return
    }

    ctx.strokeStyle = color

    if (tool === 'pen') {
      ctx.globalCompositeOperation = penStyle === 'highlighter' ? 'multiply' : 'source-over'

      if (penStyle === 'marker') {
        ctx.lineWidth = baseWidth() * 2
        ctx.globalAlpha = 0.9
      } else if (penStyle === 'pencil') {
        ctx.lineWidth = Math.max(1, baseWidth() * 0.6)
        ctx.globalAlpha = 0.55
      } else if (penStyle === 'highlighter') {
        ctx.lineWidth = baseWidth() * 4
        ctx.globalAlpha = 0.35
      } else {
        ctx.lineWidth = baseWidth()
        ctx.globalAlpha = 1
      }

      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.stroke()
    } else {
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = baseWidth()
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.beginPath()

      const sx = startPos.current.x
      const sy = startPos.current.y
      const cx = currentPos.x
      const cy = currentPos.y

      if (tool === 'line') {
        ctx.moveTo(sx, sy)
        ctx.lineTo(cx, cy)
      } else if (tool === 'rectangle') {
        ctx.rect(sx, sy, cx - sx, cy - sy)
      } else if (tool === 'circle') {
        const radius = Math.hypot(cx - sx, cy - sy)
        ctx.arc(sx, sy, radius, 0, 2 * Math.PI)
      } else if (tool === 'triangle') {
        const width = cx - sx
        const height = cy - sy
        ctx.moveTo(sx + width / 2, sy)
        ctx.lineTo(sx, sy + height)
        ctx.lineTo(sx + width, sy + height)
        ctx.closePath()
      } else if (tool === 'arrow') {
        const angle = Math.atan2(cy - sy, cx - sx)
        const headLength = 10 + baseWidth() * 2
        ctx.moveTo(sx, sy)
        ctx.lineTo(cx, cy)
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - headLength * Math.cos(angle - Math.PI / 6), cy - headLength * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - headLength * Math.cos(angle + Math.PI / 6), cy - headLength * Math.sin(angle + Math.PI / 6))
      }
      ctx.stroke()
    }
  }

  function stopDrawing() {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    saveCanvasState()
  }

  function clearBoard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveCanvasState()
  }

  function saveImage() {
    const canvas = canvasRef.current
    if (!canvas) return
    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `whiteboard-note-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-4 shadow-card space-y-3">
      {/* Workspace Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 text-accent-ink">
            <Icons.Pen />
          </div>
          <div>
            <h3 className="font-serif font-medium text-lg text-ink leading-tight">{t.scratchpadTitle}</h3>
            <p className="text-[10px] text-sage font-semibold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full bg-sage ${syncing ? 'animate-pulse' : ''}`} />
              {t.synced}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="px-2.5 py-1.5 rounded-full text-[11px] hover:bg-almond transition disabled:opacity-40 flex items-center gap-1 text-ink-soft"
          >
            <Icons.Undo />
            <span>{t.undo}</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="px-2.5 py-1.5 rounded-full text-[11px] hover:bg-almond transition disabled:opacity-40 flex items-center gap-1 text-ink-soft"
          >
            <Icons.Redo />
            <span>{t.redo}</span>
          </button>
          <button
            onClick={clearBoard}
            className="px-2.5 py-1.5 text-red-500 hover:bg-red-500/10 rounded-full text-[11px] transition font-semibold flex items-center gap-1"
          >
            <Icons.Trash />
            <span>{t.clear}</span>
          </button>
          <button
            onClick={saveImage}
            className="px-3 py-1.5 bg-accent text-white rounded-full text-[11px] font-bold hover:bg-accent-hover transition flex items-center gap-1"
          >
            <Icons.Download />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      {/* Row 1: Shape/pen tools + pen style (only relevant for freehand pen) */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 bg-almond p-1 rounded-2xl flex-wrap">
          {TOOLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1 ${
                tool === id
                  ? 'bg-card text-ink shadow-card font-bold'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {tool === 'pen' && (
          <div className="flex items-center gap-1 bg-almond p-1 rounded-2xl">
            {PEN_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setPenStyle(style)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] transition ${
                  penStyle === style
                    ? 'bg-card text-ink shadow-card font-bold'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {PEN_STYLE_LABELS[style]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Row 2: Colors + size + sheet type */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-almond p-1.5 rounded-2xl flex-wrap">
          {COLOR_SWATCHES.map((hex) => (
            <button
              key={hex}
              onClick={() => {
                setColor(hex)
                if (tool === 'eraser') setTool('pen')
              }}
              style={{ backgroundColor: hex, border: hex === '#FFFFFF' ? '1px solid var(--color-border)' : 'none' }}
              className={`w-4 h-4 rounded-full transition ${
                color === hex && tool !== 'eraser'
                  ? 'ring-2 ring-accent ring-offset-1 scale-110'
                  : 'opacity-80 hover:opacity-100'
              }`}
            />
          ))}
          <label
            className="w-4 h-4 rounded-full cursor-pointer relative overflow-hidden ring-1 ring-border"
            style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
            title={t.customColor}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value)
                if (tool === 'eraser') setTool('pen')
              }}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center gap-1 bg-almond p-1 rounded-2xl">
          {SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] transition flex items-center justify-center ${
                size === s.id
                  ? 'bg-card text-ink shadow-card font-bold'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <span className="rounded-full bg-current" style={{ width: s.value, height: s.value }} />
            </button>
          ))}
        </div>

        <select
          value={gridType}
          onChange={(e) => setGridType(e.target.value)}
          className="bg-almond rounded-xl px-2.5 py-1.5 text-[11px] text-ink focus:outline-none"
        >
          <option value="none">{t.gridNone}</option>
          <option value="grid">{t.gridLines}</option>
          <option value="dots">{t.gridDots}</option>
          <option value="ruled">{t.gridRuled}</option>
          <option value="graph">{t.gridGraph}</option>
        </select>
      </div>

      {/* Canvas */}
      <div
        className={`relative w-full h-[360px] rounded-2xl border border-border overflow-hidden ${
          gridType === 'grid'
            ? 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]'
            : gridType === 'dots'
            ? 'bg-[radial-gradient(#80808025_1px,transparent_1px)] bg-[size:16px_16px]'
            : gridType === 'ruled'
            ? 'bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_27px,#80808025_27px,#80808025_28px)]'
            : gridType === 'graph'
            ? 'bg-[linear-gradient(to_right,#8080800f_1px,transparent_1px),linear-gradient(to_bottom,#8080800f_1px,transparent_1px)] bg-[size:10px_10px]'
            : 'bg-page'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  )
}