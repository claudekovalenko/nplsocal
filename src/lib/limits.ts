/**
 * Field limits, mirroring the CHECK constraints in supabase/schema.sql.
 *
 * These three tables take inserts from anyone on the internet, so the database
 * enforces its own limits and will reject a row that breaks them. If a form let
 * someone type past a limit, they would fill the whole thing in, hit submit and
 * only then be told no — so every input caps itself at the same number.
 *
 * Change a value here and in the schema together, or the two drift apart and
 * that failure comes back.
 */
export const LIMITS = {
  name: 200,
  /** The longest an email address can be per RFC 5321. */
  email: 320,
  phone: 50,
  city: 120,
  church: 200,
  notes: 4000,
  eventId: 100,
  /** Longest run of days anyone could pick for a single event. */
  days: 60,

  reporter: 200,
  team: 200,
  area: 200,
  story: 8000,
  prayer: 4000,
  /** Any single daily count. A push that beats this can celebrate the error. */
  count: 100000,

  source: 100,
  wants: 20,

  /** Party size. The schema allows up to 500; the form is stricter on purpose. */
  party: 500,
  partyForm: 200,
} as const;
