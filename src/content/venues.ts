/**
 * Places the network meets, so an address is typed once and every event that
 * names the venue picks it up — featured cards, the calendar, and the top of
 * the registration form.
 *
 * The key must match an event's `location` exactly. A location with no entry
 * here is shown as written, which is right for things like "Zoom" or "Across
 * the L.A. metro".
 */
export interface Venue {
  name: string;
  /**
   * Street address as you would type it into a maps app, e.g.
   * "123 N Example Ave, Fullerton, CA 92832". Empty means we do not have it
   * yet: nothing is shown, rather than sending somebody driving to a guess.
   */
  address: string;
  /** Parking, which door to use, anything people ask on arrival. */
  arrival?: string;
}

export const venues: Record<string, Venue> = {
  'Neighbors and Nations': {
    name: 'Neighbors and Nations',
    address: '',
  },
};

export const venueFor = (location: string): Venue | undefined => venues[location];

/** Opens in whatever maps app the phone uses. */
export const mapsUrl = (v: Venue) =>
  `https://maps.google.com/?q=${encodeURIComponent(`${v.name}, ${v.address}`)}`;
