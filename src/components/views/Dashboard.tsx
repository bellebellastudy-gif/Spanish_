import { ArrowUpRight, GraduationCap, Drama, PenLine, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import type { CefrLevel, ViewId } from '../../types';

interface DashboardProps {
  level: CefrLevel;
  onNavigate: (view: ViewId) => void;
}

const MODULES: { id: ViewId; title: string; description: string; icon: typeof GraduationCap; rotate: string }[] = [
  {
    id: 'tutor',
    title: 'Ask the Tutor',
    description: 'Get a clear, structured explanation for any grammar point or vocabulary question, with examples.',
    icon: GraduationCap,
    rotate: '-rotate-1',
  },
  {
    id: 'roleplay',
    title: 'Roleplay Conversations',
    description: 'Practice real situations — ordering food, checking in for a flight — with a partner who talks back.',
    icon: Drama,
    rotate: 'rotate-1',
  },
  {
    id: 'writing',
    title: 'Writing Lab',
    description: 'Submit a paragraph and get a line-by-line audit: what to fix, why, and how a native speaker would say it.',
    icon: PenLine,
    rotate: 'rotate-1',
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation Practice',
    description: 'Hear any word or phrase spoken naturally, at the pace you choose.',
    icon: Mic,
    rotate: '-rotate-1',
  },
];

export function Dashboard({ level, onNavigate }: DashboardProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-14"
      >
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-clay-deep">
          Nivel {level} &middot; Today's session
        </p>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Bienvenido back to
          <br />
          <span className="italic text-clay-deep">your Spanish practice.</span>
        </h1>
        <p className="mt-5 max-w-lg font-sans text-[15px] leading-relaxed text-ink-soft">
          Four ways to practice today, each tuned to your current level. Pick whichever fits how
          you're feeling — grammar questions, live conversation, writing feedback, or listening.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2">
        {MODULES.map(({ id, title, description, icon: Icon, rotate }, i) => (
          <motion.button
            key={id}
            onClick={() => onNavigate(id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 * i, ease: 'easeOut' }}
            whileHover={{ y: -4, rotate: 0 }}
            className={`group relative overflow-hidden rounded-2xl border border-ink/10 bg-paper-deep/50 p-6 text-left shadow-sm transition-shadow hover:shadow-lg ${rotate}`}
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-clay-deep text-paper">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <h2 className="mb-1.5 font-display text-2xl text-ink">{title}</h2>
            <p className="pr-6 font-sans text-sm leading-relaxed text-ink-soft">{description}</p>
            <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-ink-soft/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay-deep" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
