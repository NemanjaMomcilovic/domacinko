/**
 * OpenAI provider — GPT-4o streaming via user's API key.
 */

const OPENAI_MODEL = 'gpt-4o';
const OPENAI_DEFAULT_URL = 'https://api.openai.com/v1/chat/completions';

function hasOpenAIKey(settings) {
  const s = settings || getSettings();
  return Boolean(s.apiKey && s.apiKey.trim());
}

function getOpenAIModel() {
  return OPENAI_MODEL;
}

function parseOpenAIError(response, error) {
  if (!navigator.onLine) return 'Nema internet konekcije. Koristim 10KEY Savetnik.';
  if (response?.status === 401) return 'Neispravan OpenAI ključ. Proverite u Više → Napredno → Napredni režim.';
  if (response?.status === 429) return 'Previše zahteva. Sačekajte minut i pokušajte ponovo.';
  if (response?.status === 403) return 'OpenAI odbio zahtev — proverite kredit na nalogu.';
  if (error?.message?.includes('Failed to fetch')) return 'Mreža nedostupna. Koristim 10KEY Savetnik.';
  return 'OpenAI trenutno nedostupan. Koristim 10KEY Savetnik.';
}

async function streamOpenAIChat(message, onToken, settings) {
  const s = settings || getSettings();
  if (!hasOpenAIKey(s)) {
    const e = new Error('no-key');
    e.userMessage = 'Nema OpenAI ključa. Unesite ga u Više → Napredno ili izaberite drugi providera.';
    throw e;
  }

  const messages = typeof buildLLMMessages === 'function'
    ? buildLLMMessages(message, 6)
    : [{ role: 'user', content: message }];

  let response;
  try {
    response = await fetch(s.apiUrl || OPENAI_DEFAULT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${s.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: getOpenAIModel(),
        messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: true
      })
    });
  } catch (err) {
    const e = new Error('network');
    e.userMessage = parseOpenAIError(null, err);
    throw e;
  }

  if (!response.ok) {
    const e = new Error('api');
    e.userMessage = parseOpenAIError(response);
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
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) {
          fullText += token;
          if (onToken) onToken(fullText);
        }
      } catch { /* skip malformed chunk */ }
    }
  }

  const trimmed = fullText.trim();
  if (trimmed) return trimmed;
  if (typeof getSmartResponse === 'function') return getSmartResponse(message);
  return 'Nema odgovora od OpenAI.';
}

const OpenAIProvider = {
  id: 'openai',
  label: 'OpenAI (GPT-4o)',
  supportsStream: true,
  chat: streamOpenAIChat
};
