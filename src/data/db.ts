import Dexie, { type Table } from 'dexie';

export interface TimelineEntry {
  id?: number;
  timestamp: number;
  mood: string;
  moodIcon: string;
  anxietyLevel: number; // 1-10
  notes: string;
  date: string; // YYYY-MM-DD
}

export interface ChecklistState {
  id?: number;
  date: string; // YYYY-MM-DD
  checkedAffirmations: string[]; // array of affirmation IDs
  checkedCopingSkills: string[]; // array of skill IDs
}

class SerenityDB extends Dexie {
  timeline!: Table<TimelineEntry>;
  checklist!: Table<ChecklistState>;

  constructor() {
    super('SerenityDB');
    this.version(1).stores({
      timeline: '++id, timestamp, date',
      checklist: '++id, date',
    });
  }
}

export const db = new SerenityDB();

// ── Helper functions ──

export async function addTimelineEntry(entry: Omit<TimelineEntry, 'id'>): Promise<number> {
  return await db.timeline.add(entry);
}

export async function getTimelineEntries(limit = 50): Promise<TimelineEntry[]> {
  return await db.timeline.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getTodayChecklist(date: string): Promise<ChecklistState | undefined> {
  return await db.checklist.where('date').equals(date).first();
}

export async function saveChecklist(state: Omit<ChecklistState, 'id'>, existingId?: number): Promise<void> {
  if (existingId) {
    await db.checklist.update(existingId, state);
  } else {
    await db.checklist.add(state);
  }
}
