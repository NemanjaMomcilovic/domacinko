/**
 * Domaćinko — lokalni OCR parser (komunalije)
 *
 * Implementira isti interfejs kao budući cloud-vision.js:
 *   parseBillImage(file) → Promise<ScanResult>
 *
 * - Heuristike za srpske račune (iznos, trgovac, period, rok)
 * - Opcioni Tesseract.js sa CDN (lazy load) — ako padne, UX traži potvrdu
 * ScanResult ugovor ostaje isti; UI uvek potvrđuje pre čuvanja.
 */

const LocalBillParser = (() => {
  const id = 'local';

  const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  const OCR_TIMEOUT_MS = 28000;

  let tesseractPromise = null;
  let tesseractFailed = false;

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

  /** Parse Serbian/EU money strings: 12.345,67 | 12 345,67 | 12345 | 1.234 */
  function parseAmountToken(raw) {
    if (!raw) return null;
    let s = String(raw).trim().replace(/\s/g, '').replace(/[^\d.,]/g, '');
    if (!s) return null;

    const hasComma = s.includes(',');
    const hasDot = s.includes('.');

    if (hasComma && hasDot) {
      // 12.345,67 → European
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // 12,345.67
        s = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      // 12345,67 or 12,345 (thousands) — if exactly 3 digits after comma → decimal
      const parts = s.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        s = parts[0].replace(/\./g, '') + '.' + parts[1];
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (hasDot) {
      const parts = s.split('.');
      if (parts.length === 2 && parts[1].length === 2) {
        // 1234.56 decimal
        s = parts[0] + '.' + parts[1];
      } else if (parts.every(p => p.length === 3 || (parts.indexOf(p) === 0 && p.length <= 3))) {
        // 12.345 thousands
        s = s.replace(/\./g, '');
      } else if (parts.length > 2) {
        s = s.replace(/\./g, '');
      }
    }

    const val = parseFloat(s);
    if (!Number.isFinite(val) || val <= 0 || val >= 5_000_000) return null;
    return Math.round(val);
  }

  const AMOUNT_LABEL_PATTERNS = [
    /ukupno\s+za\s+uplatu/i,
    /ukupan\s+iznos\s+za\s+uplatu/i,
    /za\s+pla[cć]anje/i,
    /iza\s+pla[cć]anje/i,
    /ukupno\s+za\s+pla[cć]anje/i,
    /iznos\s+za\s+uplatu/i,
    /ukupan\s+iznos/i,
    /\bukupno\b/i,
    /\biznos\b/i,
    /\bdugovanje\b/i,
    /\bdug\b/i,
    /total\s*(?:amount|due)?/i
  ];

  const AMOUNT_VALUE_RE =
    /(\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})?|\d+[.,]\d{2}|\d{2,7})(?:\s*(?:RSD|din\.?|дин\.?|рсд))?/i;

  function scoreAmountLine(line, amount) {
    let score = 0.25;
    const lower = line.toLowerCase();
    for (let i = 0; i < AMOUNT_LABEL_PATTERNS.length; i++) {
      if (AMOUNT_LABEL_PATTERNS[i].test(lower)) {
        score = Math.max(score, 0.72 - i * 0.03);
        break;
      }
    }
    if (/(?:RSD|din\.?|дин)/i.test(line)) score = Math.max(score, 0.5);
    // Prefer typical utility range
    if (amount >= 200 && amount <= 80000) score += 0.08;
    if (amount >= 500 && amount <= 25000) score += 0.05;
    return Math.min(score, 0.92);
  }

  function extractAmount(text, lines) {
    const candidates = [];

    // Label on same line or previous line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const labeled = AMOUNT_LABEL_PATTERNS.some(re => re.test(line));
      if (labeled) {
        let match = line.match(AMOUNT_VALUE_RE);
        if (!match && lines[i + 1]) match = lines[i + 1].match(AMOUNT_VALUE_RE);
        if (match) {
          const amount = parseAmountToken(match[1]);
          if (amount != null) {
            candidates.push({
              amount,
              score: scoreAmountLine(line + ' ' + (lines[i + 1] || ''), amount) + 0.12
            });
          }
        }
      }
    }

    // RSD / din suffix anywhere
    const currencyRe =
      /(\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})?|\d+[.,]\d{2}|\d{3,7})\s*(?:RSD|din\.?|дин\.?|рсд)/gi;
    let m;
    while ((m = currencyRe.exec(text)) !== null) {
      const amount = parseAmountToken(m[1]);
      if (amount != null) {
        const nearby = text.slice(Math.max(0, m.index - 40), m.index + m[0].length);
        candidates.push({ amount, score: scoreAmountLine(nearby, amount) });
      }
    }

    // Fallback: scan reverse for large money-like numbers near bottom (totals)
    if (!candidates.length) {
      for (const line of [...lines].reverse().slice(0, 12)) {
        const match = line.match(AMOUNT_VALUE_RE);
        if (!match) continue;
        const amount = parseAmountToken(match[1]);
        if (amount != null && amount >= 100) {
          candidates.push({ amount, score: scoreAmountLine(line, amount) * 0.7 });
        }
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score || b.amount - a.amount);
    return candidates[0];
  }

  const MERCHANT_HINTS = [
    { re: /\bEPS\b|Elektrodistribucija|Elektroprivreda|Elektro\s*Srbija/i, name: 'EPS' },
    { re: /\bInfostan\b/i, name: 'Infostan' },
    { re: /\bBeograd\s*vode\b|Beogradski\s+vodovod|JKP\s+BVK|\bBVK\b/i, name: 'Beograd vode' },
    { re: /\bJKP\b(?!\s*BVK)/i, name: 'JKP' },
    { re: /\bSBB\b|Serbia\s*Broadband/i, name: 'SBB' },
    { re: /\bYettel\b|\bTelenor\b/i, name: 'Yettel' },
    { re: /\bA1\b|\bVip\s*mobile\b|\bVip\b/i, name: 'A1' },
    { re: /\bTelekom\b|mts\b|Telekom\s*Srbija/i, name: 'Telekom' },
    { re: /\bToplane\b|Beogradske\s+elektrane|\bBGE\b/i, name: 'Toplane' },
    { re: /\bGrejanje\b|daljinsko\s+grejanje/i, name: 'Grejanje' }
  ];

  const MONTH_NAMES = {
    januar: 1, jan: 1, january: 1,
    februar: 2, feb: 2, february: 2,
    mart: 3, mar: 3, march: 3,
    april: 4, apr: 4,
    maj: 5, may: 5,
    jun: 6, june: 6, juni: 6,
    jul: 7, july: 7, juli: 7,
    avgust: 8, avg: 8, august: 8, aug: 8,
    septembar: 9, sep: 9, sept: 9, september: 9,
    oktobar: 10, okt: 10, october: 10, oct: 10,
    novembar: 11, nov: 11, november: 11,
    decembar: 12, dec: 12, december: 12
  };

  function toPeriod(month, year) {
    const m = Number(month);
    const y = Number(year);
    if (!m || m < 1 || m > 12 || !y || y < 2000 || y > 2100) return null;
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  function extractPeriod(text) {
    const labeled =
      text.match(/(?:period|obra[cč]un(?:ski)?\s*period|za\s+mesec|mesec(?:ni)?\s*obra[cč]un|za\s+period)[:\s]*(\d{1,2})[./\-](\d{4})/i)
      || text.match(/(?:period|obra[cč]un|za\s+mesec)[:\s]*(\d{1,2})\s*[./\-]\s*(\d{4})/i);
    if (labeled) {
      const p = toPeriod(labeled[1], labeled[2]);
      if (p) return p;
    }

    const named = text.match(
      /\b(januar|februar|mart|april|maj|jun|jul|avgust|septembar|oktobar|novembar|decembar|jan|feb|mar|apr|jun|jul|avg|sep|sept|okt|nov|dec)\w*\s+(\d{4})\b/i
    );
    if (named) {
      const key = named[1].toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
      const monthNum = MONTH_NAMES[key] || MONTH_NAMES[key.slice(0, 3)];
      const p = toPeriod(monthNum, named[2]);
      if (p) return p;
    }

    // MM/YYYY or MM-YYYY — avoid matching the month/year slice of DD.MM.YYYY
    const my = text.match(/(?<!\d[./\-])\b(0?[1-9]|1[0-2])[./\-](20\d{2})\b/);
    if (my) {
      const p = toPeriod(my[1], my[2]);
      if (p) return p;
    }

    // Date range 01.07.2026 - 31.07.2026 → use month of start
    const range = text.match(
      /(\d{1,2})[./\-](\d{1,2})[./\-](20\d{2})\s*[-–—do]+\s*(\d{1,2})[./\-](\d{1,2})[./\-](20\d{2})/i
    );
    if (range) {
      const p = toPeriod(range[2], range[3]);
      if (p) return p;
    }

    return null;
  }

  function extractDueDate(text) {
    const dueMatch = text.match(
      /(?:rok(?:\s+pla[cć]anja)?|dospe[cć]e|platiti\s+do|uplatiti\s+do|valuta)[:\s]*(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/i
    ) || text.match(
      /(?:do|rok)\s+(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/i
    );
    if (!dueMatch) return null;
    let [, d, mo, y] = dueMatch;
    if (y.length === 2) y = `20${y}`;
    const day = Number(d);
    const month = Number(mo);
    const year = Number(y);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

    const result = { rawText: raw, confidence: 0.12, needsReview: true };
    const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);

    const amountHit = extractAmount(raw, lines);
    if (amountHit) {
      result.amount = amountHit.amount;
      result.confidence = Math.max(result.confidence, amountHit.score);
    }

    for (const hint of MERCHANT_HINTS) {
      if (hint.re.test(raw)) {
        result.merchant = hint.name;
        result.confidence = Math.max(result.confidence || 0, amountHit ? 0.55 : 0.38);
        break;
      }
    }

    const period = extractPeriod(raw);
    if (period) {
      result.period = period;
      result.confidence = Math.min(0.95, (result.confidence || 0) + 0.08);
    }

    const dueDate = extractDueDate(raw);
    if (dueDate) {
      result.dueDate = dueDate;
      result.confidence = Math.min(0.95, (result.confidence || 0) + 0.05);
    }

    // Always confirm in UI
    result.needsReview = true;
    return result;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-bill-ocr="tesseract"]`);
      if (existing && window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.billOcr = 'tesseract';
      script.onload = () => {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error('Tesseract nije dostupan'));
      };
      script.onerror = () => reject(new Error('Neuspelo učitavanje Tesseract CDN'));
      document.head.appendChild(script);
    });
  }

  function getTesseract() {
    if (tesseractFailed) return Promise.reject(new Error('OCR nedostupan'));
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (!tesseractPromise) {
      tesseractPromise = loadScript(TESSERACT_CDN).catch(err => {
        tesseractFailed = true;
        tesseractPromise = null;
        throw err;
      });
    }
    return tesseractPromise;
  }

  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('OCR timeout')), ms);
      promise.then(
        v => { clearTimeout(t); resolve(v); },
        e => { clearTimeout(t); reject(e); }
      );
    });
  }

  /**
   * Run Tesseract on image (eng — brojevi + latin brendovi na računima).
   * @param {File|Blob} file
   * @returns {Promise<string>}
   */
  async function runTesseractOcr(file) {
    const Tesseract = await getTesseract();
    const result = await withTimeout(
      Tesseract.recognize(file, 'eng', {
        logger: () => {}
      }),
      OCR_TIMEOUT_MS
    );
    return (result?.data?.text || '').trim();
  }

  /**
   * @param {File|Blob} file
   * @param {{ rawText?: string, skipOcr?: boolean }} [options]
   * @returns {Promise<ScanResult>}
   */
  async function parseBillImage(file, options = {}) {
    const base = emptyScan();

    if (options.rawText) {
      return emptyScan({ ...extractFromText(options.rawText), needsReview: true });
    }

    // Optional live OCR (lazy CDN). Fail soft → empty fields + needsReview.
    if (file && !options.skipOcr && typeof document !== 'undefined') {
      try {
        const ocrText = await runTesseractOcr(file);
        if (ocrText) {
          const extracted = extractFromText(ocrText);
          const conf = typeof extracted.confidence === 'number' ? extracted.confidence : 0.2;
          return emptyScan({
            ...extracted,
            confidence: Math.min(0.88, conf),
            needsReview: true
          });
        }
      } catch (err) {
        console.warn('[LocalBillParser] OCR skip:', err?.message || err);
      }
    }

    // Filename hints (e.g. eps-jul-2026.jpg)
    if (file && file.name) {
      const nameHints = extractFromText(file.name.replace(/[_\-.]/g, ' '));
      if (nameHints.amount != null || nameHints.merchant || nameHints.period) {
        return emptyScan({
          ...nameHints,
          confidence: Math.min(nameHints.confidence || 0.2, 0.28),
          needsReview: true
        });
      }
    }

    return {
      ...base,
      confidence: 0,
      rawText: '',
      needsReview: true
    };
  }

  return {
    id,
    parseBillImage,
    extractFromText,
    emptyScan,
    parseAmountToken
  };
})();
