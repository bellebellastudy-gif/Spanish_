import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CefrLevel } from '../../types';
import { askTutor } from '../../lib/api';
import { MarkdownLite } from '../MarkdownLite';

const PROMPTS = [
  '¿Cuándo uso "ser" vs "estar"?',
  'What is the difference between "por" and "para"?',
  'How does the subjunctive work in everyday speech?',
];

interface TutorViewProps {
  level: CefrLevel;
}

export function TutorView({ level }: TutorViewProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(prompt: string) {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askTutor(prompt, 'General Spanish inquiry from the tutor dashboard', level);
      setAnswer(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong reaching the tutor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-clay-deep">
        Ask the Tutor &middot; Nivel {level}
      </p>
      <h1 className="mb-3 font-display text-4xl text-ink">Any grammar question, answered clearly.</h1>
      <p className="mb-8 font-sans text-[15px] leading-relaxed text-ink-soft">
        Ask about a rule, a word, or something confusing you ran into. Answers include when to
        use it, why it works, and real conversational examples.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="mb-4 flex items-start gap-3 rounded-2xl border border-ink/10 bg-paper-deep/50 p-3 shadow-sm focus-within:border-clay/40"
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Why is it 'me gusta' and not 'yo gusto'?"
          rows={2}
          className="min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 font-sans text-[15px] text-ink placeholder:text-ink-soft/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex h-10 shrink-0 items-center gap-2 self-end rounded-xl bg-clay-deep px-4 font-sans text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Ask
        </button>
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuestion(p);
              submit(p);
            }}
            className="rounded-full border border-ink/10 px-3 py-1.5 font-sans text-xs text-ink-soft transition-colors hover:border-clay/40 hover:text-clay-deep"
          >
            {p}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 rounded-2xl border border-ink/10 bg-paper-deep/40 p-6"
          >
            <div className="h-4 w-2/3 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-full animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-ink/10" />
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-brick/30 bg-brick/5 p-5 font-sans text-sm text-brick"
          >
            {error}
          </motion.div>
        )}

        {answer && !loading && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-ink/10 bg-paper-deep/40 p-6"
          >
            <MarkdownLite text={answer} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
