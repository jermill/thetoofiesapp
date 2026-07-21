// The Toofies points economy — pure logic, no React, no storage, no UI.
//
// Faithful TypeScript port of the SwiftUI prototype's TreatStore
// (Toofies/Models/TreatStore.swift). Every function takes `now` explicitly so
// the whole engine is deterministic and unit-testable.
//
// IMPORTANT (constitution §1/§2): the point VALUES below are the ratified
// *experiment's* placeholder defaults, not settled product economics. The
// economy itself is an opt-in experiment to validate (D7–D9), and recency
// tracking must work with the economy switched off entirely. This module
// exposes both; which surfaces the UI shows is a separate, gated decision.

import type { TreatEntry } from './treats';

// —— Economy constants (placeholder/experimental — see note above) ——————————

/** Every completed dessert-free day banks this many points. */
export const POINTS_PER_CLEAN_DAY = 10;
/** With Health connected, every 1,500 steps in a day earns +1 pt… */
export const STEPS_PER_ACTIVITY_POINT = 1_500;
/** …up to this daily cap (a 21k-step theme-park day banks +14). */
export const MAX_ACTIVITY_POINTS_PER_DAY = 15;
/** Completing the daily step quest banks this bonus. */
export const QUEST_BONUS_POINTS = 5;
/** Step-quest goal before there's a week of personal data to adapt to. */
export const DEFAULT_QUEST_GOAL = 6_000;
/** Default dessert price in points (adjustable in settings). */
export const DEFAULT_DESSERT_COST = 30;
/**
 * On-plan streak milestones — dense through the first ten days, the
 * habit-formation window where drop-off risk falls.
 */
export const STREAK_MILESTONES = new Set([3, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 365]);

// —— State shape ——————————————————————————————————————————————————————————

export type EconomyState = {
  /** What one dessert costs, in points. */
  dessertCost: number;
  entries: TreatEntry[];
  /** User opted in to step-based earning via Apple Health. */
  healthConnected: boolean;
  /** dayKey (local YYYY-MM-DD) → step total for that day. */
  stepsByDay: Record<string, number>;
  /** ISO timestamp the app was first opened on this device. */
  installDate: string;
};

export function initialState(now: Date = new Date()): EconomyState {
  return {
    dessertCost: DEFAULT_DESSERT_COST,
    entries: [],
    healthConnected: false,
    stepsByDay: {},
    installDate: now.toISOString(),
  };
}

// —— Local-time day helpers ——————————————————————————————————————————————
// Swift used Calendar.startOfDay in the device's local zone. We mirror that
// with local getters so day boundaries land at local midnight.

export function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Local-time YYYY-MM-DD key, used for the stepsByDay map. */
export function dayKey(d: Date): string {
  const s = startOfDay(d);
  const y = s.getFullYear();
  const m = String(s.getMonth() + 1).padStart(2, '0');
  const day = String(s.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole calendar days between two instants (by their local day starts). */
function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

// —— Small internal helpers ————————————————————————————————————————————————

function entryDates(s: EconomyState): Date[] {
  return s.entries.map((e) => new Date(e.date));
}

/** Desserts logged in [start, end). */
function dessertsInRange(s: EconomyState, start: Date, end: Date): TreatEntry[] {
  return s.entries.filter((e) => {
    const t = new Date(e.date).getTime();
    return t >= start.getTime() && t < end.getTime();
  });
}

function earliestDay(s: EconomyState): Date {
  // Earning starts the day the app was installed. An entry dated before install
  // may still debit, but must never mint clean-day credit for days the app never
  // observed — and a far-past date must not blow up the credit loop.
  return startOfDay(new Date(s.installDate));
}

// —— Points economy ————————————————————————————————————————————————————————
// Earn-and-spend: each completed dessert-free day credits base points at
// midnight; with Health connected, each completed day also credits step points
// and any quest bonus. Each dessert debits the price in force when it was
// logged. Balance is derived from the full history with a floor of zero, so an
// unaffordable dessert is forgiven (never carried as debt).

export function activityPoints(steps: number): number {
  // Floor at 0 so a corrupt/negative stored step count can't cancel other credits.
  return Math.max(0, Math.min(Math.floor(steps / STEPS_PER_ACTIVITY_POINT), MAX_ACTIVITY_POINTS_PER_DAY));
}

type LedgerEvent = { date: Date; delta: number };

/**
 * Full earn/spend history in time order: dessert debits at their timestamps,
 * day credits at the following midnight.
 */
function ledgerEvents(s: EconomyState, now: Date): LedgerEvent[] {
  // Ignore future-dated desserts — they must not debit the balance as of `now`.
  const events: LedgerEvent[] = s.entries
    .filter((e) => new Date(e.date).getTime() <= now.getTime())
    .map((e) => ({ date: new Date(e.date), delta: -e.pointsSpent }));

  const todayStart = startOfDay(now);
  let day = earliestDay(s);
  while (day.getTime() < todayStart.getTime()) {
    const next = addDays(day, 1);
    let credit = 0;
    if (dessertsInRange(s, day, next).length === 0) {
      credit += POINTS_PER_CLEAN_DAY;
    }
    if (s.healthConnected) {
      credit += activityPoints(s.stepsByDay[dayKey(day)] ?? 0);
      if (questCompleted(s, day)) {
        credit += QUEST_BONUS_POINTS;
      }
    }
    if (credit > 0) {
      events.push({ date: next, delta: credit });
    }
    day = next;
  }

  // Time order; on an exact tie (a dessert logged at local midnight) apply the
  // day's credit BEFORE the debit, so a just-banked clean day can cover it.
  return events.sort((a, b) => a.date.getTime() - b.date.getTime() || b.delta - a.delta);
}

export function balance(s: EconomyState, now: Date = new Date()): number {
  return ledgerEvents(s, now).reduce((bal, e) => Math.max(0, bal + e.delta), 0);
}

export type Availability = {
  balance: number;
  cost: number;
  affordable: boolean;
  bankedDesserts: number;
  pointsNeeded: number;
  cleanDaysNeeded: number;
  /** 0..1 progress toward the next dessert. */
  progress: number;
};

export function availability(s: EconomyState, now: Date = new Date()): Availability {
  const bal = balance(s, now);
  const cost = s.dessertCost;
  const pointsNeeded = Math.max(0, cost - bal);
  return {
    balance: bal,
    cost,
    affordable: bal >= cost,
    bankedDesserts: cost > 0 ? Math.floor(bal / cost) : 0,
    pointsNeeded,
    cleanDaysNeeded: pointsNeeded > 0 ? Math.ceil(pointsNeeded / POINTS_PER_CLEAN_DAY) : 0,
    progress: cost > 0 ? Math.min(1, bal / cost) : 1,
  };
}

/** Points today will bank at midnight, as things stand right now. */
export function pendingPointsToday(s: EconomyState, now: Date = new Date()): number {
  let pending = isCleanSoFarToday(s, now) ? POINTS_PER_CLEAN_DAY : 0;
  if (s.healthConnected) {
    pending += activityPoints(todaySteps(s, now));
    if (questCompleted(s, startOfDay(now))) {
      pending += QUEST_BONUS_POINTS;
    }
  }
  return pending;
}

export function todaySteps(s: EconomyState, now: Date = new Date()): number {
  return s.stepsByDay[dayKey(now)] ?? 0;
}

// —— Daily step quest ——————————————————————————————————————————————————————
// A capped bonus quest — "walk your goal, bank +5 at midnight". The goal adapts
// gently to the user's own recent week and is deterministic per day.

/**
 * Step goal for the day: 105% of the median of the prior 7 days with data,
 * clamped 3,000–12,000, rounded to the nearest 500.
 */
export function questGoal(s: EconomyState, dayStart: Date): number {
  const samples: number[] = [];
  for (let offset = 1; offset <= 7; offset++) {
    const past = addDays(dayStart, -offset);
    const steps = s.stepsByDay[dayKey(past)] ?? 0;
    if (steps > 0) samples.push(steps);
  }
  if (samples.length === 0) return DEFAULT_QUEST_GOAL;
  const sorted = samples.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const clamped = Math.min(12_000, Math.max(3_000, Math.floor(median * 1.05)));
  return Math.floor((clamped + 250) / 500) * 500;
}

export function questCompleted(s: EconomyState, dayStart: Date): boolean {
  if (!s.healthConnected) return false;
  return (s.stepsByDay[dayKey(dayStart)] ?? 0) >= questGoal(s, dayStart);
}

export function todayQuestGoal(s: EconomyState, now: Date = new Date()): number {
  return questGoal(s, startOfDay(now));
}

// —— Streaks & milestones ——————————————————————————————————————————————————
// The streak the product celebrates is DAYS ON PLAN: clean days and
// fully-earned dessert days both count — the earned dessert is the product
// promise, so enjoying it must never break the streak. Only an over-budget
// dessert pauses it, and even then: no debt, fresh start.

/** Days on which a dessert outran the balance (the debit hit the floor). */
function overspentDays(s: EconomyState, now: Date): Set<string> {
  let bal = 0;
  const days = new Set<string>();
  for (const event of ledgerEvents(s, now)) {
    const unclamped = bal + event.delta;
    if (event.delta < 0 && unclamped < 0) {
      days.add(dayKey(event.date));
    }
    bal = Math.max(0, unclamped);
  }
  return days;
}

export function onPlanStreak(s: EconomyState, now: Date = new Date()): number {
  const overspent = overspentDays(s, now);
  const firstDay = earliestDay(s);
  let streak = 0;
  let day = startOfDay(now);
  while (day.getTime() >= firstDay.getTime() && !overspent.has(dayKey(day))) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Non-null while today's on-plan streak sits exactly on a milestone. */
export function streakMilestoneToday(s: EconomyState, now: Date = new Date()): number | null {
  const streak = onPlanStreak(s, now);
  return STREAK_MILESTONES.has(streak) ? streak : null;
}

// —— Recency (a first-class surface, works with the economy off) ————————————

export function lastDessertDate(s: EconomyState): Date | null {
  const dates = entryDates(s);
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/** Whole days since the most recent dessert (0 = today), null if none logged. */
export function daysSinceLastDessert(s: EconomyState, now: Date = new Date()): number | null {
  const last = lastDessertDate(s);
  if (!last) return null;
  // Never report a negative "days since" if an entry is somehow future-dated.
  return Math.max(0, daysBetween(last, now));
}

export function isCleanSoFarToday(s: EconomyState, now: Date = new Date()): boolean {
  const todayStart = startOfDay(now);
  const tomorrow = addDays(todayStart, 1);
  return dessertsInRange(s, todayStart, tomorrow).length === 0;
}

export function nextMidnight(now: Date = new Date()): Date {
  return addDays(startOfDay(now), 1);
}

// —— Chart data ————————————————————————————————————————————————————————————

export type DayBucket = {
  key: string;
  label: string;
  fullLabel: string;
  entries: TreatEntry[];
  count: number;
};

export function lastSevenDays(s: EconomyState, now: Date = new Date()): DayBucket[] {
  const todayStart = startOfDay(now);
  const buckets: DayBucket[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const dStart = addDays(todayStart, -offset);
    const dEnd = addDays(dStart, 1);
    const entries = dessertsInRange(s, dStart, dEnd);
    buckets.push({
      key: dayKey(dStart),
      label: offset === 0 ? 'Today' : dStart.toLocaleDateString(undefined, { weekday: 'short' }),
      fullLabel: dStart.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      entries,
      count: entries.length,
    });
  }
  return buckets;
}
