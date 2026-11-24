import { lazy, Suspense, useState, type FormEvent } from 'react';
import { CheckCircle2, CloudOff, LocateFixed } from 'lucide-react';
import { dayLabel, todayPacific } from '@/lib/format';
import { addSpot } from '@/lib/spotsStore';
import { followUp } from '@/content/push';

const PushMap = lazy(() => import('@/components/PushMap'));
// regionAt lives with the map data; load it with the map, not up front.
const regionAt = (lat: number, lon: number) => import('@/components/PushMap').then((m) => m.regionAt(lat, lon));

// The same box the database checks: Ventura to San Diego, the coast to the desert.
const inSoCal = (lat: number, lon: number) => lat >= 32.5 && lat <= 35.2 && lon >= -119.6 && lon <= -116.0;

/**
 * Add where your team went. Standing on the spot, one tap on "Use my location"
 * does it; otherwise tap the map. The region fills itself in from the pin. No
 * names, no phone numbers: a place and a day, shown to everyone on the map.
 */
export default function SpotForm({
  days,
  eventFor,
  onAdded,
}: {
  days: string[];
  eventFor: (day: string) => string;
  onAdded?: () => void;
}) {
  const today = todayPacific();
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [region, setRegion] = useState('');
  const [place, setPlace] = useState('');
  const [day, setDay] = useState(days.includes(today) ? today : days[0]);
  const [locating, setLocating] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'queued'>('idle');

  const pin = async (lat: number, lon: number) => {
    if (!inSoCal(lat, lon)) {
      setProblem('That is outside Southern California. Tap where your team went on the map.');
      return;
    }
    setProblem(null);
    setPoint([lat, lon]);
    setRegion(await regionAt(lat, lon));
  };

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setProblem('This phone cannot share its location. Tap the map instead.');
      return;
    }
    setLocating(true);
    setProblem(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        pin(p.coords.latitude, p.coords.longitude);
      },
      (err) => {
        setLocating(false);
        setProblem(
          err.code === err.PERMISSION_DENIED
            ? 'Location is turned off for this site. Tap the map instead, or allow location in your browser settings.'
            : 'Could not find your location just now. Tap the map instead.',
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!point) {
      setProblem('Use your location or tap the map first.');
      return;
    }
    setState('sending');
    const { queued } = await addSpot({
      eventId: eventFor(day),
      day,
      region: region || 'Other',
      place: place.trim(),
      lat: point[0],
      lon: point[1],
    });
    setState(queued ? 'queued' : 'sent');
    if (!queued) onAdded?.();
  };

  if (state === 'sent' || state === 'queued') {
    return (
      <div className="card p-8 text-center">
        {state === 'sent' ? (
          <CheckCircle2 className="mx-auto h-8 w-8 text-accent" strokeWidth={1.5} />
        ) : (
          <CloudOff className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
        )}
        <h3 className="mt-4 text-2xl">{state === 'sent' ? 'On the map.' : 'Saved on your phone.'}</h3>
        <p className="mt-2 text-sm text-muted">
          {state === 'sent'
            ? 'Everyone following the push can see it now.'
            : 'It will go onto the map by itself as soon as it can.'}
        </p>
        <button
          type="button"
          className="btn-secondary mt-6"
          onClick={() => {
            setPoint(null);
            setPlace('');
            setRegion('');
            setState('idle');
          }}
        >
          Add another place
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-6 p-6 md:p-8">
      <div>
        <span className="eyebrow">Where you are</span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="button" onClick={locate} className="btn-primary" disabled={locating}>
            <LocateFixed className="h-4 w-4" /> {locating ? 'Finding you…' : 'Use my location'}
          </button>
          <span className="text-sm text-muted">or tap the map</span>
        </div>
        <div className="mt-4">
          <Suspense fallback={<div className="h-[min(52vh,420px)] rounded-xl border border-line" />}>
            <PushMap pick={{ point, onPick: pin }} />
          </Suspense>
        </div>
        {point && (
          <p className="mt-2 text-sm text-muted">
            Pinned in <span className="text-fg">{region || '…'}</span>. Tap the map again to move it.
          </p>
        )}
        {problem && (
          <p role="alert" className="mt-2 text-sm text-red-400">
            {problem}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="eyebrow">Name of the place (optional)</span>
          <input
            className="field mt-2"
            value={place}
            maxLength={120}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. MacArthur Park, Little Saigon Plaza"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Day</span>
          <select className="field mt-2" value={day} onChange={(e) => setDay(e.target.value)}>
            {days.map((d) => (
              <option key={d} value={d}>
                {dayLabel(d)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {point && (
        <label className="block">
          <span className="eyebrow">Region</span>
          <select className="field mt-2" value={region} onChange={(e) => setRegion(e.target.value)}>
            {followUp.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      )}

      <p className="text-xs text-faint">
        Shown to everyone on the push map, to the nearest block. Never your name or anyone's number.
      </p>
      <button type="submit" className="btn-primary min-w-40" disabled={state === 'sending'}>
        {state === 'sending' ? 'Adding…' : 'Add to the map'}
      </button>
    </form>
  );
}
