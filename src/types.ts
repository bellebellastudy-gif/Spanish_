export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export interface RoleplayScenario {
  id: string;
  title: string;
  context: string;
  aiRole: string;
  userRole: string;
  opener: string;
}

export interface ConversationMessage {
  role: 'user' | 'ai';
  text: string;
  translation?: string;
  feedback?: string;
}

export interface WritingCorrection {
  original: string;
  corrected: string;
  reason: string;
}

export interface WritingAuditResult {
  isCorrect: boolean;
  explanation: string;
  corrections: WritingCorrection[];
  alternatives: string[];
}

export type ViewId = 'dashboard' | 'tutor' | 'roleplay' | 'writing' | 'pronunciation';
