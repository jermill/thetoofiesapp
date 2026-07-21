/** UI-only buddy / dessert-walk prefs (no backend). */

const KEY = 'toofies.pwa.buddy';

export type BuddyChallenge = {
  id: string;
  title: string;
  blurb: string;
  progress: number;
  goal: number;
  unit: string;
  reward: string;
};

export type WalkMemory = {
  id: string;
  createdAt: string;
  photoDataUrl: string;
  cardDataUrl: string;
  combinedSteps: number;
};

export type BuddyState = {
  paired: boolean;
  buddyName: string;
  inviteCode: string;
  myCode: string;
  duoStreak: number;
  walkActive: boolean;
  walkStepsMe: number;
  walkStepsBuddy: number;
  walkGoal: number;
  lastCheer: string;
  challenges: BuddyChallenge[];
  /** Photos / screenshot cards from completed dessert walks. */
  walkMemories: WalkMemory[];
};

const defaultChallenges = (): BuddyChallenge[] => [
  {
    id: 'walk-treat',
    title: 'Dessert Walk Duo',
    blurb: 'Take a stroll together (or asynchronously) - movement as joy, not penance.',
    progress: 4200,
    goal: 8000,
    unit: 'combined steps',
    reward: 'Unlock a shared treat-check cheer',
  },
  {
    id: 'moment',
    title: 'Sweet Moment',
    blurb: 'Each log one dessert you actually enjoyed this week.',
    progress: 1,
    goal: 2,
    unit: 'logged joys',
    reward: 'Duo badge: Sweet Tooth Squad',
  },
  {
    id: 'check-in',
    title: 'Peace Check',
    blurb: 'Ask each other “feeling good about a treat?” - no judgment, just vibes.',
    progress: 0,
    goal: 3,
    unit: 'check-ins',
    reward: '+Toofie duo sticker',
  },
];

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export function defaultBuddyState(): BuddyState {
  return {
    paired: false,
    buddyName: '',
    inviteCode: '',
    myCode: randomCode(),
    duoStreak: 0,
    walkActive: false,
    walkStepsMe: 0,
    walkStepsBuddy: 0,
    walkGoal: 8000,
    lastCheer: '',
    challenges: defaultChallenges(),
    walkMemories: [],
  };
}

export function loadBuddy(): BuddyState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultBuddyState();
    const parsed = JSON.parse(raw) as Partial<BuddyState>;
    const base = defaultBuddyState();
    return {
      ...base,
      ...parsed,
      challenges: parsed.challenges?.length ? parsed.challenges : base.challenges,
      myCode: parsed.myCode || base.myCode,
      walkMemories: parsed.walkMemories ?? base.walkMemories,
    };
  } catch {
    return defaultBuddyState();
  }
}

export function saveBuddy(patch: Partial<BuddyState>): BuddyState {
  const next = { ...loadBuddy(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function mockPair(code: string, buddyName = 'Alex'): BuddyState {
  return saveBuddy({
    paired: true,
    buddyName,
    inviteCode: code.toUpperCase(),
    duoStreak: 4,
    walkActive: true,
    walkStepsMe: 2150,
    walkStepsBuddy: 2680,
    lastCheer: `${buddyName} cheered your last dessert ✨`,
    challenges: defaultChallenges().map((c, i) =>
      i === 0 ? { ...c, progress: 4830 } : c,
    ),
  });
}

export function mockUnpair(): BuddyState {
  const myCode = loadBuddy().myCode;
  const fresh = defaultBuddyState();
  return saveBuddy({ ...fresh, myCode });
}
