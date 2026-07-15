import { useEffect, useRef, useState } from 'react';
import { Loader, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { CefrLevel } from '../../types';
import { synthesizeSpeech, pcmBase64ToWavUrl } from '../../lib/api';

interface PronunciationViewProps {
  level: CefrLevel;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const QUICK_PHRASES = [
  'Buenos días, ¿cómo estás?',
  'Me gustaría una mesa para dos, por favor.',
  '¿Podrías repetir eso más despacio?',
  'No estoy de acuerdo, pero entiendo tu punto.',
];

export function PronunciationView({ level }: PronunciationViewProps) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(VOICES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function speak(phrase: string) {
    if (!phrase.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await synthesizeSpeech(phrase.trim(), voice);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = pcmBase64ToWavUrl(res.audio);
      objectUrlRef.current = url;
      setAudioUrl(url);
      requestAnimationFrame(() => audioRef.current?.play());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate audio right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-clay-deep">
        Pronunciation &middot; Nivel {level}
      </p>
      <h1 className="mb-3 font-display text-4xl text-ink">Hear it, said naturally.</h1>
      <p className="mb-8 font-sans text-[15px] leading-relaxed text-ink-soft">
        Type any word or phrase and listen to how it actually sounds in conversation.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          speak(text);
        }}
        className="mb-4 flex items-center gap-2 rounded-2xl border border-ink/10 bg-paper-deep/50 p-2 shadow-sm focus-within:border-clay/40"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una frase en español…"
          className="flex-1 bg-transparent px-3 py-2 font-sans text-[15px] text-ink placeholder:text-ink-soft/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="flex h-10 items-center gap-2 rounded-xl bg-clay-deep px-4 font-sans text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
          Speak
        </button>
      </form>

      <div className="mb-8 flex flex-wrap gap-1.5">
        {VOICES.map((v) => (
          <button
            key={v}
            onClick={() => setVoice(v)}
            className={`rounded-full border px-3 py-1 font-sans text-xs font-medium transition-colors ${
              v === voice ? 'border-clay bg-clay text-paper' : 'border-ink/15 text-ink-soft hover:border-clay/50'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="mb-8 space-y-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-soft/70">Try one</p>
        {QUICK_PHRASES.map((p) => (
          <button
            key={p}
            onClick={() => {
              setText(p);
              speak(p);
            }}
            className="block w-full rounded-xl border border-ink/10 bg-paper-deep/30 px-4 py-3 text-left font-sans text-[15px] text-ink transition-colors hover:border-clay/40"
          >
            {p}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 font-sans text-sm text-brick">{error}</p>}

      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-ink/10 bg-paper-deep/40 p-4"
        >
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
        </motion.div>
      )}
    </div>
  );
}
