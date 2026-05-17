const { analyzeSentiment } = require('../services/geminiService');

const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      const err = new Error('Request body must include a non-empty "text" field.');
      err.status = 400;
      throw err;
    }

    const aiResult = await analyzeSentiment(text);

    const sentimentIcon =
      aiResult.sentiment === 'positive' ? '🟢' : aiResult.sentiment === 'negative' ? '🔴' : '🟡';
    const riskIcon =
      aiResult.riskLevel === 'High' ? '🔴' : aiResult.riskLevel === 'Medium' ? '🟡' : '🟢';

    const markdownResponse = `
### Analysis Complete

**Sentiment:** ${sentimentIcon} ${aiResult.sentiment.toUpperCase()} (${aiResult.sentimentScore})
**Risk Level:** ${riskIcon} ${aiResult.riskLevel}

---

### Executive Summary
*${aiResult.summary}*
    `.trim();

    res.json({ success: true, summary: markdownResponse, raw: aiResult });
  } catch (error) {
    next(error);
  }
};

module.exports = { summarize };
