// The dessert catalog + the logged-entry shape.
//
// Ported from the SwiftUI prototype (Toofies/Models/TreatModels.swift). This is
// a faithful port of ratified logic — it makes no new product or visual
// decisions. The emoji here are data, not a design choice.

export type TreatKind =
  | 'cookie'
  | 'cake'
  | 'iceCream'
  | 'chocolate'
  | 'donut'
  | 'candy'
  | 'pie'
  | 'cupcake';

export const TREATS: Record<TreatKind, { name: string; emoji: string }> = {
  cookie: { name: 'Cookie', emoji: '🍪' },
  cake: { name: 'Cake', emoji: '🍰' },
  iceCream: { name: 'Ice cream', emoji: '🍦' },
  chocolate: { name: 'Chocolate', emoji: '🍫' },
  donut: { name: 'Donut', emoji: '🍩' },
  candy: { name: 'Candy', emoji: '🍬' },
  pie: { name: 'Pie', emoji: '🥧' },
  cupcake: { name: 'Cupcake', emoji: '🧁' },
};

export const TREAT_KINDS = Object.keys(TREATS) as TreatKind[];

export type TreatEntry = {
  id: string;
  emoji: string;
  name: string;
  /** ISO-8601 timestamp of when the dessert was logged. */
  date: string;
  /**
   * The dessert's price in points at the moment it was logged (0 for entries
   * that predate the economy). Recording the price at log time keeps the
   * ledger stable if the cost setting later changes.
   */
  pointsSpent: number;
};

export function makeEntry(
  kind: TreatKind,
  pointsSpent: number,
  date: Date = new Date(),
  id: string = randomId(),
): TreatEntry {
  const t = TREATS[kind];
  return { id, emoji: t.emoji, name: t.name, date: date.toISOString(), pointsSpent };
}

// A small dependency-free id. Uniqueness only needs to hold within one
// device's local log, so timestamp + counter is sufficient and deterministic
// enough for tests that inject their own ids.
let _counter = 0;
function randomId(): string {
  _counter = (_counter + 1) % 1_000_000;
  return `t_${Date.now().toString(36)}_${_counter.toString(36)}`;
}
