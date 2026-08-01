/**
 * app/api/projects/[id]/pitch-studio/render/route.js
 *
 * POST — Render the final pitch video MP4.
 * Body: { storyboard, images, audio, projectTitle }
 * Returns: MP4 binary stream
 */

import { NextResponse } from 'next/server';
import { getInMemoryProjectById } from '@/lib/memoryStore';
import { renderVideo } from '@/lib/pitchStudio/videoRenderer';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { storyboard, images, audio, projectTitle } = body;

    if (!storyboard?.scenes?.length) {
      return NextResponse.json({ error: 'storyboard with scenes is required.' }, { status: 400 });
    }
    if (!images?.length) {
      return NextResponse.json({ error: 'images array is required.' }, { status: 400 });
    }

    const title = projectTitle || 'pitch-video';
    const mp4Buffer = await renderVideo({ storyboard, images, audio: audio || [], projectTitle: title });

    const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-pitch-video.mp4`;

    return new Response(mp4Buffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': mp4Buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[pitch-studio/render POST]', error);
    return NextResponse.json({ error: error.message || 'Failed to render video.' }, { status: 500 });
  }
}

// Body size limit is handled by Next.js defaults or next.config.mjs in App Router.
