import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/views/Dashboard';
import { TutorView } from './components/views/TutorView';
import { RoleplayView } from './components/views/RoleplayView';
import { WritingView } from './components/views/WritingView';
import { PronunciationView } from './components/views/PronunciationView';
import type { CefrLevel, ViewId } from './types';

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard');
  const [level, setLevel] = useState<CefrLevel>('B1');

  return (
    <div className="relative flex min-h-screen flex-col bg-paper text-ink lg:flex-row">
      <div className="grain-overlay" />
      <Sidebar active={view} onNavigate={setView} level={level} onLevelChange={setLevel} />

      <main className="relative flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {view === 'dashboard' && <Dashboard level={level} onNavigate={setView} />}
            {view === 'tutor' && <TutorView level={level} />}
            {view === 'roleplay' && <RoleplayView level={level} />}
            {view === 'writing' && <WritingView level={level} />}
            {view === 'pronunciation' && <PronunciationView level={level} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
