/**
 * Domaćinko — Komunalije (utility bills) page
 * Views: list | template form | entry capture/confirm
 */

(function () {
  const state = {
    view: 'list',
    templateType: 'struja',
    templateRecurrence: 'ask',
    editingTemplateId: null,
    entryTemplateId: null,
    entryId: null,
    photoDataUrl: null,
    previewDataUrl: null,
    scanMeta: null,
    pendingScan: null
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showView(name) {
    state.view = name;
    document.querySelectorAll('.bills-view').forEach(el => {
      el.classList.toggle('bills-view--active', el.id === `view-${name}`);
    });
  }

  function recurrenceLabel(id) {
    const r = (typeof BILL_RECURRENCE !== 'undefined' ? BILL_RECURRENCE : [])
      .find(x => x.id === id);
    return r ? r.label : id;
  }

  function statusMeta(status) {
    if (typeof BILL_STATUS !== 'undefined' && BILL_STATUS[status]) return BILL_STATUS[status];
    return { label: status, badge: '' };
  }

  function refreshList() {
    const period = getCurrentBillPeriod();
    ensureAutoUtilityBillsForPeriod(period);

    $('bills-period-label').textContent = formatBillPeriod(period);

    const templates = getAllUtilityTemplates();
    const entries = getUtilityEntries({ period });
    const paid = entries.filter(e => e.status === 'paid').length;
    const unpaid = entries.filter(e => e.status === 'unpaid' || e.status === 'pending').length;

    if (!templates.length) {
      $('bills-month-summary').textContent = 'Dodajte tipove računa (struja, voda…)';
    } else {
      $('bills-month-summary').textContent = unpaid
        ? `${unpaid} čeka · ${paid} plaćeno`
        : (paid ? `Sve plaćeno (${paid}) 👍` : 'Nema unosa ovog meseca');
    }

    const monthList = $('bills-month-list');
    if (!templates.filter(t => t.enabled !== false).length) {
      monthList.innerHTML = typeof renderEmptyState === 'function'
        ? renderEmptyState('📄', 'Još nema komunalija', 'Dodajte struju, vodu ili drugi račun.')
        : '<p class="text-muted text-center p-md">Nema komunalija</p>';
    } else {
      monthList.innerHTML = templates
        .filter(t => t.enabled !== false)
        .map(t => {
          const type = getBillType(t.type);
          const label = getBillTypeLabel(t.type, t.label);
          const entry = entries.find(e => e.templateId === t.id && e.status !== 'skipped')
            || entries.find(e => e.templateId === t.id);
          const st = entry ? statusMeta(entry.status) : statusMeta('pending');
          const amountText = entry?.amount
            ? formatCurrency(entry.amount)
            : (t.lastAmount ? `poslednji ${formatCurrency(t.lastAmount)}` : 'bez iznosa');
          const badgeClass = st.badge || 'badge--warning';
          const statusText = entry ? st.label : 'Nije uneto';

          return `
            <div class="list-item" data-template-id="${t.id}" data-entry-id="${entry?.id || ''}">
              <span class="list-item__icon">${type.icon}</span>
              <div class="list-item__content">
                <div class="list-item__title">${escapeHtml(label)}</div>
                <div class="list-item__subtitle">${escapeHtml(amountText)} · ${escapeHtml(statusText)}</div>
              </div>
              <span class="badge ${badgeClass}">${escapeHtml(statusText)}</span>
            </div>
          `;
        }).join('');

      monthList.querySelectorAll('.list-item').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          openEntry(row.dataset.templateId, row.dataset.entryId || null);
        });
      });
    }

    const tplList = $('bills-templates-list');
    if (!templates.length) {
      tplList.innerHTML = '<p class="text-muted text-center p-md" style="font-size:var(--font-size-sm)">Nema sačuvanih tipova</p>';
    } else {
      tplList.innerHTML = templates.map(t => {
        const type = getBillType(t.type);
        const label = getBillTypeLabel(t.type, t.label);
        return `
          <div class="list-item">
            <span class="list-item__icon">${type.icon}</span>
            <div class="list-item__content">
              <div class="list-item__title">${escapeHtml(label)}</div>
              <div class="list-item__subtitle">${escapeHtml(recurrenceLabel(t.recurrence))}${t.enabled === false ? ' · isključeno' : ''}</div>
            </div>
            <div class="list-item__actions">
              <button type="button" class="btn btn--ghost btn--sm" data-edit-tpl="${t.id}" aria-label="Izmeni">✏️</button>
              <button type="button" class="btn btn--ghost btn--sm" data-del-tpl="${t.id}" aria-label="Obriši">🗑️</button>
            </div>
          </div>
        `;
      }).join('');

      tplList.querySelectorAll('[data-edit-tpl]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          openTemplateForm(btn.getAttribute('data-edit-tpl'));
        });
      });
      tplList.querySelectorAll('[data-del-tpl]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const id = btn.getAttribute('data-del-tpl');
          if (confirm('Obrisati ovaj tip komunalije?')) {
            deleteUtilityTemplate(id);
            showToast?.('Obrisano', 'success');
            refreshList();
          }
        });
      });
    }
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openTemplateForm(templateId = null) {
    state.editingTemplateId = templateId;
    state.templateType = 'struja';
    state.templateRecurrence = 'ask';
    $('template-label').value = '';

    if (templateId) {
      const t = getAllUtilityTemplates().find(x => x.id === templateId);
      if (t) {
        state.templateType = t.type;
        state.templateRecurrence = t.recurrence || 'ask';
        $('template-label').value = t.label || '';
      }
    }

    renderTypeGrid();
    renderRecurrence();
    showView('template');
  }

  function renderTypeGrid() {
    const grid = $('template-type-grid');
    grid.innerHTML = BILL_TYPES.map(t => `
      <button type="button" class="bills-type-btn${state.templateType === t.id ? ' bills-type-btn--active' : ''}" data-type="${t.id}">
        <span class="bills-type-btn__icon">${t.icon}</span>
        <span class="bills-type-btn__label">${t.label}</span>
      </button>
    `).join('');
    grid.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.templateType = btn.getAttribute('data-type');
        renderTypeGrid();
      });
    });
  }

  function renderRecurrence() {
    const box = $('template-recurrence');
    box.innerHTML = BILL_RECURRENCE.map(r => `
      <label class="bills-recurrence__option${state.templateRecurrence === r.id ? ' bills-recurrence__option--active' : ''}">
        <input type="radio" name="bill-recurrence" value="${r.id}" ${state.templateRecurrence === r.id ? 'checked' : ''}>
        <span>
          <strong>${r.label}</strong>
          <br><span class="text-muted" style="font-size:var(--font-size-xs)">${r.desc}</span>
        </span>
      </label>
    `).join('');
    box.querySelectorAll('input[name="bill-recurrence"]').forEach(input => {
      input.addEventListener('change', () => {
        state.templateRecurrence = input.value;
        renderRecurrence();
      });
    });
  }

  function saveTemplate() {
    const payload = {
      type: state.templateType,
      label: $('template-label').value.trim(),
      recurrence: state.templateRecurrence || 'ask',
      enabled: true
    };
    if (state.editingTemplateId) {
      updateUtilityTemplate(state.editingTemplateId, payload);
      showToast?.('Ažurirano', 'success');
    } else {
      addUtilityTemplate(payload);
      showToast?.('Komunalija dodata', 'success');
    }
    showView('list');
    refreshList();
  }

  function openEntry(templateId, entryId = null) {
    const template = getAllUtilityTemplates().find(t => t.id === templateId);
    if (!template) return;

    state.entryTemplateId = templateId;
    state.entryId = entryId;
    state.photoDataUrl = null;
    state.previewDataUrl = null;
    state.scanMeta = null;
    state.pendingScan = null;

    const label = getBillTypeLabel(template.type, template.label);
    $('entry-heading').textContent = `Račun: ${label}`;

    const period = getCurrentBillPeriod();
    let entry = entryId ? getUtilityEntries().find(e => e.id === entryId) : null;
    if (!entry) {
      entry = getUtilityEntries({ period, templateId }).find(e => e.status !== 'skipped') || null;
      state.entryId = entry?.id || null;
    }

    $('entry-period').value = entry?.period || period;
    $('entry-amount').value = entry?.amount || template.lastAmount || '';
    $('entry-due').value = entry?.dueDate || '';
    state.photoDataUrl = entry?.photoDataUrl || null;
    state.previewDataUrl = entry?.photoDataUrl || null;
    renderPhotoPreview();
    clearScanMeta();
    setScanHint('Uvek potvrdite iznos pre čuvanja — OCR ne čuva automatski.');

    showView('entry');
  }

  function renderPhotoPreview() {
    const box = $('bill-photo-preview');
    const src = state.previewDataUrl || state.photoDataUrl;
    if (src) {
      box.classList.remove('hidden');
      box.innerHTML = `<img src="${src}" alt="Pregled fotografije računa">`;
    } else {
      box.classList.add('hidden');
      box.innerHTML = '';
    }
  }

  function setScanHint(text, tone) {
    const el = $('bill-scan-hint');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('bills-scan-hint--warn', 'bills-scan-hint--ok');
    if (tone === 'warn') el.classList.add('bills-scan-hint--warn');
    if (tone === 'ok') el.classList.add('bills-scan-hint--ok');
  }

  function clearScanMeta() {
    const meta = $('bill-scan-meta');
    if (!meta) return;
    meta.classList.add('hidden');
    meta.innerHTML = '';
  }

  function renderScanMeta(scan) {
    const meta = $('bill-scan-meta');
    if (!meta) return;
    const chips = [];
    if (scan.merchant) chips.push(`Izdavalac: ${escapeHtml(scan.merchant)}`);
    if (scan.period && typeof formatBillPeriod === 'function') {
      chips.push(`Period: ${escapeHtml(formatBillPeriod(scan.period))}`);
    }
    if (scan.needsReview !== false) chips.push('Potrebna provera');
    if (!chips.length) {
      clearScanMeta();
      return;
    }
    meta.classList.remove('hidden');
    meta.innerHTML = chips.map(c => `<span class="bills-scan-chip">${c}</span>`).join('');
  }

  function formatAmountSr(n) {
    return Number(n).toLocaleString('sr-RS');
  }

  function confidenceLabelSr(confidence) {
    const pct = Math.round((confidence || 0) * 100);
    if (pct >= 65) return { pct, tone: 'ok', phrase: 'srednja pouzdanost' };
    if (pct >= 35) return { pct, tone: 'warn', phrase: 'niska pouzdanost — proverite' };
    return { pct, tone: 'warn', phrase: 'veoma niska pouzdanost — unesite ručno ako treba' };
  }

  async function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast?.('Izaberite sliku računa.');
      return;
    }
    setScanHint('Čitanje računa… (može potrajati nekoliko sekundi)', 'warn');
    clearScanMeta();
    try {
      const { scan, photoDataUrl, previewDataUrl, parserId } = await captureBillFromImage(file);
      state.pendingScan = scan;
      state.photoDataUrl = photoDataUrl;
      state.previewDataUrl = previewDataUrl || photoDataUrl;
      state.scanMeta = {
        confidence: scan.confidence,
        merchant: scan.merchant,
        parser: parserId,
        needsReview: scan.needsReview !== false
      };

      if (scan.amount) $('entry-amount').value = scan.amount;
      if (scan.period) $('entry-period').value = scan.period;
      if (scan.dueDate) $('entry-due').value = scan.dueDate;

      renderPhotoPreview();
      renderScanMeta(scan);

      const conf = confidenceLabelSr(scan.confidence);
      if (scan.amount) {
        const merchantBit = scan.merchant ? ` · ${scan.merchant}` : '';
        setScanHint(
          `Predloženo ${formatAmountSr(scan.amount)} RSD${merchantBit} (${conf.pct}% — ${conf.phrase}). Potvrdite pre čuvanja.`,
          conf.tone
        );
        showToast?.('Proverite predloženi iznos', 'info');
      } else if (scan.merchant || scan.period) {
        setScanHint(
          `Delimično pročitano${scan.merchant ? ` (${scan.merchant})` : ''}. Unesite iznos i potvrdite — OCR nije siguran.`,
          'warn'
        );
        showToast?.('Potrebna provera', 'info');
      } else {
        setScanHint(
          photoDataUrl
            ? 'Nismo pouzdano pročitali iznos. Unesite ga ručno i potvrdite — fotografija je spremna.'
            : 'Unesite iznos ručno i potvrdite (fotografija nije sačuvana zbog veličine).',
          'warn'
        );
        showToast?.('Unesite iznos i potvrdite', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast?.('Greška pri obradi slike', 'error');
      setScanHint('Greška pri čitanju. Unesite iznos ručno.', 'warn');
    }
  }

  function parseAmount() {
    const raw = $('entry-amount').value;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function saveEntry(status) {
    const template = getAllUtilityTemplates().find(t => t.id === state.entryTemplateId);
    if (!template) return;

    const amount = parseAmount();
    if (status !== 'skipped' && status !== 'pending' && !amount) {
      showToast?.('Unesite iznos računa');
      $('entry-amount').focus();
      return;
    }

    const period = $('entry-period').value || getCurrentBillPeriod();
    const dueDate = $('entry-due').value || null;
    const payload = {
      templateId: template.id,
      type: template.type,
      period,
      amount: amount,
      status,
      dueDate,
      photoDataUrl: state.photoDataUrl || null,
      scannedAt: state.pendingScan ? new Date().toISOString() : null,
      paidAt: status === 'paid' ? new Date().toISOString() : null,
      scanMeta: state.scanMeta
    };

    if (state.entryId) {
      updateUtilityEntry(state.entryId, payload);
    } else {
      addUtilityEntry(payload);
    }

    if (status === 'paid' && amount) {
      try {
        addExpense({
          name: getBillTypeLabel(template.type, template.label),
          amount,
          category: 'bills',
          date: new Date().toISOString().split('T')[0],
          note: `Komunalije · ${formatBillPeriod(period)}`
        });
      } catch { /* non-fatal */ }
    }

    const msg = status === 'paid' ? 'Označeno kao plaćeno'
      : status === 'skipped' ? 'Preskočeno ovaj mesec'
      : 'Sačuvano kao neplaćeno';
    showToast?.(msg, 'success');
    showView('list');
    refreshList();
  }

  function applyDeepLink() {
    const params = new URLSearchParams(location.search);
    const templateId = params.get('template');
    const entryId = params.get('entry');
    const action = params.get('action');
    if (action === 'add') {
      openTemplateForm();
      return;
    }
    if (templateId) {
      openEntry(templateId, entryId);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await waitForAuth?.();
    initNavigation('finances', { title: 'Komunalije' });

    $('btn-add-template').addEventListener('click', () => openTemplateForm());
    $('btn-add-template-main').addEventListener('click', () => openTemplateForm());
    $('btn-template-cancel').addEventListener('click', () => {
      showView('list');
      refreshList();
    });
    $('btn-template-save').addEventListener('click', saveTemplate);

    $('btn-entry-cancel').addEventListener('click', () => {
      showView('list');
      refreshList();
    });
    $('btn-entry-skip').addEventListener('click', () => saveEntry('skipped'));
    $('btn-entry-unpaid').addEventListener('click', () => saveEntry('unpaid'));
    $('btn-entry-paid').addEventListener('click', () => saveEntry('paid'));

    $('btn-camera').addEventListener('click', () => $('bill-camera').click());
    $('btn-gallery').addEventListener('click', () => $('bill-gallery').click());
    $('bill-camera').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleImageFile(file);
      e.target.value = '';
    });
    $('bill-gallery').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleImageFile(file);
      e.target.value = '';
    });

    refreshList();
    applyDeepLink();
  });
})();
