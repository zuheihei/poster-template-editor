import { toCanvas, toJpeg, toPng } from 'html-to-image';
import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { ensurePosterFontsReady } from './posterFonts.js';

const EXPORT_PIXEL_RATIO = 1;
const JPEG_QUALITY = 0.92;
const JPEG_BACKGROUND = '#F7F7F7';

export const EXPORT_FORMATS = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' },
  { id: 'gif', label: 'GIF' },
];

function getCaptureOptions(width, height) {
  return {
    width,
    height,
    canvasWidth: width * EXPORT_PIXEL_RATIO,
    canvasHeight: height * EXPORT_PIXEL_RATIO,
    pixelRatio: EXPORT_PIXEL_RATIO,
    cacheBust: true,
    skipAutoScale: true,
    style: {
      transform: 'none',
      margin: '0',
    },
  };
}

function resolveFilename(filename, format) {
  const base = filename.replace(/\.[^.]+$/i, '');
  const ext = format === 'jpg' ? 'jpg' : format;
  return `${base}.${ext}`;
}

function waitForImages(node) {
  const imgs = node.querySelectorAll('img');
  const promises = [...imgs].map(
    (img) =>
      new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      }),
  );
  return Promise.all(promises);
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function canvasToGifDataUrl(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  const palette = quantize(data, 256);
  const index = applyPalette(data, palette);

  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, { palette, delay: 0 });
  gif.finish();

  const bytes = gif.bytes();
  const binary = [...bytes].map((byte) => String.fromCharCode(byte)).join('');
  return `data:image/gif;base64,${btoa(binary)}`;
}

async function capturePosterDataUrl(node, width, height, format) {
  const options = getCaptureOptions(width, height);

  if (format === 'png') {
    return toPng(node, options);
  }

  if (format === 'jpg') {
    return toJpeg(node, {
      ...options,
      quality: JPEG_QUALITY,
      backgroundColor: JPEG_BACKGROUND,
    });
  }

  if (format === 'gif') {
    const canvas = await toCanvas(node, options);
    return canvasToGifDataUrl(canvas);
  }

  throw new Error(`不支持的导出格式：${format}`);
}

/**
 * 导出单张海报（PNG / JPG / GIF，Figma 原尺寸 1:1）
 */
export async function exportPoster(node, filename, width, height, format = 'png') {
  if (!node) throw new Error('海报节点不存在');

  await ensurePosterFontsReady();
  await waitForImages(node);

  const dataUrl = await capturePosterDataUrl(node, width, height, format);
  downloadDataUrl(dataUrl, resolveFilename(filename, format));
}

/** 一键导出全部海报（打包 ZIP） */
export async function exportAllPosters(items, format = 'png') {
  await ensurePosterFontsReady();
  const { zipSync } = await import('fflate');
  const zipFiles = {};

  for (const item of items) {
    await waitForImages(item.node);
    const dataUrl = await capturePosterDataUrl(item.node, item.width, item.height, format);
    const filename = resolveFilename(item.filename, format);
    const binary = atob(dataUrl.split(',')[1] || '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    zipFiles[filename] = bytes;
  }

  const zipped = zipSync(zipFiles, { level: 6 });
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `posters-${format}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
