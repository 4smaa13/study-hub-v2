// src/services/aiService.js
//
// All prompt-building and the OpenAI key now live server-side in
// netlify/functions/ai-proxy.js. This file just calls that function.

export async function processStudyNotes(text, mode = 'summary', language = 'en') {
  const response = await fetch('/.netlify/functions/ai-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, mode, language }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'AI request failed. Please try again.');
  }

  return data.content;
}