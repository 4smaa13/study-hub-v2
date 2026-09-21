// src/components/Ai/AiSummarizer.jsx
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { processStudyNotes } from '../../services/aiService';

export default function AiSummarizer() {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('summary');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textDict = {
    en: {
      title: 'AI Study Assistant',
      placeholder: 'Paste your lecture notes, code snippets, or textbook text here...',
      modeSummary: 'Summary',
      modeFlashcards: 'Flashcards',
      modeQuiz: 'Practice Quiz',
      generateBtn: 'Generate AI Insights',
      loadingText: 'Analyzing content...',
      resultsTitle: 'Generated Output'
    },
    ar: {
      title: 'مساعد الدراسة الذكي',
      placeholder: 'التقط أو الصق الملاحظات، الأكواد، أو نصوص المحاضرة هنا...',
      modeSummary: 'تلخيص',
      modeFlashcards: 'بطاقات استذكار',
      modeQuiz: 'اختبار قصير',
      generateBtn: 'توليد التحليلات',
      loadingText: 'جاري التحليل...',
      resultsTitle: 'النتائج المستخرجة'
    }
  };

  const t = textDict[language] || textDict.en;

  async function handleGenerate() {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setOutput(null);

    try {
      const result = await processStudyNotes(inputText, mode, language);
      
      if (mode === 'flashcards' || mode === 'quiz') {
        const cleanJson = result.replace(/```json|```/g, '').trim();
        setOutput(JSON.parse(cleanJson));
      } else {
        setOutput(result);
      }
    } catch (err) {
      setError('Failed to generate insights. Check API key or connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-card flex flex-col gap-3 h-full text-ink">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 text-accent-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="font-serif font-medium text-lg text-ink">{t.title}</h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-almond p-1 rounded-2xl">
          {['summary', 'flashcards', 'quiz'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1.5 text-[11px] rounded-xl font-semibold transition ${
                mode === m 
                  ? 'bg-card text-ink shadow-card' 
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {m === 'summary' && t.modeSummary}
              {m === 'flashcards' && t.modeFlashcards}
              {m === 'quiz' && t.modeQuiz}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={t.placeholder}
        className="w-full h-24 p-3 text-sm bg-card border-[1.5px] border-almond rounded-2xl resize-none focus:outline-none focus:border-accent text-ink placeholder:text-ink-soft/60 transition"
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !inputText.trim()}
        className="w-full py-2.5 bg-accent text-white text-sm font-bold rounded-2xl hover:bg-accent-hover transition disabled:opacity-50"
      >
        {loading ? t.loadingText : t.generateBtn}
      </button>

      {/* Output Display */}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {output && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-almond/60 rounded-2xl p-3.5 text-xs space-y-2">
          <h4 className="font-bold text-ink-soft border-b border-almond pb-1.5">{t.resultsTitle}</h4>
          
          {mode === 'summary' && (
            <div className="whitespace-pre-line text-ink leading-relaxed">
              {output}
            </div>
          )}

          {mode === 'flashcards' && Array.isArray(output) && (
            <div className="space-y-2">
              {output.map((card, idx) => (
                <div key={idx} className="bg-card border border-border p-2.5 rounded-xl space-y-1">
                  <p className="font-semibold text-accent-ink">Q: {card.question}</p>
                  <p className="text-ink-soft">A: {card.answer}</p>
                </div>
              ))}
            </div>
          )}

          {mode === 'quiz' && Array.isArray(output) && (
            <div className="space-y-3">
              {output.map((q, idx) => (
                <div key={idx} className="bg-card border border-border p-2.5 rounded-xl space-y-1.5">
                  <p className="font-semibold text-ink">{idx + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {q.options?.map((opt, oIdx) => (
                      <span 
                        key={oIdx} 
                        className={`p-1.5 rounded-lg text-[11px] ${
                          oIdx === q.correct 
                            ? 'bg-sage-soft text-sage font-semibold' 
                            : 'bg-almond text-ink'
                        }`}
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}