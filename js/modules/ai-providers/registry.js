/**
 * AI provider registry — bira local | ollama | openai prema podešavanjima.
 * Fallback: uvek 10KEY lokalni intent engine ako LLM nije dostupan.
 */

const AI_PROVIDER_IDS = ['local', 'ollama', 'openai'];

function resolveAIProviderId(settings) {
  const s = settings || getSettings();
  let id = (s.aiProvider || 'local').toLowerCase();

  // Legacy: stari nalozi sa ključem, bez eksplicitnog aiProvider polja u raw storage
  // (merge već postavlja 'local' — migracija u getData)
  if (!AI_PROVIDER_IDS.includes(id)) id = 'local';

  if (id === 'openai' && typeof hasOpenAIKey === 'function' && !hasOpenAIKey(s)) {
    return 'local';
  }
  return id;
}

function getAIProviderStatus(settings) {
  const s = settings || getSettings();
  const id = resolveAIProviderId(s);

  if (id === 'ollama') {
    const cfg = typeof getOllamaConfig === 'function'
      ? getOllamaConfig(s)
      : { model: s.ollamaModel || 'qwen2.5:7b' };
    return {
      id: 'ollama',
      badgeClass: 'ai-status--ollama',
      html: `<span>🦙 <strong>Ollama</strong> · ${escapeProviderHtml(cfg.model)}</span>`,
      modeLabel: `Ollama (${cfg.model})`,
      supportsStream: true
    };
  }

  if (id === 'openai') {
    return {
      id: 'openai',
      badgeClass: 'ai-status--openai',
      html: `<span>✨ <strong>GPT-4o</strong> · Napredni režim</span>`,
      modeLabel: 'Napredni režim (GPT-4o)',
      supportsStream: true
    };
  }

  return {
    id: 'local',
    badgeClass: 'ai-status--local',
    html: `<span>🧠 <strong>10KEY Savetnik</strong> — besplatno, koristi vaše podatke, radi offline</span>`,
    modeLabel: '🧠 10KEY Savetnik — besplatno, radi odmah i offline',
    supportsStream: false
  };
}

function escapeProviderHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Chat with selected provider; on failure falls back to local rules.
 * @param {string} message
 * @param {(partial: string) => void} [onToken]
 * @returns {Promise<string>}
 */
async function chatWithAI(message, onToken) {
  const settings = getSettings();
  const id = resolveAIProviderId(settings);

  if (id === 'ollama' && typeof streamOllamaChat === 'function') {
    try {
      return await streamOllamaChat(message, onToken || (() => {}), settings);
    } catch (err) {
      const local = typeof getSmartResponse === 'function' ? getSmartResponse(message) : message;
      throw Object.assign(new Error('fallback'), {
        response: `${local}\n\n⚠️ ${err.userMessage || 'Ollama nedostupna. Koristim 10KEY Savetnik.'}`,
        userMessage: err.userMessage,
        provider: 'ollama'
      });
    }
  }

  if (id === 'openai' && typeof streamOpenAIChat === 'function') {
    try {
      return await streamOpenAIChat(message, onToken || (() => {}), settings);
    } catch (err) {
      const local = typeof getSmartResponse === 'function' ? getSmartResponse(message) : message;
      throw Object.assign(new Error('fallback'), {
        response: `${local}\n\n⚠️ ${err.userMessage || (typeof parseOpenAIError === 'function' ? parseOpenAIError() : 'OpenAI nedostupan.')}`,
        userMessage: err.userMessage,
        provider: 'openai'
      });
    }
  }

  if (typeof chatLocalRules === 'function') {
    return chatLocalRules(message);
  }
  return typeof getSmartResponse === 'function' ? getSmartResponse(message) : '';
}

/**
 * Whether the active provider should use streaming UI.
 */
function shouldStreamAI(settings) {
  const status = getAIProviderStatus(settings);
  return Boolean(status.supportsStream);
}
