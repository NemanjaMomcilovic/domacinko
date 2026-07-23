/**
 * Ollama provider — lokalni open-source modeli (npr. Qwen2.5, Llama).
 * API: http://127.0.0.1:11434/api/chat (NDJSON stream)
 */

const OLLAMA_DEFAULT_HOST = 'http://127.0.0.1:11434';
const OLLAMA_DEFAULT_MODEL = 'qwen2.5:7b';

function normalizeOllamaHost(host) {
  let h = (host || OLLAMA_DEFAULT_HOST).trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(h)) h = `http://${h}`;
  return h;
}

function getOllamaConfig(settings) {
  const s = settings || getSettings();
  return {
    host: normalizeOllamaHost(s.ollamaHost || OLLAMA_DEFAULT_HOST),
    model: (s.ollamaModel || OLLAMA_DEFAULT_MODEL).trim() || OLLAMA_DEFAULT_MODEL
  };
}

function parseOllamaError(error, response) {
  if (response?.status === 404) {
    return 'Model nije pronađen. Pokrenite: ollama pull qwen2.5:7b';
  }
  if (error?.name === 'TypeError' || error?.message?.includes('Failed to fetch')) {
    return 'Ollama nije dostupna. Pokrenite Ollama na ovom uređaju (vidi docs/ollama-setup.md).';
  }
  if (response && !response.ok) {
    return `Ollama greška (${response.status}). Proverite host i model.`;
  }
  return 'Ollama trenutno nedostupna. Koristim 10KEY Savetnik.';
}

/**
 * Ping Ollama /api/tags — for settings "Test connection".
 * @returns {{ ok: boolean, message: string, models?: string[] }}
 */
async function pingOllama(host) {
  const base = normalizeOllamaHost(host || getOllamaConfig().host);
  try {
    const response = await fetch(`${base}/api/tags`, { method: 'GET' });
    if (!response.ok) {
      return { ok: false, message: `Ollama odgovorila sa ${response.status}.` };
    }
    const data = await response.json();
    const models = (data.models || []).map(m => m.name).filter(Boolean);
    if (!models.length) {
      return {
        ok: true,
        message: 'Ollama radi, ali nema modela. Pokrenite: ollama pull qwen2.5:7b',
        models: []
      };
    }
    return {
      ok: true,
      message: `Povezano. Modeli: ${models.slice(0, 5).join(', ')}${models.length > 5 ? '…' : ''}`,
      models
    };
  } catch (err) {
    return {
      ok: false,
      message: parseOllamaError(err)
    };
  }
}

/**
 * Stream chat via Ollama /api/chat (NDJSON).
 */
async function streamOllamaChat(message, onToken, settings) {
  const { host, model } = getOllamaConfig(settings);
  const messages = typeof buildLLMMessages === 'function'
    ? buildLLMMessages(message, 6)
    : [{ role: 'user', content: message }];

  let response;
  try {
    response = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      })
    });
  } catch (err) {
    const e = new Error('network');
    e.userMessage = parseOllamaError(err);
    throw e;
  }

  if (!response.ok) {
    const e = new Error('api');
    e.userMessage = parseOllamaError(null, response);
    throw e;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        const token = parsed.message?.content;
        if (token) {
          fullText += token;
          if (onToken) onToken(fullText);
        }
      } catch { /* skip malformed NDJSON line */ }
    }
  }

  // Flush leftover buffer
  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim());
      const token = parsed.message?.content;
      if (token) {
        fullText += token;
        if (onToken) onToken(fullText);
      }
    } catch { /* ignore */ }
  }

  const trimmed = fullText.trim();
  if (trimmed) return trimmed;
  if (typeof getSmartResponse === 'function') return getSmartResponse(message);
  return 'Nema odgovora od Ollame.';
}

const OllamaProvider = {
  id: 'ollama',
  label: 'Ollama',
  supportsStream: true,
  chat: streamOllamaChat
};
