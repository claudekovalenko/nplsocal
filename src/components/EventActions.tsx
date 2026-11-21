import { useEffect, useRef, useState } from 'react';
import { CalendarPlus, Check, Copy, MessageCircle, Bell } from 'lucide-react';
import type { Event } from '@/content';
import { hostFor } from '@/content';
import { calendarable, googleCalendarUrl } from '@/lib/ics';

const BASE = import.meta.env.BASE_URL;
const siteUrl = () => `${location.origin}${BASE}`;

/** The per-event file written at build time; a phone opens it straight into its calendar. */
export const icsUrl = (e: Event) => `${BASE}cal/${e.id}.ics`;

/** The feed people subscribe to. webcal:// makes iPhone, Mac and Outlook offer "Subscribe". */
export const feedHttpUrl = () => `${siteUrl()}calendar.ics`;
export const feedWebcalUrl = () => feedHttpUrl().replace(/^https?:/, 'webcal:');
export const feedGoogleUrl = () => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedWebcalUrl())}`;

/** Close a popover on outside tap or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

const menuItem = 'flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-fg/5 active:bg-fg/10';

/**
 * "Add to calendar": Apple / Outlook get the .ics file (with a reminder the day
 * before and two hours before), Google gets its own add-event link.
 */
export function AddToCalendar({
  event,
  className = 'btn-secondary',
  label = 'Add to calendar',
  align = 'left',
}: {
  event: Event;
  className?: string;
  label?: string;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  if (!calendarable(event)) return null;
  return (
    <div ref={ref} className="relative">
      <button type="button" className={className} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <CalendarPlus className="h-4 w-4" /> {label}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-30 mt-2 w-64 rounded-lg border border-line bg-bg/95 p-1.5 shadow-2xl backdrop-blur-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <a role="menuitem" href={icsUrl(event)} download={`${event.id}.ics`} className={menuItem} onClick={() => setOpen(false)}>
            Apple Calendar · Outlook
          </a>
          <a
            role="menuitem"
            href={googleCalendarUrl(event, { siteUrl: siteUrl(), hubName: hostFor })}
            target="_blank"
            rel="noreferrer"
            className={menuItem}
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <p className="flex items-start gap-2 px-3 pb-2 pt-1.5 text-xs text-faint">
            <Bell className="mt-0.5 h-3 w-3 shrink-0" />
            Your phone reminds you the day before and two hours before.
          </p>
        </div>
      )}
    </div>
  );
}

/** Join the event's Signal group. Renders nothing until a link is set. */
export function SignalButton({
  url,
  className = 'btn-secondary',
  label = 'Signal chat',
}: {
  url?: string;
  className?: string;
  label?: string;
}) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className={className}>
      <MessageCircle className="h-4 w-4" /> {label}
    </a>
  );
}

/**
 * Subscribe once, and every event the network adds shows up in your calendar
 * with reminders — the notifications people asked for, without an app account.
 */
export function SubscribeCalendar() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedHttpUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this calendar link:', feedHttpUrl());
    }
  };
  return (
    <div ref={ref} className="relative">
      <button type="button" className="btn-primary" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <Bell className="h-4 w-4" /> Subscribe to the calendar
      </button>
      {open && (
        <div role="menu" className="absolute left-0 z-30 mt-2 w-72 rounded-lg border border-line bg-bg/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <a role="menuitem" href={feedWebcalUrl()} className={menuItem} onClick={() => setOpen(false)}>
            iPhone · Mac · Outlook
          </a>
          <a role="menuitem" href={feedGoogleUrl()} target="_blank" rel="noreferrer" className={menuItem} onClick={() => setOpen(false)}>
            Google Calendar · Android
          </a>
          <button type="button" role="menuitem" className={menuItem} onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Link copied' : 'Copy the link'}
          </button>
        </div>
      )}
    </div>
  );
}
