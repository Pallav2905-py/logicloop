/**
 * lib/pitchStudio/tts.js
 *
 * Text-to-speech service for pitch narration.
 *
 * Priority order:
 * 1. Google Cloud TTS REST API (if GOOGLE_TTS_API_KEY is set)
 * 2. Gemini-based synthesis signal (fallback — client uses Web Speech API)
 *
 * Returns per-scene audio as base64 MP3, or `null` when client-side
 * Web Speech API should be used instead.
 *
 * Provider pattern: swap out `synthesizeWithGoogleTTS` for ElevenLabs,
 * PlayHT, or any other TTS provider without changing business logic.
 */

/**
 * @typedef {Object} TTSResult
 * @property {string|null} audioBase64  - base64 MP3 data, or null for client TTS
 * @property {'google_tts'|'web_speech'} provider
 * @property {number} estimatedDuration - seconds
 */

/**
 * Approximate duration of spoken text (average 130 words/min for presentations)
 */
function estimateDuration(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.round((words / 130) * 60);
}

/**
 * Call Google Cloud TTS REST API
 */
async function synthesizeWithGoogleTTS(text, apiKey) {
  const payload = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-D', // Authoritative male voice
      ssmlGender: 'MALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.95, // Slightly slower for gravitas
      pitch: -1.0,        // Slightly lower for authority
      volumeGainDb: 0.0,
      effectsProfileId: ['headphone-class-device'],
    },
  };

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google TTS API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.audioContent; // base64 MP3
}

/**
 * Synthesize narration for a single scene.
 * @param {string} narration
 * @returns {Promise<TTSResult>}
 */
async function synthesizeScene(narration) {
  const googleKey = process.env.GOOGLE_TTS_API_KEY;

  if (googleKey && googleKey !== 'your_google_tts_api_key_here') {
    try {
      const audioBase64 = await synthesizeWithGoogleTTS(narration, googleKey);
      return {
        audioBase64,
        provider: 'google_tts',
        estimatedDuration: estimateDuration(narration),
      };
    } catch (err) {
      console.warn('[PitchStudio:TTS] Google TTS failed, falling back to Web Speech:', err.message);
    }
  }

  // Fallback: signal client to use Web Speech API
  return {
    audioBase64: null,
    provider: 'web_speech',
    estimatedDuration: estimateDuration(narration),
  };
}

/**
 * Synthesize narration for all scenes.
 * @param {import('./storyboard').Scene[]} scenes
 * @returns {Promise<TTSResult[]>}
 */
export async function synthesizeNarrations(scenes) {
  const results = await Promise.allSettled(
    scenes.map((scene) => synthesizeScene(scene.narration))
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`[PitchStudio:TTS] Scene ${i + 1} synthesis failed:`, r.reason);
    return {
      audioBase64: null,
      provider: 'web_speech',
      estimatedDuration: scenes[i].duration,
    };
  });
}

/**
 * Check which TTS provider will be used (for UI display).
 * @returns {'google_tts'|'web_speech'}
 */
export function getTTSProvider() {
  const googleKey = process.env.GOOGLE_TTS_API_KEY;
  if (googleKey && googleKey !== 'your_google_tts_api_key_here') {
    return 'google_tts';
  }
  return 'web_speech';
}
