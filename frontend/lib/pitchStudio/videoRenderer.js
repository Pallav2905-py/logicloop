/**
 * lib/pitchStudio/videoRenderer.js
 *
 * Server-side video renderer using fluent-ffmpeg + ffmpeg-static.
 * Composites scene images with Ken Burns pan/zoom, overlays captions/titles,
 * layers voice audio, adds fade/slide transitions. Outputs 1080p MP4.
 *
 * Provider pattern: swap renderVideo() implementation for Veo, RunwayML, etc.
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Point fluent-ffmpeg at the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Ken Burns filter parameters per camera motion type
 */
const CAMERA_MOTION_FILTERS = {
  zoom_in:   (dur) => `zoompan=z='min(zoom+0.0008,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur * 25)}:s=1920x1080:fps=25`,
  zoom_out:  (dur) => `zoompan=z='if(lte(zoom,1.0),1.3,max(1.0,zoom-0.0008))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur * 25)}:s=1920x1080:fps=25`,
  pan_left:  (dur) => `zoompan=z='1.15':x='if(gte(on,1),min(x+1.5,iw-iw/zoom),iw/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur * 25)}:s=1920x1080:fps=25`,
  pan_right: (dur) => `zoompan=z='1.15':x='if(gte(on,1),max(x-1.5,0),iw/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur * 25)}:s=1920x1080:fps=25`,
  static:    (dur) => `zoompan=z='1.0':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur * 25)}:s=1920x1080:fps=25`,
};

/**
 * Write base64 image data to a temp file, return path.
 * Handles both data URLs and raw base64.
 */
async function writeTempImage(base64Data, index, tmpDir) {
  let data = base64Data;
  let ext = 'png';

  if (base64Data.startsWith('data:')) {
    const [header, payload] = base64Data.split(',');
    data = payload;
    if (header.includes('svg')) ext = 'svg';
    else if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';
    else ext = 'png';
  }

  const filePath = path.join(tmpDir, `scene_${index}.${ext}`);
  await writeFile(filePath, Buffer.from(data, 'base64'));

  // If SVG, convert to PNG via sharp for ffmpeg compatibility
  if (ext === 'svg') {
    const sharp = (await import('sharp')).default;
    const pngPath = path.join(tmpDir, `scene_${index}.png`);
    await sharp(filePath)
      .resize(1920, 1080, { fit: 'cover', background: { r: 15, g: 23, b: 42 } })
      .png()
      .toFile(pngPath);
    await unlink(filePath);
    return pngPath;
  }

  return filePath;
}

/**
 * Write base64 audio data to a temp MP3 file.
 */
async function writeTempAudio(base64Audio, index, tmpDir) {
  const data = base64Audio.startsWith('data:')
    ? base64Audio.split(',')[1]
    : base64Audio;
  const filePath = path.join(tmpDir, `audio_${index}.mp3`);
  await writeFile(filePath, Buffer.from(data, 'base64'));
  return filePath;
}

/**
 * Generate a silent audio file of a given duration (for scenes without TTS audio).
 */
async function generateSilentAudio(duration, index, tmpDir) {
  const filePath = path.join(tmpDir, `silence_${index}.mp3`);
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input('anullsrc=r=44100:cl=stereo')
      .inputOption('-f lavfi')
      .duration(duration)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .output(filePath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  return filePath;
}

/**
 * Build a drawtext filter string for scene title + caption overlay.
 */
function buildTextFilter(title, caption, sceneIndex) {
  const safeTitle = title.replace(/'/g, "\\'").replace(/:/g, '\\:');
  const safeCaption = caption.replace(/'/g, "\\'").replace(/:/g, '\\:');
  const sceneNum = String(sceneIndex).padStart(2, '0');

  return [
    // Dark scrim at bottom
    `drawbox=x=0:y=880:w=1920:h=200:color=0x0F172A@0.7:t=fill`,
    // Scene number — top left
    `drawtext=text='SCENE ${sceneNum}':fontcolor=0x2563EB@0.8:fontsize=22:x=60:y=60:font=sans:fontweight=bold`,
    // Scene title — bottom
    `drawtext=text='${safeTitle}':fontcolor=white@0.95:fontsize=52:x=(w-text_w)/2:y=910:font=sans:fontweight=bold`,
    // Caption — bottom sub
    `drawtext=text='${safeCaption}':fontcolor=0x94A3B8@0.9:fontsize=30:x=(w-text_w)/2:y=978:font=sans`,
  ].join(',');
}

/**
 * Render a single scene to a video segment.
 */
async function renderScene(scene, imagePath, audioPath, tmpDir) {
  const outputPath = path.join(tmpDir, `segment_${scene.index}.mp4`);
  const motion = scene.cameraMotion || 'static';
  const dur = scene.duration || 7;
  const kenBurns = CAMERA_MOTION_FILTERS[motion]?.(dur) || CAMERA_MOTION_FILTERS.static(dur);
  const textFilter = buildTextFilter(scene.title, scene.caption, scene.index);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOption(`-loop 1`)
      .inputOption(`-t ${dur}`)
      .input(audioPath)
      .inputOption(`-t ${dur}`)
      .complexFilter([
        // Scale image to 1920x1080 first
        `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080[scaled]`,
        // Apply Ken Burns
        `[scaled]${kenBurns}[zoomed]`,
        // Apply fade in/out
        `[zoomed]fade=t=in:st=0:d=0.4,fade=t=out:st=${dur - 0.4}:d=0.4[faded]`,
        // Apply text overlay
        `[faded]${textFilter}[v]`,
        // Audio
        `[1:a]afade=t=in:st=0:d=0.3,afade=t=out:st=${dur - 0.3}:d=0.3,atrim=0:${dur},asetpts=PTS-STARTPTS[a]`,
      ])
      .map('[v]')
      .map('[a]')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-crf 20',
        '-pix_fmt yuv420p',
        '-r 25',
        '-ar 44100',
        '-ac 2',
        '-movflags +faststart',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', (err) => reject(new Error(`Scene ${scene.index} render failed: ${err.message}`)))
      .run();
  });

  return outputPath;
}

/**
 * Concatenate all scene segments into final MP4.
 */
async function concatenateSegments(segmentPaths, tmpDir, title) {
  const concatFile = path.join(tmpDir, 'concat.txt');
  const lines = segmentPaths.map((p) => `file '${p}'`).join('\n');
  await writeFile(concatFile, lines);

  const outputPath = path.join(tmpDir, `final_${Date.now()}.mp4`);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOption('-f concat')
      .inputOption('-safe 0')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-crf 18',
        '-pix_fmt yuv420p',
        '-r 25',
        '-ar 44100',
        '-ac 2',
        '-movflags +faststart',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', (err) => reject(new Error(`Concatenation failed: ${err.message}`)))
      .run();
  });

  return outputPath;
}

/**
 * Render the complete pitch video.
 *
 * @param {Object} options
 * @param {import('./storyboard').Storyboard} options.storyboard
 * @param {string[]} options.images - Array of base64 image data URLs
 * @param {import('./tts').TTSResult[]} options.audio - Array of TTS results
 * @param {string} options.projectTitle
 * @returns {Promise<Buffer>} MP4 file buffer
 */
export async function renderVideo({ storyboard, images, audio, projectTitle }) {
  const tmpDir = path.join(os.tmpdir(), `pitch_studio_${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  const segmentPaths = [];
  const tempFiles = [];

  try {
    for (let i = 0; i < storyboard.scenes.length; i++) {
      const scene = storyboard.scenes[i];
      const imageData = images[i];
      const audioData = audio[i];

      // Write image
      const imagePath = await writeTempImage(imageData, scene.index, tmpDir);
      tempFiles.push(imagePath);

      // Write or generate audio
      let audioPath;
      if (audioData?.audioBase64) {
        audioPath = await writeTempAudio(audioData.audioBase64, scene.index, tmpDir);
      } else {
        audioPath = await generateSilentAudio(scene.duration, scene.index, tmpDir);
      }
      tempFiles.push(audioPath);

      // Render scene segment
      const segPath = await renderScene(scene, imagePath, audioPath, tmpDir);
      segmentPaths.push(segPath);
      tempFiles.push(segPath);
    }

    // Concatenate all segments
    const finalPath = await concatenateSegments(segmentPaths, tmpDir, projectTitle);
    tempFiles.push(finalPath);

    // Read the final file into buffer
    const buffer = await readFile(finalPath);
    return buffer;
  } finally {
    // Cleanup temp files
    for (const f of tempFiles) {
      try { await unlink(f); } catch { /* ignore */ }
    }
    try { fs.rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
  }
}
