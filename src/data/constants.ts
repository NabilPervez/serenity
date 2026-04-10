// ======================================================
// DATA CONSTANTS
// Source data loaded from JSON files:
//   src/data/copingSkills.json  — 26 coping skills
//   src/data/affirmations.json  — 101 positive affirmations
// ======================================================

import copingSkillsData from './copingSkills.json';
import affirmationsData from './affirmations.json';

// ── Types ──────────────────────────────────────────────

export interface CopingSkill {
  id: string;
  name: string;
  description: string;   // short display text
  fullText: string;      // original verbatim text from source
  icon: string;          // Material Symbols icon name
  category: string;      // physical | creative | relaxation | mental | spiritual | social
}

export interface Affirmation {
  id: string;
  text: string;          // verbatim from source
}

// ── Exported data ─────────────────────────────────────

export const COPING_SKILLS: CopingSkill[] = copingSkillsData as CopingSkill[];

export const AFFIRMATIONS: Affirmation[] = affirmationsData as Affirmation[];

// ── Mood tags ─────────────────────────────────────────

export const MOODS = [
  { label: 'Calm', icon: '😌', color: 'primary' },
  { label: 'Anxious', icon: '😰', color: 'secondary' },
  { label: 'Overwhelmed', icon: '😵', color: 'secondary' },
  { label: 'Grateful', icon: '🙏', color: 'primary' },
  { label: 'Restless', icon: '😤', color: 'secondary' },
  { label: 'Sad', icon: '😔', color: 'tertiary' },
  { label: 'Hopeful', icon: '🌱', color: 'primary' },
  { label: 'Tired', icon: '😴', color: 'tertiary' },
];
