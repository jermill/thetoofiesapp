import { describe, expect, it } from 'vitest';

import {
  activityPoints,
  availability,
  balance,
  daysSinceLastDessert,
  DEFAULT_DESSERT_COST,
  initialState,
  isCleanSoFarToday,
  MAX_ACTIVITY_POINTS_PER_DAY,
  onPlanStreak,
  POINTS_PER_CLEAN_DAY,
  questGoal,
  startOfDay,
  streakMilestoneToday,
  type EconomyState,
} from './economy';
import type { TreatEntry } from './treats';

const DAY = 86_400_000;

function at(daysAgo: number, base = new Date('2026-07-20T12:00:00')): Date {
  return new Date(base.getTime() - daysAgo * DAY);
}

function entry(daysAgo: number, pointsSpent = DEFAULT_DESSERT_COST): TreatEntry {
  return {
    id: `t-${daysAgo}`,
    name: 'Cookie',
    emoji: '🍪',
    date: at(daysAgo).toISOString(),
    pointsSpent,
  } as TreatEntry;
}

function stateInstalledDaysAgo(days: number): EconomyState {
  return { ...initialState(at(days)), entries: [] };
}

describe('balance', () => {
  it('credits each completed clean day', () => {
    const s = stateInstalledDaysAgo(5);
    expect(balance(s, at(0))).toBe(5 * POINTS_PER_CLEAN_DAY);
  });

  it('debits desserts at their timestamps', () => {
    const s = { ...stateInstalledDaysAgo(5), entries: [entry(1, 30)] };
    // 4 clean days credited (the dessert day is not clean), minus 30
    expect(balance(s, at(0))).toBe(4 * POINTS_PER_CLEAN_DAY - 30);
  });

  it('never goes negative - unaffordable desserts are forgiven, not debt', () => {
    const s = { ...stateInstalledDaysAgo(1), entries: [entry(0, 500)] };
    expect(balance(s, at(0))).toBeGreaterThanOrEqual(0);
  });

  it('ignores future-dated desserts', () => {
    const future: TreatEntry = { ...entry(0), date: at(-3).toISOString() };
    const s = { ...stateInstalledDaysAgo(2), entries: [future] };
    expect(balance(s, at(0))).toBe(2 * POINTS_PER_CLEAN_DAY);
  });

  it('does not mint clean-day credit before install date', () => {
    const s = stateInstalledDaysAgo(1);
    expect(balance(s, at(0))).toBe(POINTS_PER_CLEAN_DAY);
  });
});

describe('availability', () => {
  it('computes banked desserts and progress', () => {
    const s = stateInstalledDaysAgo(6); // 60 pts
    const a = availability(s, at(0));
    expect(a.balance).toBe(60);
    expect(a.bankedDesserts).toBe(2);
    expect(a.affordable).toBe(true);
    expect(a.progress).toBe(1);
  });

  it('reports points + clean days needed when short', () => {
    const s = stateInstalledDaysAgo(1); // 10 pts, cost 30
    const a = availability(s, at(0));
    expect(a.pointsNeeded).toBe(20);
    expect(a.cleanDaysNeeded).toBe(2);
    expect(a.progress).toBeCloseTo(10 / 30);
  });
});

describe('activityPoints', () => {
  it('floors at zero for corrupt negative steps', () => {
    expect(activityPoints(-5000)).toBe(0);
  });

  it('caps at the daily max', () => {
    expect(activityPoints(1_000_000)).toBe(MAX_ACTIVITY_POINTS_PER_DAY);
  });

  it('converts 1500 steps to 1 point', () => {
    expect(activityPoints(2999)).toBe(1);
    expect(activityPoints(3000)).toBe(2);
  });
});

describe('onPlanStreak', () => {
  it('counts clean days and earned-dessert days both as on-plan', () => {
    const s = { ...stateInstalledDaysAgo(6), entries: [entry(1, 30)] };
    // Dessert on day-1 was affordable (>=3 clean days banked by then)
    expect(onPlanStreak(s, at(0))).toBe(7);
  });

  it('pauses (does not zero history into debt) on an overspent day', () => {
    const s = { ...stateInstalledDaysAgo(1), entries: [entry(0, 500)] };
    // Overspent today -> today not on plan
    expect(onPlanStreak(s, at(0))).toBe(0);
  });
});

describe('streakMilestoneToday', () => {
  it('fires only on milestone days', () => {
    expect(streakMilestoneToday(stateInstalledDaysAgo(2), at(0))).toBe(3);
    expect(streakMilestoneToday(stateInstalledDaysAgo(3), at(0))).toBeNull();
    expect(streakMilestoneToday(stateInstalledDaysAgo(6), at(0))).toBe(7);
  });
});

describe('recency', () => {
  it('is null with no entries', () => {
    expect(daysSinceLastDessert(stateInstalledDaysAgo(3), at(0))).toBeNull();
  });

  it('reports whole local days since the last treat', () => {
    const s = { ...stateInstalledDaysAgo(5), entries: [entry(2)] };
    expect(daysSinceLastDessert(s, at(0))).toBe(2);
  });

  it('never reports negative for future-dated entries', () => {
    const s = { ...stateInstalledDaysAgo(5), entries: [entry(-3)] };
    expect(daysSinceLastDessert(s, at(0))).toBe(0);
  });

  it('isCleanSoFarToday flips when a treat lands today', () => {
    const clean = stateInstalledDaysAgo(2);
    expect(isCleanSoFarToday(clean, at(0))).toBe(true);
    const treated = { ...clean, entries: [entry(0)] };
    expect(isCleanSoFarToday(treated, at(0))).toBe(false);
  });
});

describe('questGoal', () => {
  it('uses the default with no history', () => {
    const s = stateInstalledDaysAgo(10);
    expect(questGoal(s, startOfDay(at(0)))).toBe(6000);
  });

  it('clamps to 3k-12k and rounds to 500', () => {
    const low: EconomyState = {
      ...stateInstalledDaysAgo(10),
      stepsByDay: { [dayKeyOf(at(1))]: 100 },
    };
    expect(questGoal(low, startOfDay(at(0)))).toBe(3000);

    const high: EconomyState = {
      ...stateInstalledDaysAgo(10),
      stepsByDay: { [dayKeyOf(at(1))]: 50_000 },
    };
    expect(questGoal(high, startOfDay(at(0)))).toBe(12_000);
  });
});

function dayKeyOf(d: Date): string {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  const y = s.getFullYear();
  const m = String(s.getMonth() + 1).padStart(2, '0');
  const day = String(s.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
