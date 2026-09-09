import { useState, useRef, useEffect } from 'react'
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
  Eraser: () => (
    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8l10-10c.8-.8 2-.8 2.8 0l6 6c.8.8.8 2 0 2.8L13 20"/><path d="M18 12l-5-5"/>
    </svg>
  )
}

const COLOR_SWATCHES = [
  { label: 'Default Ink', hex: 'var(--ink, #1e293b)' },
  { label: 'Primary Blue', hex: '#3b82f6' },
  { label: 'Emerald Green', hex: '#10b981' },
  { label: 'Amber Orange', hex: '#f59e0b' },
  { label: 'Rose Red', hex: '#f43f5e' },
  { label: 'Purple Accent', hex: '#8b5cf6' },
]

export default function Whiteboard() {
  const { language } = useLanguage()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#3b82f6')
  const [lineWidth, setLineWidth] = useState(2)
  const [gridType, setGridType] = useState('none')

  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)

  const startPos = useRef({ x: 0, y: 0 })
  const snapshotRef = useRef(null)

  const dict = {
    en: {
      scratchpadTitle: 'Scratchpad & Solving Space',
      pen: 'Pen',
      line: 'Line',
      rect: 'Rectangle',
      circle: 'Circle',
      eraser: 'Eraser',
      undo: 'Undo',
      redo: 'Redo',
      clear: 'Clear',
      gridNone: 'No Grid',
      gridLines: 'Grid Lines',
      gridDots: 'Dot Grid',
      save: 'Save Image',
    },
    ar: {
      scratchpadTitle: 'مساحة الحل والرسم',
      pen: 'قلم',
      line: 'خط',
      rect: 'مستطيل',
      circle: 'دائرة',
      eraser: 'ممحاة',
      undo: 'تراجع',
      redo: 'إعادة',
      clear: 'مسح الكل',
      gridNone: 'بدون شبكة',
      gridLines: 'شبكة خطوط',
      gridDots: 'شبكة نقاط',
      save: 'حفظ الصورة',
    },
  }

  const t = dict[language] || dict.en

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    saveCanvasState()
  }, [])

  function saveCanvasState() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()

    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyStep + 1)
      return [...nextHistory, dataUrl]
    })
    setHistoryStep((prev) => prev + 1)
  }

  function handleUndo() {
    if (historyStep <= 0) return
    const newStep = historyStep - 1
    setHistoryStep(newStep)
    restoreState(history[newStep])
  }

  function handleRedo() {
    if (historyStep >= history.length - 1) return
    const newStep = historyStep + 1
    setHistoryStep(newStep)
    restoreState(history[newStep])
  }

  function restoreState(dataUrl) {
    const canvas = canvasRef.current
    if (!canvas || !dataUrl) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = dataUrl
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
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

    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.stroke()
      return
    }

    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = color

    if (tool === 'pen') {
      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.stroke()
    } else {
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.beginPath()

      if (tool === 'line') {
        ctx.moveTo(startPos.current.x, startPos.current.y)
        ctx.lineTo(currentPos.x, currentPos.y)
      } else if (tool === 'rectangle') {
        const width = currentPos.x - startPos.current.x
        const height = currentPos.y - startPos.current.y
        ctx.rect(startPos.current.x, startPos.current.y, width, height)
      } else if (tool === 'circle') {
        const radius = Math.hypot(
          currentPos.x - startPos.current.x,
          currentPos.y - startPos.current.y
        )
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI)
      }
      ctx.stroke()
    }
  }

  function stopDrawing() {
    if (!isDrawing) return
    setIsDrawing(false)
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
    <div className="bg-card border border-border rounded-2xl p-3 shadow-xs space-y-3">
      {/* Workspace Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-2.5">
        <h3 className="font-bold text-xs flex items-center gap-1.5">
          <Icons.Pen />
          <span>{t.scratchpadTitle}</span>
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="px-2 py-1 border border-border rounded-lg text-[11px] hover:bg-page transition disabled:opacity-40 flex items-center gap-1"
          >
            <Icons.Undo />
            <span>{t.undo}</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="px-2 py-1 border border-border rounded-lg text-[11px] hover:bg-page transition disabled:opacity-40 flex items-center gap-1"
          >
            <Icons.Redo />
            <span>{t.redo}</span>
          </button>
          <button
            onClick={clearBoard}
            className="px-2 py-1 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-[11px] transition font-medium flex items-center gap-1"
          >
            <Icons.Trash />
            <span>{t.clear}</span>
          </button>
          <button
            onClick={saveImage}
            className="px-2.5 py-1 bg-primary text-white rounded-lg text-[11px] font-semibold hover:opacity-90 transition flex items-center gap-1"
          >
            <Icons.Download />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      {/* Tools & Settings */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 bg-page p-1 rounded-xl border border-border">
          {[
            { id: 'pen', label: t.pen, Icon: Icons.Pen },
            { id: 'line', label: t.line, Icon: Icons.Line },
            { id: 'rectangle', label: t.rect, Icon: Icons.Square },
            { id: 'circle', label: t.circle, Icon: Icons.Circle },
            { id: 'eraser', label: t.eraser, Icon: Icons.Eraser },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 ${
                tool === id
                  ? 'bg-card text-ink border border-border shadow-xs font-bold'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-page p-1 rounded-xl border border-border">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              onClick={() => {
                setColor(swatch.hex)
                if (tool === 'eraser') setTool('pen')
              }}
              style={{ backgroundColor: swatch.hex }}
              className={`w-4 h-4 rounded-full border transition ${
                color === swatch.hex && tool !== 'eraser'
                  ? 'ring-2 ring-primary ring-offset-1 scale-110'
                  : 'border-border opacity-80 hover:opacity-100'
              }`}
              title={swatch.label}
            />
          ))}
        </div>

        <select
          value={gridType}
          onChange={(e) => setGridType(e.target.value)}
          className="bg-page border border-border rounded-lg px-2 py-1 text-[11px] text-ink focus:outline-none"
        >
          <option value="none">{t.gridNone}</option>
          <option value="grid">{t.gridLines}</option>
          <option value="dots">{t.gridDots}</option>
        </select>
      </div>

      {/* Canvas */}
      <div
        className={`relative w-full h-[360px] rounded-xl border border-border overflow-hidden ${
          gridType === 'grid'
            ? 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]'
            : gridType === 'dots'
            ? 'bg-[radial-gradient(#80808025_1px,transparent_1px)] bg-[size:16px_16px]'
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