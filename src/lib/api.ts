import type { CefrLevel, ConversationMessage, RoleplayScenario, WritingAuditResult } from '../types';

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export function askTutor(prompt: string, context: string, level: CefrLevel) {
  return postJSON<{ text: string }>('/api/gemini/tutor', { prompt, context, level });
}

export function converse(messages: ConversationMessage[], scenario: RoleplayScenario, level: CefrLevel) {
  return postJSON<{ text: string; translation: string; feedback: string }>('/api/gemini/converse', {
    messages: messages.map((m) => ({ role: m.role, text: m.text })),
    scenario,
    level,
  });
}

export function auditWriting(text: string, level: CefrLevel) {
  return postJSON<WritingAuditResult>('/api/gemini/audit-writing', { text, level });
}

export function synthesizeSpeech(text: string, voice?: string) {
  return postJSON<{ audio: string }>('/api/gemini/tts', { text, voice });
}

/**
 * Gemini's TTS response is raw 16-bit PCM (mono, 24kHz) with no container,
 * so it has to be wrapped in a WAV header before a browser <audio> element can play it.
 */
export function pcmBase64ToWavUrl(base64: string, sampleRate = 24000): string {
  const binary = atob(base64);
  const pcmBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    pcmBytes[i] = binary.charCodeAt(i);
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBytes.length;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmBytes);

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}
