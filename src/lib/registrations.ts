/** One sign-up for an event. `party` includes the person registering. */
export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  party: number;
  city: string;
  church: string;
  network: string;
  notes: string;
  createdAt: string;
}

export const emptyRegistration = (eventId: string): Registration => ({
  id: '',
  eventId,
  name: '',
  email: '',
  phone: '',
  party: 1,
  city: '',
  church: '',
  network: '',
  notes: '',
  createdAt: new Date().toISOString(),
});

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const totalPeople = (regs: Registration[]) => regs.reduce((n, r) => n + Math.max(1, r.party || 1), 0);

/** Count distinct non-empty values of a field, biggest first. */
export function countBy(regs: Registration[], key: 'city' | 'church' | 'network') {
  const map = new Map<string, number>();
  for (const r of regs) {
    const v = (r[key] || '').trim();
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + Math.max(1, r.party || 1));
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

const CSV_COLUMNS: [keyof Registration, string][] = [
  ['name', 'Name'],
  ['party', 'Party size'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['city', 'City'],
  ['church', 'Church'],
  ['network', 'Network'],
  ['notes', 'Notes'],
  ['createdAt', 'Registered'],
];

const escape = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(regs: Registration[]) {
  const head = CSV_COLUMNS.map(([, label]) => label).join(',');
  const rows = regs.map((r) => CSV_COLUMNS.map(([k]) => escape(r[k])).join(','));
  return [head, ...rows].join('\n');
}

/** Minimal RFC4180 parser: handles quoted fields, embedded commas and newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

/** Map a CSV with headers onto registrations, matching common column names. */
export function fromCsv(text: string, eventId: string): Registration[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const find = (...names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)));
  const idx = {
    name: find('name'),
    email: find('email', 'e-mail'),
    phone: find('phone', 'mobile', 'cell'),
    party: find('party', 'how many', 'guests', 'people', 'attend'),
    city: find('city', 'town'),
    church: find('church'),
    network: find('network'),
    notes: find('note', 'comment', 'question'),
  };
  const at = (row: string[], i: number) => (i >= 0 ? (row[i] ?? '').trim() : '');
  return rows.slice(1).map((row) => ({
    ...emptyRegistration(eventId),
    id: uid(),
    name: at(row, idx.name),
    email: at(row, idx.email),
    phone: at(row, idx.phone),
    party: Math.max(1, parseInt(at(row, idx.party), 10) || 1),
    city: at(row, idx.city),
    church: at(row, idx.church),
    network: at(row, idx.network),
    notes: at(row, idx.notes),
  }));
}
