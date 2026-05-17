// ─────────────────────────────────────────────────────────────
// Summarize Controller — Gemini AI Placeholder
// ─────────────────────────────────────────────────────────────

/**
 * POST /v1/api/summarize
 * Placeholder endpoint for Gemini-powered text summarization.
 * Currently returns mock data for frontend integration testing.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const { analyzeSentiment } = require('../../public/js/GeminiCore');

const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      const err = new Error('Request body must include a non-empty "text" field.');
      err.status = 400;
      throw err;
    }

    // Call the live Gemini AI model
    const aiResult = await analyzeSentiment(text);

    const markdownResponse = `
### 🧠 Analysis Complete

**Sentiment:** ${aiResult.sentiment === 'positive' ? '🟢' : aiResult.sentiment === 'negative' ? '🔴' : '🟡'} ${aiResult.sentiment.toUpperCase()} (${aiResult.sentimentScore})
**Risk Level:** ${aiResult.riskLevel === 'High' ? '🔴 High Risk' : aiResult.riskLevel === 'Medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}

---

### 📝 Executive Summary
*${aiResult.summary}*

> **AI Note:** This analysis is generated in real-time by Google Gemini Flash.
    `.trim();

    res.json({
      success: true,
      summary: markdownResponse // Sent as 'summary' based on dashboard.js parsing rules
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { summarize };
