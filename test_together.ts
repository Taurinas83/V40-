import fetch from 'node-fetch';

async function testTogether() {
  try {
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer tgp_v1_naVmpg6sxVYtvvHvOhC7rgzg-QjfNlOihzPGu642EW8`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    const data = await res.json();
    console.log("Together response:", data);
  } catch (e) {
    console.error(e);
  }
}
testTogether();
