import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: 'AIzaSyBEo-dFxK_Mhzc3E9OS6-wwmhHAqjJItRE' });

async function test() {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: `Hello world` }] }],
    });
    console.log("Success with hardcoded key:", response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
