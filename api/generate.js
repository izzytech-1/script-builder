export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { convType, who, what, outcome } = req.body;
  if (!convType || !who || !what || !outcome) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const prompt = `Write a word-for-word conversation script for a new manager.
Conversation type: ${convType}
Who they are talking to: ${who}
What happened or the issue: ${what}
What needs to happen by the end: ${outcome}
Rules:
- Start with an exact opening line they can say out loud right now
- No em dashes anywhere
- Active voice in every sentence
- Vary the rhythm: mix short sentences with longer ones
- No binary contrasts
- No adverbs
- No throat-clearing openers like "I want to", "I just", "I feel like"
- Be specific and direct
- 120 to 180 words total
- Write as flowing paragraphs, not bullet points
- Use [name] for the person's name
- Return only the script. No title, no intro, no explanation.`;
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HF_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        })
      }
    );
    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: JSON.stringify(data.error) });
    }
    const script = data.choices?.[0]?.message?.content?.trim();
    if (!script) {
      return res.status(500).json({ error: 'No script generated. Try again.' });
    }
    return res.status(200).json({ script });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
