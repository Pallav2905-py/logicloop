/**
 * app/api/projects/[id]/pitch-studio/images/route.js
 *
 * POST — Generate AI images for all scenes in a storyboard.
 * Body: { scenes: Scene[] }
 * Returns: { images: string[] }  — array of base64 data URLs
 */

import { NextResponse } from 'next/server';
import { generateSceneImages, regenerateSceneImage } from '@/lib/pitchStudio/imageGenerator';

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { scenes, sceneIndex } = body;

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'scenes array is required.' }, { status: 400 });
    }

    // Support regenerating a single scene
    if (sceneIndex !== undefined && sceneIndex !== null) {
      const scene = scenes[sceneIndex];
      if (!scene) {
        return NextResponse.json({ error: 'Scene not found at index.' }, { status: 400 });
      }
      const image = await regenerateSceneImage(scene);
      return NextResponse.json({ image, index: sceneIndex });
    }

    // Generate all images
    const images = await generateSceneImages(scenes);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('[pitch-studio/images POST]', error);
    return NextResponse.json({ error: error.message || 'Failed to generate images.' }, { status: 500 });
  }
}
