import { Compass, GraduationCap, Drama, PenLine, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import type { CefrLevel, ViewId } from '../types';
import { CEFR_LEVELS } from '../types';

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Compass }[] = [
  { id: 'dashboard', label: 'Overview', icon: Compass },
  { id: 'tutor', label: 'Ask the Tutor', icon: GraduationCap },
  { id: 'roleplay', label: 'Roleplay', icon: Drama },
  { id: 'writing', label: 'Writing Lab', icon: PenLine },
  { id: 'pronunciation', label: 'Pronunciation', icon: Mic },
];

interface SidebarProps {
  active: ViewId;
  onNavigate: (view: ViewId) => void;
  level: CefrLevel;
  onLevelChange: (level: CefrLevel) => void;
}

export function Sidebar({ active, onNavigate, level, onLevelChange }: SidebarProps) {
  return (
    <aside className="relative z-10 flex h-full w-full flex-col justify-between border-r border-ink/10 bg-paper-deep/60 px-6 py-8 lg:w-72">
      <div>
        <div className="mb-10 flex items-baseline gap-2">
          <span className="font-display text-3xl italic tracking-tight text-clay-deep">Maestría</span>
          <span className="font-display text-3xl text-ink">.</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  isActive ? 'text-paper' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-clay-deep shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={2} />
                <span className="relative z-10 font-sans text-[15px] font-medium">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-ink-soft/70">
          Your level
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CEFR_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={`rounded-full border px-3 py-1 font-sans text-xs font-semibold transition-colors ${
                l === level
                  ? 'border-clay bg-clay text-paper'
                  : 'border-ink/15 text-ink-soft hover:border-clay/50 hover:text-clay-deep'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="mt-4 border-t border-ink/10 pt-4 font-sans text-[11px] leading-relaxed text-ink-soft/70">
          Every exercise adapts its difficulty and vocabulary to this level.
        </p>
      </div>
    </aside>
  );
}
