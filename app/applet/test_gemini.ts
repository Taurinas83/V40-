import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({});

async function test() {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Hello world` }] }],
      config: {
        temperature: 0.4,
      }
    });
    console.log("Response:", response.text);
  } catch (error) {
    console.error("Error with gemini-3-flash-preview:", error);
    try {
        const response2 = await genAI.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [{ parts: [{ text: `Hello world` }] }],
            config: {
              temperature: 0.4,
            }
          });
          console.log("Response2:", response2.text);
    } catch (e2) {
        console.error("Error with gemini-flash-latest:", e2);
    }
  }
}
test();
