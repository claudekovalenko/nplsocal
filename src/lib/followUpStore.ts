import { followUp } from '@/content/push';
import { dayLabel } from './format';

/** One person a team met who wants a follow-up. The phone number is the point. */
export interface FollowUp {
  name: string;
  phone: string;
  wants: string[];
  notes: string;
}

/**
 * What a team sends from one stretch in the field: where they were, how many
 * red / yellow / green lights they found (optional), and the people to call back.
 */
export interface FieldLog {
  day: string;
  region: string;
  area: string;
  foundBy: string;
  red: number;
  yellow: number;
  green: number;
  people: FollowUp[];
}

export const emptyPerson = (): FollowUp => ({ name: '', phone: '', wants: [], notes: '' });

export const emptyLog = (day: string): FieldLog => ({
  day,
  region: '',
  area: '',
  foundBy: '',
  red: 0,
  yellow: 0,
  green: 0,
  people: [emptyPerson()],
});

/** A person card counts once anything is typed into it; untouched cards are dropped. */
export const isBlank = (p: FollowUp) => !p.name.trim() && !p.phone.trim() && !p.notes.trim() && !p.wants.length;

/**
 * The follow-up written out as an email. There is no database: the person in
 * the field sends this from their own email app, so it has to read well as
 * plain text on a phone.
 */
export function followUpMessage(log: FieldLog) {
  const people = log.people.filter((p) => !isBlank(p));
  const where = [log.region, log.area].filter(Boolean).join(' — ');
  const subject = people.length
    ? `Push follow-up: ${people.length} ${people.length === 1 ? 'person' : 'people'} · ${log.region}`
    : `Push lights · ${log.region}`;

  const lines: string[] = [
    `Region: ${where}`,
    `Day: ${dayLabel(log.day)}`,
  ];
  if (log.foundBy.trim()) lines.push(`Found by: ${log.foundBy.trim()}`);
  if (log.red + log.yellow + log.green > 0) {
    lines.push(`Lights: ${log.red} red · ${log.yellow} yellow · ${log.green} green`);
  }
  people.forEach((p, i) => {
    lines.push('', `${i + 1}. ${p.phone.trim()}${p.name.trim() ? ` (${p.name.trim()})` : ''}`);
    if (p.wants.length) lines.push(`   Wants: ${p.wants.join(', ')}`);
    if (p.notes.trim()) lines.push(`   ${p.notes.trim()}`);
  });
  const body = lines.join('\n');

  return {
    subject,
    body,
    mailto: `mailto:${followUp.sendTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
