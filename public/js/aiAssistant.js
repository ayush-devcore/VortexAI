// ─────────────────────────────────────────────────────────────
// aiAssistant.js — Gemini AI Integration Utility
// ─────────────────────────────────────────────────────────────
// SECURITY NOTE: The API key is stored as a plain variable below.
// TODO: Implement dotenv and move API_KEY to a .env file.
//       1. npm install dotenv
//       2. Create .env with: GEMINI_API_KEY=your_key_here
//       3. Add require('dotenv').config() at the top
//       4. Replace API_KEY with process.env.GEMINI_API_KEY
//       5. Add .env to .gitignore
// ─────────────────────────────────────────────────────────────

const API_KEY = 'YOUR_KEY_HERE';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function analyzeText(text) {
  if (!text || !text.trim()) throw new Error('Input text cannot be empty');

  if (API_KEY === 'YOUR_KEY_HERE') {
    console.warn('⚠️ No API key set. Using mock analysis.');
    return getMockAnalysis(text);
  }

  const prompt = `Analyze this text. Return JSON with: sentimentScore (-1 to 1), sentiment (positive/negative/neutral), summary (1-2 sentences). Text: "${text}". Respond ONLY with valid JSON.`;

  const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 256 }
    })
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result = JSON.parse(cleaned);

  return {
    sentimentScore: Number(result.sentimentScore) || 0,
    sentiment: result.sentiment || 'neutral',
    summary: result.summary || 'No summary available.'
  };
}

function getMockAnalysis(text) {
  const pos = ['good','great','excellent','amazing','happy','success','improve','growth'];
  const neg = ['bad','terrible','awful','hate','fail','decline','problem','error'];
  const words = text.toLowerCase().split(/\s+/);
  let p = 0, n = 0;
  words.forEach(w => { if (pos.some(x => w.includes(x))) p++; if (neg.some(x => w.includes(x))) n++; });
  const score = Math.max(-1, Math.min(1, Math.round(((p - n) / (p + n || 1)) * 100) / 100));
  const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
  const summary = (text.split(/[.!?]/)[0]?.trim() || text.substring(0, 100)) + '.';
  return { sentimentScore: score, sentiment, summary: `[Mock] ${summary}` };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzeText, getMockAnalysis };
}
