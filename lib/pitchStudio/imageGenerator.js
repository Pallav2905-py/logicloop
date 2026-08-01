/**
 * lib/pitchStudio/imageGenerator.js
 *
 * Generates one premium AI illustration per storyboard scene using
 * Gemini Nano Banana 2 (gemini-3.1-flash-image).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Color palettes per scene index for fallback SVGs
const SCENE_PALETTES = [
  { bg: '#0F172A', accent: '#2563EB', secondary: '#7C3AED' },
  { bg: '#0F172A', accent: '#EF4444', secondary: '#F97316' },
  { bg: '#0F172A', accent: '#10B981', secondary: '#2563EB' },
  { bg: '#0F172A', accent: '#2563EB', secondary: '#06B6D4' },
  { bg: '#0F172A', accent: '#7C3AED', secondary: '#2563EB' },
  { bg: '#0F172A', accent: '#F59E0B', secondary: '#10B981' },
  { bg: '#0F172A', accent: '#06B6D4', secondary: '#2563EB' },
  { bg: '#0F172A', accent: '#2563EB', secondary: '#7C3AED' },
];

const SCENE_ICONS = ['🚀', '⚠️', '📈', '💡', '⚡', '🧠', '🗺️', '🌟'];

/**
 * Generate a beautiful fallback SVG scene as base64 data URL
 * Used when Gemini API fails or no API key is provided
 */
function generateFallbackSVG(scene) {
  const palette = SCENE_PALETTES[(scene.index - 1) % SCENE_PALETTES.length];
  const icon = SCENE_ICONS[(scene.index - 1) % SCENE_ICONS.length];
  const title = scene.title || `Scene ${scene.index}`;
  const caption = scene.caption || '';

  // Build a premium looking SVG "illustration"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg${scene.index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${palette.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E293B;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="glow${scene.index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${palette.accent};stop-opacity:0" />
      <stop offset="50%" style="stop-color:${palette.accent};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${palette.secondary};stop-opacity:0" />
    </linearGradient>
    <filter id="blur${scene.index}">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    <filter id="glow-filter${scene.index}">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bg${scene.index})"/>
  
  <!-- Ambient glow blobs -->
  <ellipse cx="400" cy="300" rx="350" ry="250" fill="${palette.accent}" opacity="0.08" filter="url(#blur${scene.index})"/>
  <ellipse cx="1500" cy="700" rx="400" ry="300" fill="${palette.secondary}" opacity="0.08" filter="url(#blur${scene.index})"/>
  <ellipse cx="960" cy="540" rx="500" ry="350" fill="${palette.accent}" opacity="0.05" filter="url(#blur${scene.index})"/>
  
  <!-- Grid pattern -->
  <g opacity="0.04" stroke="${palette.accent}" stroke-width="1">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1080"/>`).join('')}
    ${Array.from({length: 12}, (_, i) => `<line x1="0" y1="${i * 90}" x2="1920" y2="${i * 90}"/>`).join('')}
  </g>
  
  <!-- Isometric grid accent -->
  <g opacity="0.06" stroke="${palette.accent}" stroke-width="1" transform="translate(960,540)">
    ${Array.from({length: 8}, (_, i) => {
      const r = (i + 1) * 80;
      return `<circle cx="0" cy="0" r="${r}" fill="none"/>`;
    }).join('')}
  </g>
  
  <!-- Decorative connecting lines -->
  <line x1="200" y1="200" x2="600" y2="400" stroke="${palette.accent}" stroke-width="1.5" opacity="0.2"/>
  <line x1="600" y1="400" x2="1000" y2="300" stroke="${palette.secondary}" stroke-width="1.5" opacity="0.2"/>
  <line x1="1000" y1="300" x2="1400" y2="500" stroke="${palette.accent}" stroke-width="1.5" opacity="0.2"/>
  <line x1="1400" y1="500" x2="1700" y2="350" stroke="${palette.secondary}" stroke-width="1.5" opacity="0.2"/>
  
  <!-- Node dots -->
  <circle cx="200" cy="200" r="6" fill="${palette.accent}" opacity="0.7" filter="url(#glow-filter${scene.index})"/>
  <circle cx="600" cy="400" r="8" fill="${palette.secondary}" opacity="0.8" filter="url(#glow-filter${scene.index})"/>
  <circle cx="1000" cy="300" r="10" fill="${palette.accent}" opacity="0.9" filter="url(#glow-filter${scene.index})"/>
  <circle cx="1400" cy="500" r="8" fill="${palette.secondary}" opacity="0.8" filter="url(#glow-filter${scene.index})"/>
  <circle cx="1700" cy="350" r="6" fill="${palette.accent}" opacity="0.7" filter="url(#glow-filter${scene.index})"/>
  
  <!-- Central glow bar -->
  <rect x="0" y="520" width="1920" height="2" fill="url(#glow${scene.index})" opacity="0.6"/>
  
  <!-- Corner accent brackets -->
  <g stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.5">
    <path d="M 60 60 L 60 120 L 120 120"/>
    <path d="M 1860 60 L 1860 120 L 1800 120"/>
    <path d="M 60 1020 L 60 960 L 120 960"/>
    <path d="M 1860 1020 L 1860 960 L 1800 960"/>
  </g>
  
  <!-- Scene number -->
  <text x="80" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="${palette.accent}" opacity="0.6" font-weight="600" letter-spacing="3">SCENE ${String(scene.index).padStart(2, '0')}</text>
  
  <!-- Main icon -->
  <text x="960" y="480" font-size="120" text-anchor="middle" dominant-baseline="middle" opacity="0.9">${icon}</text>
  
  <!-- Title -->
  <text x="960" y="600" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="white" text-anchor="middle" letter-spacing="-1" opacity="0.95">${title}</text>
  
  <!-- Caption subtitle -->
  <text x="960" y="668" font-family="system-ui, -apple-system, sans-serif" font-size="26" fill="${palette.accent}" text-anchor="middle" opacity="0.8">${caption}</text>
  
  <!-- Bottom accent line -->
  <rect x="760" y="700" width="400" height="2" rx="1" fill="${palette.accent}" opacity="0.4"/>
  
  <!-- Floating particles -->
  ${Array.from({length: 20}, (_, i) => {
    const x = 100 + (i * 90);
    const y = 150 + Math.sin(i * 1.2) * 80;
    const r = 2 + (i % 3);
    const op = 0.2 + (i % 5) * 0.08;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 === 0 ? palette.accent : palette.secondary}" opacity="${op}"/>`;
  }).join('')}
</svg>`;

  const b64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

/**
 * Attempt to generate an image via Gemini Nano Banana 2 (gemini-3.1-flash-image)
 * Returns base64 string or null on failure.
 */
async function generateWithGemini(imagePrompt, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-image', // Nano Banana 2
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a premium enterprise startup pitch presentation illustration. ${imagePrompt} Style: 16:9 widescreen, dark background (#0F172A), blue (#2563EB) accents, isometric or abstract, professional consulting aesthetic, high quality, highly detailed, beautiful lighting.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
      },
    });

    const candidates = result.response.candidates;
    if (!candidates?.length) return null;

    for (const part of candidates[0].content.parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    console.warn(`[PitchStudio:ImageGen] Gemini image gen failed: ${err.message}`);
    return null;
  }
}

/**
 * Generate images for all scenes.
 * Returns array of base64 data URL strings (same length as scenes).
 *
 * @param {import('./storyboard').Scene[]} scenes
 * @returns {Promise<string[]>}
 */
export async function generateSceneImages(scenes) {
  const apiKey = process.env.GEMINI_API_KEY;

  const results = await Promise.allSettled(
    scenes.map(async (scene) => {
      // Try Gemini image generation first
      if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        const geminiImage = await generateWithGemini(scene.imagePrompt, apiKey);
        if (geminiImage) return geminiImage;
      }

      // Fallback: Generate premium SVG
      console.log(`[PitchStudio:ImageGen] Using SVG fallback for scene ${scene.index}`);
      return generateFallbackSVG(scene);
    })
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`[PitchStudio:ImageGen] Scene ${i + 1} failed:`, r.reason);
    return generateFallbackSVG(scenes[i]);
  });
}

/**
 * Regenerate image for a single scene.
 * @param {import('./storyboard').Scene} scene
 * @returns {Promise<string>}
 */
export async function regenerateSceneImage(scene) {
  const images = await generateSceneImages([scene]);
  return images[0];
}
