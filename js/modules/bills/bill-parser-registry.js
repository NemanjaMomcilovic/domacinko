/**
 * Domaćinko — registry OCR parsera za komunalije
 *
 * Swap OCR later:
 *  1. Add js/modules/bills/parsers/cloud-vision.js with same API:
 *       { id: 'cloud', parseBillImage(file, options?) → Promise<ScanResult> }
 *  2. Register it in PARSER_MAP below
 *  3. Set settings.billParser = 'cloud' (or UI toggle)
 *  UI + bill-scanner.js stay unchanged.
 */

const BillParserRegistry = (() => {
  const PARSER_MAP = {
    local: typeof LocalBillParser !== 'undefined' ? LocalBillParser : null
    // cloud: typeof CloudBillParser !== 'undefined' ? CloudBillParser : null
  };

  function getPreferredParserId() {
    try {
      if (typeof getSettings === 'function') {
        const id = getSettings().billParser;
        if (id && PARSER_MAP[id]) return id;
      }
    } catch { /* ignore */ }
    return 'local';
  }

  function getActiveParser() {
    const id = getPreferredParserId();
    const parser = PARSER_MAP[id] || PARSER_MAP.local;
    if (!parser) {
      return {
        id: 'noop',
        parseBillImage: async () => ({
          amount: null,
          currency: 'RSD',
          period: typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : null,
          dueDate: null,
          merchant: null,
          confidence: 0,
          rawText: '',
          needsReview: true
        })
      };
    }
    return parser;
  }

  function listParsers() {
    return Object.keys(PARSER_MAP).filter(k => PARSER_MAP[k]);
  }

  return { getActiveParser, getPreferredParserId, listParsers, PARSER_MAP };
})();
