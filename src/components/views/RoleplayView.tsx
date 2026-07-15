import { useState } from 'react';
import { ArrowLeft, Loader, Send, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CefrLevel, ConversationMessage, RoleplayScenario } from '../../types';
import { SCENARIOS } from '../../lib/scenarios';
import { converse } from '../../lib/api';

interface RoleplayViewProps {
  level: CefrLevel;
}

export function RoleplayView({ level }: RoleplayViewProps) {
  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shownTranslations, setShownTranslations] = useState<Set<number>>(new Set());

  function pickScenario(s: RoleplayScenario) {
    setScenario(s);
    setMessages([{ role: 'ai', text: s.opener }]);
    setError(null);
  }

  function exitScenario() {
    setScenario(null);
    setMessages([]);
    setDraft('');
    setShownTranslations(new Set());
  }

  async function send() {
    if (!scenario || !draft.trim() || loading) return;
    const next = [...messages, { role: 'user' as const, text: draft.trim() }];
    setMessages(next);
    setDraft('');
    setLoading(true);
    setError(null);
    try {
      const res = await converse(next, scenario, level);
      setMessages([...next, { role: 'ai', text: res.text, translation: res.translation, feedback: res.feedback }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The conversation partner is unavailable right now.');
    } finally {
      setLoading(false);
    }
  }

  function toggleTranslation(i: number) {
    setShownTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (!scenario) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-clay-deep">
          Roleplay &middot; Nivel {level}
        </p>
        <h1 className="mb-3 font-display text-4xl text-ink">Pick a scene to step into.</h1>
        <p className="mb-8 max-w-lg font-sans text-[15px] leading-relaxed text-ink-soft">
          Each partner stays in character and gently corrects your Spanish as you go.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => pickScenario(s)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-ink/10 bg-paper-deep/50 p-5 text-left shadow-sm transition-shadow hover:shadow-lg"
            >
              <h2 className="mb-1.5 font-display text-xl text-ink">{s.title}</h2>
              <p className="font-sans text-sm leading-relaxed text-ink-soft">{s.context}</p>
              <p className="mt-3 font-sans text-xs font-semibold uppercase tracking-wide text-clay-deep">
                You play: {s.userRole}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <button
        onClick={exitScenario}
        className="mb-4 flex items-center gap-1.5 self-start font-sans text-sm text-ink-soft transition-colors hover:text-clay-deep"
      >
        <ArrowLeft className="h-4 w-4" /> Choose a different scene
      </button>

      <div className="mb-4 rounded-xl border border-ink/10 bg-paper-deep/40 px-4 py-3">
        <h2 className="font-display text-lg text-ink">{scenario.title}</h2>
        <p className="font-sans text-xs text-ink-soft">You play: {scenario.userRole}</p>
      </div>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink/10 bg-paper-deep/20 p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
              <div
                className={`rounded-2xl px-4 py-2.5 font-sans text-[15px] leading-relaxed ${
                  m.role === 'user' ? 'bg-clay-deep text-paper' : 'bg-paper border border-ink/10 text-ink'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'ai' && m.translation && (
                <button
                  onClick={() => toggleTranslation(i)}
                  className="flex items-center gap-1 font-sans text-xs text-ink-soft/70 hover:text-clay-deep"
                >
                  <Languages className="h-3 w-3" />
                  {shownTranslations.has(i) ? m.translation : 'Show translation'}
                </button>
              )}
              {m.role === 'ai' && m.feedback && (
                <p className="max-w-full rounded-lg bg-sage/10 px-3 py-2 font-sans text-xs leading-relaxed text-sage">
                  {m.feedback}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-paper px-4 py-2.5 text-ink-soft">
              <Loader className="h-3.5 w-3.5 animate-spin" />
              <span className="font-sans text-sm">typing…</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 font-sans text-sm text-brick"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-paper-deep/50 p-2 shadow-sm focus-within:border-clay/40"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Responde en español…"
          className="flex-1 bg-transparent px-3 py-2 font-sans text-[15px] text-ink placeholder:text-ink-soft/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-deep text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
