import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: 'AIzaSyBEo-dFxK_Mhzc3E9OS6-wwmhHAqjJItRE' });

async function test() {
  const models = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview', 'gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-flash-latest'];
  for (const m of models) {
    try {
        console.log("Testing:", m);
        const response = await genAI.models.generateContent({
        model: m,
        contents: [{ parts: [{ text: `Hello world` }] }],
        });
        console.log("Success with", m, ":", response.text);
        break;
    } catch (error) {
        console.error("Error with", m, ":", error.message);
    }
  }
}
test();
