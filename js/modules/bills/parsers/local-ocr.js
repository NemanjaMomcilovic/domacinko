/**
 * Domaćinko — lokalni OCR parser (v1, lightweight)
 *
 * Implementira isti interfejs kao budući cloud-vision.js:
 *   parseBillImage(file) → Promise<ScanResult>
 *
 * v1: bez teškog Tesseract-a (PWA / GH Pages). Čuva isti ScanResult
 * ugovor — UI uvek traži potvrdu. Heuristike iz rawText-a (regex)
 * koriste se kada postoji tekst (npr. kasnije iz OCR-a ili paste).
 */

const LocalBillParser = (() => {
  const id = 'local';

  function emptyScan(overrides = {}) {
    return {
      amount: null,
      currency: 'RSD',
      period: typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : null,
      dueDate: null,
      merchant: null,
      confidence: 0,
      rawText: '',
      needsReview: true,
      ...overrides
    };
  }

  /**
   * Extract amount / merchant / period from OCR text using Serbian bill heuristics.
   * @param {string} text
   * @returns {Partial<ScanResult>}
   */
  function extractFromText(text) {
    if (!text || typeof text !== 'string') return {};
    const raw = text.trim();
    if (!raw) return {};

    const result = { rawText: raw, confidence: 0.15 };
    const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);

    const amountPatterns = [
      /(?:UKUPNO|TOTAL|IZA\s*PLA[ĆC]ANJE|ZA\s*PLA[ĆC]ANJE|IZNOS|DUG)[:\s]*(\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})?|\d+)/i,
      /(\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})?)\s*(?:RSD|din|дин)/i
    ];

    for (const line of [...lines].reverse()) {
      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (!match) continue;
        const rawAmt = match[1].replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
        const val = parseFloat(rawAmt);
        if (val > 0 && val < 5_000_000) {
          result.amount = Math.round(val);
          result.confidence = 0.45;
          break;
        }
      }
      if (result.amount != null) break;
    }

    const merchantHints = [
      { re: /\bEPS\b|Elektrodistribucija|Elektroprivreda/i, name: 'EPS' },
      { re: /\bInfostan\b/i, name: 'Infostan' },
      { re: /\bBeogradski\s+vodovod|JKP\s+BVK/i, name: 'Beogradski vodovod' },
      { re: /\bSBB\b/i, name: 'SBB' },
      { re: /\bYettel\b|\bTelenor\b/i, name: 'Yettel' },
      { re: /\bA1\b|\bVip\b/i, name: 'A1' },
      { re: /\bTelekom\b/i, name: 'Telekom' }
    ];
    for (const hint of merchantHints) {
      if (hint.re.test(raw)) {
        result.merchant = hint.name;
        result.confidence = Math.max(result.confidence || 0, 0.35);
        break;
      }
    }

    const periodMatch = raw.match(/(?:period|obra[cč]un|za\s+mesec)[:\s]*(\d{1,2})[./\-](\d{4})/i)
      || raw.match(/\b(0?[1-9]|1[0-2])[./\-](20\d{2})\b/);
    if (periodMatch) {
      const m = String(periodMatch[1]).padStart(2, '0');
      const y = periodMatch[2];
      result.period = `${y}-${m}`;
    }

    const dueMatch = raw.match(/(?:rok|dospe[cć]e|platiti\s+do)[:\s]*(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/i);
    if (dueMatch) {
      let [, d, mo, y] = dueMatch;
      if (y.length === 2) y = `20${y}`;
      result.dueDate = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    result.needsReview = true;
    return result;
  }

  /**
   * @param {File|Blob} file
   * @param {{ rawText?: string }} [options] — optional pasted/OCR text for heuristics
   * @returns {Promise<ScanResult>}
   */
  async function parseBillImage(file, options = {}) {
    const base = emptyScan();
    const rawText = options.rawText || '';

    if (rawText) {
      return emptyScan({ ...extractFromText(rawText), needsReview: true });
    }

    // v1: no heavy OCR engine — photo is attached by UI; fields need manual confirm
    if (file && file.name) {
      const nameHints = extractFromText(file.name.replace(/[_\-.]/g, ' '));
      if (nameHints.amount != null || nameHints.merchant) {
        return emptyScan({ ...nameHints, confidence: Math.min(nameHints.confidence || 0.2, 0.3) });
      }
    }

    return {
      ...base,
      confidence: 0,
      rawText: '',
      needsReview: true
    };
  }

  return { id, parseBillImage, extractFromText, emptyScan };
})();
