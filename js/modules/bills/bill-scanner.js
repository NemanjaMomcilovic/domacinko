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

const MAX_BILL_PHOTO_BYTES = 120000; // ~120 KB dataURL budget for localStorage
const BILL_PHOTO_MAX_EDGE = 1280;
const BILL_PHOTO_QUALITY = 0.72;

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
        try {
          let { width, height } = img;
          const scale = Math.min(1, BILL_PHOTO_MAX_EDGE / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          let quality = BILL_PHOTO_QUALITY;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > MAX_BILL_PHOTO_BYTES && quality > 0.4) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          if (dataUrl.length > MAX_BILL_PHOTO_BYTES * 1.35) {
            // Still huge — store a smaller thumbnail only
            const thumbScale = Math.min(1, 640 / Math.max(width, height));
            canvas.width = Math.round(width * thumbScale);
            canvas.height = Math.round(height * thumbScale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', 0.55);
          }

          if (dataUrl.length > MAX_BILL_PHOTO_BYTES * 2) {
            resolve(null);
            return;
          }
          resolve(dataUrl);
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
 * Full capture pipeline: OCR scan + optional compressed photo.
 * @param {File} file
 * @returns {Promise<{ scan: ScanResult, photoDataUrl: string|null, parserId: string }>}
 */
async function captureBillFromImage(file) {
  const parserId = typeof BillParserRegistry !== 'undefined'
    ? BillParserRegistry.getPreferredParserId()
    : 'local';
  const [scan, photoDataUrl] = await Promise.all([
    scanBillImage(file),
    compressBillPhoto(file)
  ]);
  return { scan, photoDataUrl, parserId };
}
