import { useState } from 'react';
import { CheckCircle2, Loader, PenLine, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CefrLevel, WritingAuditResult } from '../../types';
import { auditWriting } from '../../lib/api';

interface WritingViewProps {
  level: CefrLevel;
}

export function WritingView({ level }: WritingViewProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<WritingAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await auditWriting(text.trim(), level);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not audit this text right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-clay-deep">
        Writing Lab &middot; Nivel {level}
      </p>
      <h1 className="mb-3 font-display text-4xl text-ink">Write a few sentences. Get a real edit.</h1>
      <p className="mb-8 font-sans text-[15px] leading-relaxed text-ink-soft">
        Describe your day, a plan, an opinion — anything. You'll get specific corrections and
        more natural ways to say the same thing.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Ayer fui al mercado y compré unas frutas muy ricas…"
        className="mb-4 w-full resize-none rounded-2xl border border-ink/10 bg-paper-deep/50 p-4 font-sans text-[15px] leading-relaxed text-ink placeholder:text-ink-soft/50 shadow-sm focus:border-clay/40 focus:outline-none"
      />

      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="mb-8 flex items-center gap-2 rounded-xl bg-clay-deep px-5 py-2.5 font-sans text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {loading ? <Loader className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
        Audit my writing
      </button>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 rounded-2xl border border-ink/10 bg-paper-deep/40 p-6"
          >
            <div className="h-4 w-1/2 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-full animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-ink/10" />
          </motion.div>
        )}

        {error && (
          <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-sm text-brick">
            {error}
          </motion.p>
        )}

        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div
              className={`flex items-center gap-2.5 rounded-2xl border p-4 font-sans text-sm ${
                result.isCorrect ? 'border-sage/30 bg-sage/10 text-sage' : 'border-gold/40 bg-gold/10 text-gold'
              }`}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {result.explanation}
            </div>

            {result.corrections.length > 0 && (
              <div>
                <h3 className="mb-3 font-display text-lg text-ink">Corrections</h3>
                <div className="space-y-3">
                  {result.corrections.map((c, i) => (
                    <div key={i} className="rounded-xl border border-ink/10 bg-paper-deep/40 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2 font-sans text-sm">
                        <span className="rounded bg-brick/10 px-2 py-0.5 text-brick line-through">{c.original}</span>
                        <span className="text-ink-soft">&rarr;</span>
                        <span className="rounded bg-sage/10 px-2 py-0.5 font-medium text-sage">{c.corrected}</span>
                      </div>
                      <p className="font-sans text-sm leading-relaxed text-ink-soft">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.alternatives.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-ink">
                  <Sparkles className="h-4 w-4 text-clay-deep" /> More natural alternatives
                </h3>
                <div className="space-y-2">
                  {result.alternatives.map((alt, i) => (
                    <p key={i} className="rounded-xl border border-ink/10 bg-paper-deep/30 p-3 font-sans text-[15px] italic text-ink">
                      "{alt}"
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
