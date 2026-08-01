import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image' });
  
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'A futuristic city skyline at sunset in a synthwave style.' }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        // Try snake_case and camelCase
        responseFormat: {
          type: "image",
          aspect_ratio: "16:9",
          aspectRatio: "16:9",
          image_size: "1K",
          imageSize: "1K"
        }
      }
    });
    const candidates = result.response.candidates;
    if (candidates && candidates[0]) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          console.log('SUCCESS, image type:', part.inlineData.mimeType, 'size:', part.inlineData.data.length);
        }
      }
    } else {
      console.log('NO CANDIDATES');
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
