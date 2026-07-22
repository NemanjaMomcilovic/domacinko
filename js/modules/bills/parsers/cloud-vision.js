/**
 * Domaćinko — cloud OCR parser (placeholder for later)
 *
 * Implement same interface as local-ocr.js:
 *   { id: 'cloud', parseBillImage(file, options?) → Promise<ScanResult> }
 *
 * Then:
 *  1. Uncomment registration in bill-parser-registry.js PARSER_MAP
 *  2. Load this script on utility-bills.html (after local-ocr or instead)
 *  3. saveSettings({ billParser: 'cloud' })
 *
 * ScanResult stays identical — UI confirm screen does not change.
 */

// const CloudBillParser = {
//   id: 'cloud',
//   async parseBillImage(file, options = {}) {
//     // POST image to vision API → map response to ScanResult
//     return {
//       amount: null,
//       currency: 'RSD',
//       period: null,
//       dueDate: null,
//       merchant: null,
//       confidence: 0,
//       rawText: '',
//       needsReview: true
//     };
//   }
// };
