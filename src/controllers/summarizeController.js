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
const summarize = (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      const err = new Error('Request body must include a non-empty "text" field.');
      err.status = 400;
      throw err;
    }

    // We use mock generation here if no API key is set, but output it as Markdown
    const wordCount = text.trim().split(/\s+/).length;
    const mockScore = Math.round((Math.random() * 1.6 - 0.8) * 100) / 100;
    const sentiment = mockScore > 0.2 ? 'Positive' : mockScore < -0.2 ? 'Negative' : 'Neutral';
    const riskLevel = mockScore < -0.3 ? 'High' : mockScore < 0.1 ? 'Medium' : 'Low';
    
    const summary = text.split(/[.!?]/)[0]?.trim() || text.substring(0, 80);

    const markdownResponse = `
### 🧠 Analysis Complete

**Sentiment:** ${sentiment === 'Positive' ? '🟢' : sentiment === 'Negative' ? '🔴' : '🟡'} ${sentiment} (${mockScore})
**Risk Level:** ${riskLevel === 'High' ? '🔴 High Risk' : riskLevel === 'Medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}

---

### 📝 Executive Summary
*${summary}.*

**Key Insights:**
* The text contains **${wordCount}** words.
* Based on the context, the primary risk profile is considered **${riskLevel}**.
* The overall tone leans **${sentiment}**, indicating ${sentiment === 'Positive' ? 'favorable conditions.' : 'areas for improvement.'}

> **Action Item:** Review the highlighted risk factors and align team velocity metrics accordingly.
    `;

    res.json({
      success: true,
      data: { markdown: markdownResponse.trim() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { summarize };
