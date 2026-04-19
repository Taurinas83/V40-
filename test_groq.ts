import fetch from 'node-fetch';

async function testGroq() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    const data = await res.json();
    console.log("Groq response:", data);
  } catch (e) {
    console.error(e);
  }
}
testGroq();
