const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 25000);

const response = await fetch(
 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.HF_API_KEY}`
    },
    signal: controller.signal,
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 500, temperature: 0.7 }
    })
  }
);
clearTimeout(timeout);
const data = await response.json();
if (data.error) {
  return res.status(500).json({ error: JSON.stringify(data.error) });
}
const script = Array.isArray(data) ? data[0]?.generated_text?.trim() : null;
