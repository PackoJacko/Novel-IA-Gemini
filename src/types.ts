export interface Book {
  id: string;
  title: string;
  type: 'standalone' | 'saga';
  color: string;
  sagaName?: string;
  sagaOrder?: number;
  connectedTo?: string[];
  createdAt: string;
  lastEdited: string;
  wordCount: number;
  idea?: string;
  synopsis?: string;
  outline?: string;
  beats?: string;
  prose?: string;
  step?: number;
  manuscript?: string;
  characters?: Character[];
  world?: WorldData;
  structure?: Structure;
  escaleta?: Escaleta[];
  chapters?: Chapter[];
  codex?: CodexEntry[];
  lorebook?: LorebookEntry[];
  bsfavs?: string[];
  mapnodes?: MapNode[];
  maplinks?: MapLink[];
  linkedDocId?: string | null;
  aiSettings?: AISettings;
}

export interface AISettings {
  provider: 'gemini' | 'claude';
  claudeApiKey?: string;
  claudeModel?: string;
  useDirectClaude?: boolean;
}

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'secondary' | 'mentor' | 'other';
  appearance?: string;
  fears?: string;
  secret?: string;
  ghost?: string;
  arcStart?: string;
  arcEnd?: string;
  arcHow?: string;
}

export interface WorldData {
  genre?: string;
  magicRules?: string;
  geography?: string;
  society?: string;
  tone?: string;
}

export interface Structure {
  premise?: string;
  theme?: string;
  pov?: string;
  incitingIncident?: string;
  midpointTwist?: string;
  darkNight?: string;
  climax?: string;
  plotTwists?: string;
}

export interface Escaleta {
  id: string;
  title: string;
  summary?: string;
  goal?: string;
  conflict?: string;
  hook?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content?: string;
  notes?: string;
  status: 'draft' | 'wip' | 'done';
}

export interface CodexEntry {
  id: string;
  name: string;
  type: 'personaje' | 'lugar' | 'objeto' | 'mitología' | 'otro';
  desc: string;
}

export interface LorebookEntry {
  id: string;
  keywords: string[];
  content: string;
}

export interface MapNode {
  id: string;
  label: string;
  type: string;
  group: string;
}

export interface MapLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}
