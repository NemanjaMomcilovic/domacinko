/**
 * Domaćinko — bill scanner INTERFACE
 *
 *   scanBillImage(file, options?) → Promise<ScanResult>
 *
 * ScanResult (stable contract — UI always confirms before save):
 * {
 *   amount: number|null,
 *   currency: 'RSD',
 *   period: string|null,      // '2026-07'
 *   dueDate: string|null,     // ISO date
 *   merchant: string|null,
 *   confidence: number,       // 0-1
 *   rawText: string,
 *   needsReview: true
 * }
 *
 * Photo compression is separate so OCR swap does not touch storage size logic.
 */

const MAX_BILL_PHOTO_BYTES = 140000; // ~140 KB dataURL budget for localStorage
const BILL_PHOTO_MAX_EDGE = 1440;
const BILL_PHOTO_QUALITY = 0.78;
const BILL_PREVIEW_MAX_EDGE = 960;

/**
 * @param {File|Blob} file
 * @param {object} [options]
 * @returns {Promise<ScanResult>}
 */
async function scanBillImage(file, options = {}) {
  const parser = typeof BillParserRegistry !== 'undefined'
    ? BillParserRegistry.getActiveParser()
    : (typeof LocalBillParser !== 'undefined' ? LocalBillParser : null);

  if (!parser || typeof parser.parseBillImage !== 'function') {
    return {
      amount: null,
      currency: 'RSD',
      period: typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : null,
      dueDate: null,
      merchant: null,
      confidence: 0,
      rawText: '',
      needsReview: true
    };
  }

  const result = await parser.parseBillImage(file, options);
  return {
    amount: result.amount ?? null,
    currency: result.currency || 'RSD',
    period: result.period ?? (typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : null),
    dueDate: result.dueDate ?? null,
    merchant: result.merchant ?? null,
    confidence: typeof result.confidence === 'number' ? result.confidence : 0,
    rawText: result.rawText || '',
    needsReview: result.needsReview !== false
  };
}

/**
 * Draw image onto canvas with max edge, return JPEG dataURL at quality.
 * @param {HTMLImageElement} img
 * @param {number} maxEdge
 * @param {number} quality
 * @returns {string|null}
 */
function _billImageToJpeg(img, maxEdge, quality) {
  try {
    let { width, height } = img;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mild contrast boost helps OCR + preview readability
    ctx.filter = 'contrast(1.06) brightness(1.02)';
    ctx.drawImage(img, 0, 0, width, height);
    ctx.filter = 'none';

    let q = quality;
    let dataUrl = canvas.toDataURL('image/jpeg', q);
    while (dataUrl.length > MAX_BILL_PHOTO_BYTES && q > 0.42) {
      q -= 0.07;
      dataUrl = canvas.toDataURL('image/jpeg', q);
    }

    if (dataUrl.length > MAX_BILL_PHOTO_BYTES * 1.25) {
      const thumbScale = Math.min(1, 720 / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * thumbScale));
      canvas.height = Math.max(1, Math.round(height * thumbScale));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/jpeg', 0.58);
    }

    return dataUrl;
  } catch {
    return null;
  }
}

/**
 * Compress image to JPEG dataURL suitable for localStorage.
 * Returns null if compression fails or result still too large (caller may skip persist).
 * @param {File|Blob} file
 * @returns {Promise<string|null>}
 */
function compressBillPhoto(file) {
  return new Promise(resolve => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        const dataUrl = _billImageToJpeg(img, BILL_PHOTO_MAX_EDGE, BILL_PHOTO_QUALITY);
        if (!dataUrl || dataUrl.length > MAX_BILL_PHOTO_BYTES * 2) {
          resolve(null);
          return;
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Higher-quality preview JPEG for confirm screen (not necessarily stored).
 * @param {File|Blob} file
 * @returns {Promise<string|null>}
 */
function createBillPhotoPreview(file) {
  return new Promise(resolve => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        try {
          let { width, height } = img;
          const scale = Math.min(1, BILL_PREVIEW_MAX_EDGE / Math.max(width, height));
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } catch {
          resolve(null);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Full capture pipeline: OCR scan + compressed photo + confirm preview.
 * @param {File} file
 * @returns {Promise<{ scan: ScanResult, photoDataUrl: string|null, previewDataUrl: string|null, parserId: string }>}
 */
async function captureBillFromImage(file) {
  const parserId = typeof BillParserRegistry !== 'undefined'
    ? BillParserRegistry.getPreferredParserId()
    : 'local';
  const [scan, photoDataUrl, previewDataUrl] = await Promise.all([
    scanBillImage(file),
    compressBillPhoto(file),
    createBillPhotoPreview(file)
  ]);
  return {
    scan,
    photoDataUrl,
    previewDataUrl: previewDataUrl || photoDataUrl,
    parserId
  };
}
