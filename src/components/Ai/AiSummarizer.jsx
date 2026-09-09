// src/components/AI/AISummarizer.jsx
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
    <div className="bg-card border border-border rounded-2xl p-3 shadow-xs flex flex-col gap-2.5 h-full text-ink">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-bold text-xs flex items-center gap-1.5">
          <span>✨</span>
          <span>{t.title}</span>
        </h3>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-page p-0.5 rounded-lg border border-border">
          {['summary', 'flashcards', 'quiz'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition ${
                mode === m 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-ink-soft hover:text-ink hover:bg-card'
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
        className="w-full h-24 p-2 text-xs bg-page border border-border rounded-xl resize-none focus:outline-none focus:border-primary text-ink placeholder:text-ink-soft/60"
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !inputText.trim()}
        className="w-full py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? t.loadingText : t.generateBtn}
      </button>

      {/* Output Display */}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {output && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-page border border-border rounded-xl p-2.5 text-xs space-y-2">
          <h4 className="font-bold text-ink-soft border-b border-border pb-1">{t.resultsTitle}</h4>
          
          {mode === 'summary' && (
            <div className="whitespace-pre-line text-ink leading-relaxed">
              {output}
            </div>
          )}

          {mode === 'flashcards' && Array.isArray(output) && (
            <div className="space-y-2">
              {output.map((card, idx) => (
                <div key={idx} className="bg-card border border-border p-2 rounded-lg space-y-1">
                  <p className="font-semibold text-primary">Q: {card.question}</p>
                  <p className="text-ink-soft">A: {card.answer}</p>
                </div>
              ))}
            </div>
          )}

          {mode === 'quiz' && Array.isArray(output) && (
            <div className="space-y-3">
              {output.map((q, idx) => (
                <div key={idx} className="bg-card border border-border p-2 rounded-lg space-y-1.5">
                  <p className="font-semibold text-ink">{idx + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {q.options?.map((opt, oIdx) => (
                      <span 
                        key={oIdx} 
                        className={`p-1 rounded text-[11px] border ${
                          oIdx === q.correct 
                            ? 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 font-medium' 
                            : 'border-border bg-page text-ink'
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