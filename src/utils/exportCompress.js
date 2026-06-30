export const MAX_JPEG_BYTES = 200 * 1024;
export const MAX_PNG_BYTES = 300 * 1024;
export const MAX_GIF_BYTES = 300 * 1024;
export const JPEG_BACKGROUND = '#F7F7F7';
const JPEG_QUALITIES = [0.85, 0.78, 0.72, 0.66, 0.6, 0.54, 0.48, 0.42, 0.36, 0.32];
const JPEG_SCALES = [1, 0.92, 0.84, 0.76, 0.68];
const PNG_SCALES = [1, 0.98, 0.96, 0.94, 0.92, 0.9, 0.88, 0.86, 0.84, 0.82, 0.8, 0.76, 0.72];
const GIF_SCALES = [1, 0.72, 0.58, 0.48];
const GIF_PALETTE_SIZES = [256, 128, 64, 32];

export function getDataUrlByteSize(dataUrl) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Math.ceil(base64.replace(/=+$/, '').length * 0.75);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function pngDataUrlToJpeg(pngDataUrl, quality = 0.88, backgroundColor = JPEG_BACKGROUND) {
  return loadImage(pngDataUrl).then((img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建画布');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', quality);
  });
}

function resizePngDataUrl(pngDataUrl, scale) {
  return loadImage(pngDataUrl).then((img) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = JPEG_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  });
}

export function fitJpegUnderLimit(pngDataUrl, maxBytes = MAX_JPEG_BYTES) {
  function attempt(scaleIndex, qualityIndex, png) {
    const scale = JPEG_SCALES[scaleIndex];
    const prep = png
      ? Promise.resolve(png)
      : scale === 1
        ? Promise.resolve(pngDataUrl)
        : resizePngDataUrl(pngDataUrl, scale);

    return prep.then((currentPng) => {
      if (qualityIndex >= JPEG_QUALITIES.length) {
        if (scaleIndex + 1 >= JPEG_SCALES.length) {
          return pngDataUrlToJpeg(currentPng, JPEG_QUALITIES[JPEG_QUALITIES.length - 1]);
        }
        return attempt(scaleIndex + 1, 0, null);
      }

      return pngDataUrlToJpeg(currentPng, JPEG_QUALITIES[qualityIndex]).then((jpg) => {
        if (getDataUrlByteSize(jpg) <= maxBytes) return jpg;
        return attempt(scaleIndex, qualityIndex + 1, currentPng);
      });
    });
  }

  return attempt(0, 0, null);
}

export function fitPngUnderLimit(pngDataUrl, maxBytes = MAX_PNG_BYTES) {
  function attempt(scaleIndex) {
    const scale = PNG_SCALES[scaleIndex];
    const prep = scale === 1
      ? Promise.resolve(pngDataUrl)
      : resizePngDataUrl(pngDataUrl, scale);

    return prep.then((png) => {
      if (getDataUrlByteSize(png) <= maxBytes) {
        return { dataUrl: png, format: 'png' };
      }
      if (scaleIndex + 1 < PNG_SCALES.length) {
        return attempt(scaleIndex + 1);
      }
      return {
        dataUrl: png,
        format: 'png',
        note: 'PNG 已尽力压缩，仍可能超过 300KB',
      };
    });
  }

  return attempt(0);
}

export async function optimizePngExport(pngDataUrl, maxBytes = MAX_PNG_BYTES) {
  if (getDataUrlByteSize(pngDataUrl) <= maxBytes) {
    return { dataUrl: pngDataUrl, format: 'png' };
  }
  return fitPngUnderLimit(pngDataUrl, maxBytes);
}

function scaleCanvas(source, scale) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = JPEG_BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToGifWithPalette(canvas, paletteSize, gifenc) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  const palette = gifenc.quantize(data, paletteSize);
  const index = gifenc.applyPalette(data, palette);
  const gif = gifenc.GIFEncoder();
  gif.writeFrame(index, width, height, { palette, delay: 0 });
  gif.finish();
  const bytes = gif.bytes();
  const binary = [...bytes].map((byte) => String.fromCharCode(byte)).join('');
  return `data:image/gif;base64,${btoa(binary)}`;
}

export function fitGifUnderLimit(canvas, maxBytes, gifenc) {
  function attempt(scaleIndex, paletteIndex) {
    const scale = GIF_SCALES[scaleIndex];
    const paletteSize = GIF_PALETTE_SIZES[paletteIndex];
    const target = scale === 1 ? canvas : scaleCanvas(canvas, scale);
    const gifUrl = canvasToGifWithPalette(target, paletteSize, gifenc);

    if (getDataUrlByteSize(gifUrl) <= maxBytes) {
      return { dataUrl: gifUrl, format: 'gif' };
    }
    if (paletteIndex + 1 < GIF_PALETTE_SIZES.length) {
      return attempt(scaleIndex, paletteIndex + 1);
    }
    if (scaleIndex + 1 < GIF_SCALES.length) {
      return attempt(scaleIndex + 1, 0);
    }
    return { dataUrl: gifUrl, format: 'gif', note: 'GIF 已尽力压缩，仍可能超过 300KB' };
  }

  return attempt(0, 0);
}
