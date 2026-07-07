function extractReceiptData(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = { store: '', amount: null, date: null };

  const storeLine = lines.find(l => l.length > 2 && l.length < 50 && !/^\d+[.,]\d{2}$/.test(l));
  if (storeLine) result.store = storeLine.replace(/[^a-zA-ZčćžšđČĆŽŠĐ0-9\s\-\.]/g, '').trim();

  const totalPatterns = [
    /(?:UKUPNO|TOTAL|SUMA|ZA\s*PLAĆANJE|ZA\s*PLACANJE|IZNOS)[:\s]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+)/i,
    /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:RSD|din|дин)/i
  ];

  for (const line of lines.reverse()) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        const raw = match[1].replace(/\./g, '').replace(',', '.');
        const val = parseFloat(raw);
        if (val > 0 && val < 10000000) {
          result.amount = Math.round(val);
          break;
        }
      }
    }
    if (result.amount) break;
  }

  if (!result.amount) {
    const amounts = text.match(/\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d{3,}/g);
    if (amounts) {
      const parsed = amounts
        .map(a => parseFloat(a.replace(/\./g, '').replace(',', '.')))
        .filter(n => n > 10 && n < 1000000);
      if (parsed.length) result.amount = Math.round(Math.max(...parsed));
    }
  }

  const datePatterns = [
    /(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/,
    /(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        let y, m, d;
        if (match[1].length === 4) {
          [, y, m, d] = match;
        } else {
          [, d, m, y] = match;
        }
        if (y.length === 2) y = '20' + y;
        const dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        if (!isNaN(Date.parse(dateStr))) {
          result.date = dateStr;
          break;
        }
      }
    }
    if (result.date) break;
  }

  if (!result.date) {
    result.date = new Date().toISOString().split('T')[0];
  }

  return result;
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('', { title: 'Skeniraj račun', showBack: true, backHref: 'home.html' });

  populateCategorySelect('ocr-category');
  document.getElementById('ocr-date').value = new Date().toISOString().split('T')[0];

  const preview = document.getElementById('receipt-preview');
  const fileInput = document.getElementById('receipt-file');
  const cameraInput = document.getElementById('receipt-camera');
  const ocrStatus = document.getElementById('ocr-status');
  const extractedForm = document.getElementById('extracted-form');
  let currentFile = null;

  async function processImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Molimo izaberite sliku.');
      return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Račun">`;
    };
    reader.readAsDataURL(file);

    ocrStatus.classList.remove('hidden');
    ocrStatus.innerHTML = `
      <div class="ocr-loading">
        <div class="ocr-loading__spinner"></div>
        <p>Čitam račun...</p>
      </div>
    `;
    extractedForm.classList.add('hidden');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'srp+eng', {
        logger: m => {
          if (m.status === 'recognizing text' && m.progress) {
            const pct = Math.round(m.progress * 100);
            ocrStatus.querySelector('p').textContent = `Čitam račun... ${pct}%`;
          }
        }
      });

      const extracted = extractReceiptData(text);
      ocrStatus.classList.add('hidden');
      extractedForm.classList.remove('hidden');

      document.getElementById('ocr-store').value = extracted.store || '';
      document.getElementById('ocr-amount').value = extracted.amount || '';
      document.getElementById('ocr-date').value = extracted.date || new Date().toISOString().split('T')[0];

      if (!extracted.amount) {
        showToast('Iznos nije prepoznat — unesite ručno.');
      } else {
        showToast('Račun pročitan! Proverite podatke.');
      }
    } catch {
      ocrStatus.classList.add('hidden');
      showToast('Greška pri čitanju računa. Pokušajte ponovo.');
    }
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) processImage(fileInput.files[0]);
  });

  cameraInput.addEventListener('change', () => {
    if (cameraInput.files[0]) processImage(cameraInput.files[0]);
  });

  document.getElementById('btn-upload').addEventListener('click', () => fileInput.click());
  document.getElementById('btn-camera').addEventListener('click', () => cameraInput.click());

  document.getElementById('btn-create-expense').addEventListener('click', () => {
    const name = document.getElementById('ocr-store').value.trim() || 'Račun';
    const amount = document.getElementById('ocr-amount').value;
    const date = document.getElementById('ocr-date').value;
    const category = document.getElementById('ocr-category').value;

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Unesite iznos troška.');
      return;
    }

    addExpense({ name, amount, category, date, note: 'Skeniran račun' });
    showToast('Trošak kreiran! 💚');
    setTimeout(() => { window.location.href = 'add-expense.html'; }, 1200);
  });
});
