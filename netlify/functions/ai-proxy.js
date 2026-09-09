// netlify/functions/ai-proxy.js
//
// Runs server-side on Netlify's infrastructure — the OpenAI key set here
// (as the OPENAI_API_KEY environment variable in the Netlify dashboard)
// is never sent to the browser. The frontend calls this function instead
// of calling OpenAI directly.

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const API_KEY = process.env.OPENAI_API_KEY
  if (!API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing OPENAI_API_KEY.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { text, mode = 'summary', language = 'en' } = body

  if (!text || typeof text !== 'string' || !text.trim()) {
    return new Response(JSON.stringify({ error: 'Missing "text" to process.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const prompts = {
    summary: language === 'ar'
      ? `قم بتلخيص النص التالي إلى نقاط رئيسية واضحة وموجزة باللغة العربية:\n\n${text}`
      : `Summarize the following study notes into concise, key takeaway bullet points:\n\n${text}`,

    flashcards: language === 'ar'
      ? `استخرج 4 إلى 6 بطاقات استذكار (سؤال وجواب) من النص التالي بصيغة JSON:\n[{"question": "...", "answer": "..."}]\n\n${text}`
      : `Generate 4 to 6 flashcards (Question & Answer pairs) from this text in JSON format:\n[{"question": "...", "answer": "..."}]\n\n${text}`,

    quiz: language === 'ar'
      ? `أنشئ 3 أسئلة اختيارات متعددة بناءً على هذا النص بصيغة JSON:\n[{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]\n\n${text}`
      : `Create 3 multiple-choice practice questions from this text in JSON format:\n[{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]\n\n${text}`,
  }

  const prompt = prompts[mode] || prompts.summary

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic tutor specializing in engineering and computer science.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
      }),
    })

    const data = await openaiResponse.json()

    if (!openaiResponse.ok) {
      return new Response(
        JSON.stringify({ error: data?.error?.message || 'OpenAI request failed.' }),
        { status: openaiResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const content = data.choices?.[0]?.message?.content || ''
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Network error contacting OpenAI.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}