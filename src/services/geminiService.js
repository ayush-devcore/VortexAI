// ─────────────────────────────────────────────────────────
// Gemini AI Service — Server-side only (key never exposed)
// ─────────────────────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function analyzeSentiment(text) {
  if (!text?.trim()) throw Object.assign(new Error('Input text cannot be empty'), { status: 400 });

  if (!API_KEY) {
    return _mockAnalysis(text);
  }

  const prompt = `Analyze this text and return JSON with: sentimentScore (-1 to 1), sentiment (positive/negative/neutral), riskLevel (Low/Medium/High), summary (1-2 sentences). Text: "${text.replace(/"/g, '\\"')}". Respond ONLY with valid JSON.`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
    }),
  });

  if (!res.ok) throw Object.assign(new Error(`Gemini API error: ${res.status}`), { status: 502 });

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result = JSON.parse(cleaned);

  return {
    sentimentScore: Number(result.sentimentScore) || 0,
    sentiment: result.sentiment || 'neutral',
    riskLevel: result.riskLevel || 'Low',
    summary: result.summary || 'No summary available.',
  };
}

function _mockAnalysis(text) {
  const pos = ['good', 'great', 'excellent', 'amazing', 'happy', 'success', 'improve', 'growth', 'strong'];
  const neg = ['bad', 'terrible', 'awful', 'hate', 'fail', 'decline', 'problem', 'error', 'risk', 'danger'];
  const words = text.toLowerCase().split(/\s+/);
  let p = 0;
  let n = 0;
  words.forEach((w) => {
    if (pos.some((x) => w.includes(x))) p++;
    if (neg.some((x) => w.includes(x))) n++;
  });

  const score = Math.max(-1, Math.min(1, Math.round(((p - n) / (p + n || 1)) * 100) / 100));
  const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
  const riskLevel = score < -0.3 ? 'High' : score < 0.1 ? 'Medium' : 'Low';
  const summary = (text.split(/[.!?]/)[0]?.trim() || text.substring(0, 100)) + '.';

  return { sentimentScore: score, sentiment, riskLevel, summary: `[Demo] ${summary}` };
}

module.exports = { analyzeSentiment };
