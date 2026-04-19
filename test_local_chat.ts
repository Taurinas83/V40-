import fetch from 'node-fetch';

async function testFetch() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Crie um protocolo de treino de braço (bíceps e tríceps) utilizando o método BFR (Blood Flow Restriction) com cargas ultraleves, focado em hipertrofia miofibrilar e minimizando o estresse articular. Detalhe a aplicação do torniquete, as faixas de repetições e o descanso, priorizando a segurança e a recuperação.' })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}
testFetch();
