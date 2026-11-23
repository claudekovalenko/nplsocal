/**
 * The Pray page: a 100-day and a 365-day plan through every area of LA and
 * Orange County, in English and Spanish. Everything the page shows comes from
 * here (plan, regions, prayer themes, Spanish text) and from map.json, the
 * ZIP-code areas drawn on the map.
 *
 * The 365-day plan is not written out: every place listed under a
 * neighborhood day in the 100-day plan gets its own day, in the same order.
 */

export type Lang = 'en' | 'es';
export type RegionId = 'central' | 'west' | 'sfv' | 'av' | 'sgv' | 'south' | 'lb' | 'noc' | 'coc' | 'woc' | 'soc' | 'coast';
export type Ref = readonly [label: string, code: string];

/** a = whole area, r = region, p = group of neighborhoods, f = focus day */
export interface PlanDay {
  t: 'a' | 'r' | 'p' | 'f';
  title: string;
  r?: RegionId;
  desc?: string;
  places?: string[];
  /** [lat, lon] of a neighborhood group, for the map */
  at?: [number, number];
  /** [lat, lon] points a focus day lights on the map */
  pins?: [number, number][];
  /** who lives and works there, on region, focus and whole-area days */
  who?: string[];
  /** the people the day's prayer names; null for the churches day */
  pp?: string | null;
  ref?: Ref;
  /** starts its own section in the list of all days */
  sec?: string;
  /**
   * A peoples focus day: the communities (ids from peoples.ts) it prays for in
   * depth. The map lights every ZIP code where one of them is estimated at 250
   * or more, and the day lists them with their counts across LA and OC.
   */
  peoples?: string[];
}

// Same Mercator projection as scripts/build-map.mjs, fitted from two of its projected places.
export const PROJ = (() => {
  const m = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const a = { lon: -118.2437, lat: 34.0522, x: 466.5, y: 534.2 }; // Downtown LA
  const b = { lon: -117.8678, lat: 33.7455, x: 657.3, y: 721.8 }; // Santa Ana
  const kx = (b.x - a.x) / (b.lon - a.lon);
  const ky = (b.y - a.y) / (m(b.lat) - m(a.lat));
  return ([lat, lon]: [number, number]): [number, number] => [a.x + kx * (lon - a.lon), a.y + ky * (m(lat) - m(a.lat))];
})();

export const BIBLE = (code: string, lang: Lang) => lang === "es"
  ? `https://www.bible.com/bible/128/${code}.NVI`
  : `https://www.bible.com/bible/59/${code}.ESV`;
export const ES_BOOK: Record<string, string> = { LUK: "Lucas", ROM: "Romanos", MAT: "Mateo", ACT: "Hechos", "2TI": "2 Timoteo", "1TI": "1 Timoteo",
  "2CO": "2 Corintios", JER: "Jeremías", ISA: "Isaías", PHP: "Filipenses", MRK: "Marcos", PSA: "Salmo", PRO: "Proverbios",
  REV: "Apocalipsis", MAL: "Malaquías", MIC: "Miqueas", DEU: "Deuteronomio" };
export const refLabel = (ref: Ref, lang: Lang) => lang === "es" ? `${ES_BOOK[ref[1].split(".")[0]]} ${ref[0].replace(/^.*? (\d+:)/, "$1")}` : ref[0];

// The seven prayer themes from PrayforGreece.com, offered as optional topics on every day; {m} is the place.
// "Churches that multiply" is softened from the Greek site's "simple churches in homes".
export const FOCUS: { ref: Ref; en: [string, string]; es: [string, string] }[] = [
  { ref: ["Luke 10:5–7", "LUK.10.5-7"],
    en: ["Persons of peace", "Ask God to lead workers to persons of peace in {m}: people who open their homes to Jesus and through whom their family and friends hear the good news."],
    es: ["Personas de paz", "Pídele a Dios que guíe a obreros hacia personas de paz en {m}: personas que abran sus hogares a Jesús y por medio de quienes su familia y amigos escuchen las buenas nuevas."] },
  { ref: ["Romans 10:14–15", "ROM.10.14-15"],
    en: ["Gospel conversations", "Pray that believers would have many conversations about the gospel in {m} this week, and that hearts would be ready to respond."],
    es: ["Conversaciones sobre el evangelio", "Ora para que los creyentes tengan muchas conversaciones sobre el evangelio en {m} esta semana, y que los corazones estén listos para responder."] },
  { ref: ["Matthew 28:19–20", "MAT.28.19-20"],
    en: ["Obedient disciples", "Pray for new believers in {m} to be baptized, to obey everything Jesus commanded, and to teach others to do the same."],
    es: ["Discípulos obedientes", "Ora para que los nuevos creyentes en {m} se bauticen, obedezcan todo lo que Jesús mandó y enseñen a otros a hacer lo mismo."] },
  { ref: ["Acts 2:42–47", "ACT.2.42-47"],
    en: ["Churches that multiply", "Ask for churches to begin and grow across {m}, gathering to worship, share life and obey the Word, and starting new churches."],
    es: ["Iglesias que se multiplican", "Pide que comiencen y crezcan iglesias en {m}, que se reúnan para adorar, compartir la vida y obedecer la Palabra, y que inicien nuevas iglesias."] },
  { ref: ["2 Timothy 2:2", "2TI.2.2"],
    en: ["Leaders from the harvest", "Pray that God would raise up faithful local leaders in {m} who will train others, who will train others still."],
    es: ["Líderes de la cosecha", "Ora para que Dios levante líderes locales fieles en {m} que entrenen a otros, quienes a su vez entrenen a otros más."] },
  { ref: ["2 Corinthians 4:4–6", "2CO.4.4-6"],
    en: ["Eyes opened", "Pray that spiritual blindness would be lifted in {m}, and that people would see the light of the gospel of the glory of Christ."],
    es: ["Ojos abiertos", "Ora para que la ceguera espiritual sea quitada en {m}, y que la gente vea la luz del evangelio de la gloria de Cristo."] },
  { ref: ["Jeremiah 29:7", "JER.29.7"],
    en: ["The peace of the city", "Pray for the city leaders who serve {m}, for families, schools and workplaces, and for God's blessing and peace on this place."],
    es: ["La paz de la ciudad", "Ora por los líderes que sirven a {m}, por las familias, escuelas y lugares de trabajo, y por la bendición y la paz de Dios sobre este lugar."] },
];

// Regions follow the hub regions already used in src/content/hubs.ts.
export const REGIONS: Record<RegionId, { hub: 'LA' | 'OC'; name: string }> = {
  central: { hub: "LA", name: "Central & Downtown LA" },
  west: { hub: "LA", name: "Westside & South Bay" },
  sfv: { hub: "LA", name: "San Fernando Valley" },
  av: { hub: "LA", name: "Antelope & Santa Clarita Valleys" },
  sgv: { hub: "LA", name: "San Gabriel Valley" },
  south: { hub: "LA", name: "South LA & Gateway Cities" },
  lb: { hub: "LA", name: "Long Beach" },
  noc: { hub: "OC", name: "North County" },
  coc: { hub: "OC", name: "Central County" },
  woc: { hub: "OC", name: "West County" },
  soc: { hub: "OC", name: "South County" },
  coast: { hub: "OC", name: "Coastal OC" },
};

// t: a = all, r = region, p = place group, f = focus (theme) day
export const PLAN: PlanDay[] = [
  { t: "a", title: "All of Los Angeles and Orange County",
    
    who: ["Nearly 13 million people: about 9.7 million in LA County and 3.2 million in Orange County.", "88 cities in LA County and 34 in Orange County, plus large unincorporated communities such as East Los Angeles.", "People from almost every nation, speaking more than 100 languages at home.", "High-rise apartments downtown, suburbs, beach towns, desert towns and mountain communities."], pp: "everyone who lives in Los Angeles and Orange County",
    ref: ["Romans 15:20–23", "ROM.15.20-23"] },

  { t: "r", r: "central", title: "Central & Downtown LA",
    
    who: ["Downtown office workers, residents of new high-rises, and the people of Skid Row, a few blocks apart.", "Korean, Latino, Armenian, Thai and Filipino communities in Koreatown, Little Armenia, Thai Town and Historic Filipinotown.", "Long-rooted Latino families in Boyle Heights, East LA and Northeast LA.", "Artists, students and young professionals in Echo Park, Silver Lake and Hollywood."], pp: "the people of Central and Downtown LA",
    ref: ["Acts 18:9–10", "ACT.18.9-10"] },
  { t: "p", r: "central", title: "Downtown LA", places: ["Downtown", "Little Tokyo", "Chinatown", "Arts District", "Historic Core & Bunker Hill", "Skid Row"], at: [34.045, -118.245] },
  { t: "p", r: "central", title: "Koreatown & Westlake", places: ["Koreatown", "Westlake", "MacArthur Park", "Pico-Union", "Wilshire Center & Harvard Heights"], at: [34.058, -118.29] },
  { t: "p", r: "central", title: "Hollywood", places: ["Hollywood", "East Hollywood", "Thai Town", "Little Armenia", "Hollywood Hills"], at: [34.098, -118.327] },
  { t: "p", r: "central", title: "Silver Lake, Echo Park & Los Feliz", places: ["Silver Lake", "Echo Park", "Los Feliz", "Elysian Valley", "Historic Filipinotown"], at: [34.09, -118.27] },
  { t: "p", r: "central", title: "Boyle Heights & East LA", places: ["Boyle Heights", "East Los Angeles", "City Terrace"], at: [34.03, -118.19] },
  { t: "p", r: "central", title: "Northeast LA", places: ["Highland Park", "Eagle Rock", "Mount Washington", "Lincoln Heights", "El Sereno", "Glassell Park", "Cypress Park", "Montecito Heights"], at: [34.115, -118.2] },
  { t: "p", r: "central", title: "Mid-City, Mid-Wilshire & West Adams", places: ["Mid-City", "West Adams", "Jefferson Park & Arlington Heights", "University Park", "Mid-Wilshire", "Hancock Park & Windsor Square", "Fairfax", "Larchmont & Miracle Mile"], at: [34.052, -118.34] },
  { t: "f", title: "Korean",
    who: ["Koreatown, among the most densely populated neighborhoods in the country, and Koreatown OC in Garden Grove and Buena Park.", "Hundreds of Korean churches, many already sending workers to the nations.", "Students, young professionals, small-business owners and recent arrivals."], pp: "Korean families in LA and OC",
    ref: ["Acts 17:26–27", "ACT.17.26-27"], peoples: ["korean"] },
  { t: "f", title: "Filipino",
    who: ["Historic Filipinotown, Eagle Rock, West Covina, Cerritos and Carson.", "Nurses, caregivers and healthcare workers in hospitals across both counties.", "Filipino churches and fellowships with a heart for the nations."], pp: "Filipino families in LA and OC",
    ref: ["Isaiah 49:6", "ISA.49.6"], peoples: ["filipino"] },
  { t: "f", title: "Ethiopian, Eritrean and African",
    who: ["Little Ethiopia on Fairfax Avenue, with its restaurants, shops and churches.", "Nigerian and Ghanaian families and churches in Inglewood, Long Beach and the Inland edges of LA.", "Oromo, Somali and Sudanese families, from some of the least reached peoples of Africa."], pp: "Ethiopian, Eritrean, Somali, Nigerian and other African families",
    ref: ["Acts 8:35–38", "ACT.8.35-38"], peoples: ["ethiopian",  "eritrean",  "somali",  "sudanese",  "nigerian",  "ghanaian",  "kenyan"] },
  { t: "f", title: "People experiencing homelessness",
    
    who: ["Tens of thousands of people across LA County without a home on any given night.", "Skid Row in Downtown LA, one of the largest concentrations of unhoused people in the country.", "People living in tents, vehicles and shelters, including many who recently lost a job or a place to live.", "Outreach workers, shelter staff, case managers and churches serving on the streets."], pp: "people experiencing homelessness, and those who serve them",
    ref: ["Isaiah 58:6–8", "ISA.58.6-8"], pins: [[34.043, -118.243]] },
  { t: "f", title: "Hollywood and the entertainment industry",
    
    who: ["Actors, writers, directors, musicians and crew members.", "Studios and production lots in Hollywood, Burbank, Studio City and Culver City.", "Many young people who moved to LA to pursue a career in entertainment.", "Workers behind the scenes: editors, set builders, costume and makeup artists, drivers."], pp: "people who work in film, television and music",
    ref: ["Philippians 4:8", "PHP.4.8"], pins: [[34.098, -118.327], [34.15, -118.34]] },

  { t: "r", r: "west", title: "Westside & South Bay",
    
    who: ["Beach cities and coastal neighborhoods from Malibu to Palos Verdes.", "Students and staff at UCLA, and people working in tech, aerospace and at LAX.", "Harbor communities in San Pedro and Wilmington, next to the Port of Los Angeles.", "Japanese American and other Asian communities in Gardena, Torrance and Sawtelle."], pp: "the people of the Westside and South Bay",
    ref: ["Mark 10:21–27", "MRK.10.21-27"] },
  { t: "p", r: "west", title: "Santa Monica & Venice", places: ["Santa Monica", "Venice", "Ocean Park"], at: [34.01, -118.48] },
  { t: "p", r: "west", title: "West LA & Westwood", places: ["West LA", "Sawtelle", "Westwood", "Palms", "Century City", "Cheviot Hills", "Rancho Park"], at: [34.05, -118.44] },
  { t: "p", r: "west", title: "Beverly Hills & West Hollywood", places: ["Beverly Hills", "West Hollywood", "Beverly Grove", "Pico-Robertson"], at: [34.08, -118.38] },
  { t: "p", r: "west", title: "Culver City & Mar Vista", places: ["Culver City", "Mar Vista", "Del Rey"], at: [34.01, -118.41] },
  { t: "p", r: "west", title: "Brentwood, Pacific Palisades & Malibu", places: ["Brentwood", "Pacific Palisades", "Malibu", "Topanga", "Bel Air"], at: [34.045, -118.55] },
  { t: "p", r: "west", title: "Westchester & Playa", places: ["Westchester", "Playa Vista", "Playa del Rey", "Marina del Rey", "Ladera Heights"], at: [33.96, -118.42] },
  { t: "p", r: "west", title: "Beach Cities", places: ["El Segundo", "Manhattan Beach", "Hermosa Beach", "Redondo Beach"], at: [33.87, -118.4] },
  { t: "p", r: "west", title: "Torrance, Gardena & Carson", places: ["Torrance", "Gardena", "Lawndale", "Alondra Park", "Carson", "Harbor Gateway", "West Carson"], at: [33.835, -118.3] },
  { t: "p", r: "west", title: "Palos Verdes & the Harbor", places: ["Rancho Palos Verdes", "Palos Verdes Estates", "Rolling Hills & Rolling Hills Estates", "Lomita", "San Pedro", "Wilmington", "Harbor City"], at: [33.765, -118.325] },
  { t: "f", title: "Persian, Israeli and Central Asian",
    who: ["Westwood, Beverly Hills and the Westside, home to one of the largest Persian communities outside Iran, Muslim, Jewish and Baha’i.", "Israelis in the San Fernando Valley and on the Westside.", "Afghan families who arrived in recent years, and Turkish, Uzbek and Mongolian neighbors."], pp: "Persian, Israeli, Afghan and Central Asian families",
    ref: ["Jeremiah 49:38", "JER.49.38"], peoples: ["iranian",  "israeli",  "afghan",  "uzbek",  "turkish",  "mongolian"] },
  { t: "f", title: "Japanese",
    who: ["Little Tokyo, Sawtelle, Gardena and Torrance.", "Japanese companies and their families in the South Bay, many here for a few years only.", "Japanese American families who have lived here for generations."], pp: "Japanese families in LA and OC",
    ref: ["Psalm 96:3", "PSA.96.3"], peoples: ["japanese"] },
  { t: "f", title: "Communities rebuilding after the fires",
    
    who: ["Families from Pacific Palisades, Malibu and Altadena whose homes burned in January 2025.", "Many still living in temporary housing, with relatives, or in other cities.", "Longtime Altadena residents, including Black families who had owned their homes for generations.", "Firefighters, builders, insurance workers and volunteers involved in rebuilding."], pp: "families affected by the Palisades and Eaton fires",
    ref: ["Isaiah 61:1–4", "ISA.61.1-4"], pins: [[34.045, -118.53], [34.19, -118.13]] },
  { t: "f", title: "The ports and freight workers",
    
    who: ["Dockworkers, crane operators and longshore crews at the Ports of Los Angeles and Long Beach.", "Truck drivers who move containers between the ports, rail yards and warehouses.", "Warehouse and logistics workers, many on night and weekend shifts.", "Sailors from around the world on ships docked in the harbor."], pp: "dockworkers, truck drivers, warehouse workers and seafarers",
    ref: ["Psalm 107:23–31", "PSA.107.23-31"], pins: [[33.74, -118.27], [33.75, -118.21]] },

  { t: "r", r: "sfv", title: "San Fernando Valley",
    
    who: ["Close to two million people, from Glendale and Burbank in the east to Calabasas in the west.", "Latino families across the northeast Valley in Pacoima, Sylmar, Panorama City and Arleta.", "A large Armenian community, centered in Glendale and Burbank.", "Filipino, Thai, Persian and Jewish communities, and studio workers in Burbank and Studio City."], pp: "the people of the San Fernando Valley",
    ref: ["Isaiah 40:4–5", "ISA.40.4-5"] },
  { t: "p", r: "sfv", title: "Glendale & Burbank", places: ["Glendale", "Burbank", "Atwater Village"], at: [34.165, -118.28] },
  { t: "p", r: "sfv", title: "North Hollywood & Studio City", places: ["North Hollywood", "Studio City", "Valley Village", "Sherman Oaks", "Toluca Lake", "Universal City"], at: [34.16, -118.39] },
  { t: "p", r: "sfv", title: "Van Nuys & Lake Balboa", places: ["Van Nuys", "Lake Balboa", "Valley Glen"], at: [34.19, -118.47] },
  { t: "p", r: "sfv", title: "Pacoima, Sylmar & San Fernando", places: ["Panorama City", "Arleta", "Pacoima", "North Hills", "Sylmar", "San Fernando", "Mission Hills"], at: [34.265, -118.435] },
  { t: "p", r: "sfv", title: "Northridge, Granada Hills & Porter Ranch", places: ["Northridge", "Granada Hills", "Porter Ranch"], at: [34.26, -118.53] },
  { t: "p", r: "sfv", title: "Reseda, Canoga Park & Winnetka", places: ["Reseda", "Canoga Park", "Winnetka"], at: [34.2, -118.57] },
  { t: "p", r: "sfv", title: "Encino, Tarzana & Woodland Hills", places: ["Encino", "Tarzana", "Woodland Hills"], at: [34.165, -118.55] },
  { t: "p", r: "sfv", title: "Sun Valley, Sunland-Tujunga & La Crescenta", places: ["Sun Valley", "Sunland-Tujunga", "La Crescenta-Montrose", "La Cañada Flintridge", "Lake View Terrace", "Shadow Hills"], at: [34.24, -118.3] },
  { t: "p", r: "sfv", title: "Chatsworth, Calabasas & Agoura Hills", places: ["Chatsworth", "West Hills", "Calabasas", "Agoura Hills", "Westlake Village", "Hidden Hills"], at: [34.18, -118.68] },
  { t: "f", title: "Armenian",
    who: ["Glendale, Burbank, North Hollywood and Little Armenia in East Hollywood.", "Families who came by way of Armenia, Iran, Lebanon and Syria.", "Armenian Apostolic, Catholic and evangelical churches."], pp: "Armenian families in LA",
    ref: ["Psalm 67:1–3", "PSA.67.1-3"], peoples: ["armenian"] },

  { t: "r", r: "av", title: "Antelope & Santa Clarita Valleys",
    
    who: ["Families in Santa Clarita, Lancaster and Palmdale, many commuting long hours into the LA basin.", "Aerospace and military workers at Edwards Air Force Base and Air Force Plant 42.", "Small desert and mountain towns such as Acton, Littlerock and Lake Los Angeles.", "Growing Latino and Black communities in the Antelope Valley."], pp: "the people of the Antelope and Santa Clarita valleys",
    ref: ["Isaiah 35:1–2", "ISA.35.1-2"] },
  { t: "p", r: "av", title: "Santa Clarita", places: ["Valencia", "Newhall", "Saugus", "Canyon Country", "Stevenson Ranch"], at: [34.4, -118.54] },
  { t: "p", r: "av", title: "Lancaster", places: ["Lancaster", "Quartz Hill", "Antelope Acres", "Leona Valley", "Lake Hughes"], at: [34.69, -118.15] },
  { t: "p", r: "av", title: "Palmdale & the mountain towns", places: ["Palmdale", "Littlerock", "Lake Los Angeles", "Pearblossom", "Llano", "Sun Village & Juniper Hills", "Acton", "Agua Dulce", "Castaic", "Gorman & Val Verde"], at: [34.525, -118.175] },
  { t: "f", title: "Schools and teachers",
    
    who: ["Students in LA Unified, the second-largest school district in the country, and in dozens of other districts.", "Teachers, aides, counselors, coaches and custodians.", "Many students learning English, and many from low-income families.", "Parents juggling work and school schedules."], pp: "students, teachers and school staff",
    ref: ["Proverbs 22:6", "PRO.22.6"] },

  { t: "r", r: "sgv", title: "San Gabriel Valley",
    
    who: ["Large Chinese and Taiwanese American communities in Alhambra, San Gabriel, Monterey Park, Arcadia and Rowland Heights.", "Vietnamese and other Southeast Asian families in Rosemead and El Monte.", "Latino families across Baldwin Park, El Monte, La Puente and Pomona.", "Students at Caltech, Cal Poly Pomona and the Claremont Colleges."], pp: "the people of the San Gabriel Valley",
    ref: ["Revelation 7:9–10", "REV.7.9-10"] },
  { t: "p", r: "sgv", title: "Pasadena, Altadena & South Pasadena", places: ["Pasadena", "Altadena", "South Pasadena", "San Marino", "East Pasadena"], at: [34.16, -118.14] },
  { t: "p", r: "sgv", title: "Alhambra, San Gabriel & Monterey Park", places: ["Alhambra", "San Gabriel", "Monterey Park"], at: [34.07, -118.13] },
  { t: "p", r: "sgv", title: "Arcadia, Rosemead & El Monte", places: ["Arcadia", "Temple City", "Rosemead", "Sierra Madre", "South San Gabriel", "El Monte", "South El Monte"], at: [34.087, -118.04] },
  { t: "p", r: "sgv", title: "Monrovia, Duarte & Azusa", places: ["Monrovia", "Duarte", "Azusa", "Irwindale", "Bradbury"], at: [34.14, -117.95] },
  { t: "p", r: "sgv", title: "Covina, West Covina & Baldwin Park", places: ["Covina", "West Covina", "Baldwin Park", "Glendora", "San Dimas", "Charter Oak", "Citrus"], at: [34.07, -117.92] },
  { t: "p", r: "sgv", title: "Pomona, Claremont & La Verne", places: ["Pomona", "Claremont", "La Verne"], at: [34.07, -117.75] },
  { t: "p", r: "sgv", title: "Diamond Bar, Walnut & Rowland Heights", places: ["Diamond Bar", "Walnut", "Rowland Heights", "City of Industry"], at: [33.99, -117.85] },
  { t: "p", r: "sgv", title: "Hacienda Heights, La Puente & Whittier", places: ["Hacienda Heights", "La Puente", "Whittier", "La Habra Heights", "Avocado Heights", "Valinda", "South Whittier"], at: [33.99, -118.0] },
  { t: "f", title: "Chinese and Taiwanese",
    who: ["Alhambra, Monterey Park, San Gabriel, Arcadia, Rowland Heights and Diamond Bar.", "Chinatown, and growing communities in Irvine.", "International students at UCLA, USC, UC Irvine and Cal State campuses."], pp: "Chinese and Taiwanese families in LA and OC",
    ref: ["Isaiah 49:12", "ISA.49.12"], peoples: ["chinese",  "taiwanese"] },

  { t: "r", r: "south", title: "South LA & Gateway Cities",
    
    who: ["Black families with deep roots in South LA, Inglewood and Compton.", "Latino families, who now make up most of the population in many of these neighborhoods.", "Working cities along the 710 and 605 freeways, such as South Gate, Huntington Park, Downey and Norwalk.", "Churches that have served these communities for generations."], pp: "the people of South LA and the Gateway Cities",
    ref: ["Micah 6:8", "MIC.6.8"] },
  { t: "p", r: "south", title: "South LA", places: ["Exposition Park", "Vermont Square", "Florence", "Hyde Park", "Crenshaw", "Leimert Park", "Baldwin Hills", "Green Meadows"], at: [33.98, -118.3] },
  { t: "p", r: "south", title: "Watts, Compton & Lynwood", places: ["Watts", "Willowbrook", "Florence-Firestone", "Compton", "Lynwood", "Paramount", "East Rancho Dominguez"], at: [33.92, -118.23] },
  { t: "p", r: "south", title: "Inglewood & Hawthorne", places: ["Inglewood", "Hawthorne", "Lennox", "View Park-Windsor Hills", "Westmont", "West Athens", "Del Aire"], at: [33.94, -118.35] },
  { t: "p", r: "south", title: "Huntington Park, South Gate & Bell", places: ["Huntington Park", "South Gate", "Bell", "Bell Gardens", "Cudahy", "Maywood", "Walnut Park", "Vernon"], at: [33.97, -118.2] },
  { t: "p", r: "south", title: "Downey, Norwalk & Bellflower", places: ["Downey", "Norwalk", "Bellflower", "Santa Fe Springs", "La Mirada"], at: [33.9, -118.11] },
  { t: "p", r: "south", title: "Montebello, Pico Rivera & Commerce", places: ["Montebello", "Pico Rivera", "Commerce", "West Whittier-Los Nietos"], at: [34.0, -118.11] },
  { t: "p", r: "south", title: "Lakewood, Cerritos & Artesia", places: ["Lakewood", "Cerritos", "Artesia", "Hawaiian Gardens"], at: [33.86, -118.09] },
  { t: "f", title: "South Asian",
    who: ["Little India in Artesia, and families across Cerritos, Irvine and the Valley.", "Little Bangladesh in Koreatown, and Sikh gurdwaras across both counties.", "Hindu, Muslim and Sikh neighbors, from some of the largest unreached peoples on earth."], pp: "Indian, Pakistani, Bangladeshi, Sri Lankan, Nepali and Sikh families",
    ref: ["Malachi 1:11", "MAL.1.11"], peoples: ["indian",  "sikh",  "pakistani",  "bangladeshi",  "srilankan",  "nepali"] },
  { t: "f", title: "Latino families",
    
    who: ["About half of LA County and about a third of Orange County is Latino.", "Families whose roots here go back generations, and families who arrived recently.", "Many from Mexico and Central America, including Guatemala and El Salvador.", "Spanish-speaking households, and bilingual young people moving between two cultures."], pp: "Latino families across LA and OC",
    ref: ["Deuteronomy 10:18–19", "DEU.10.18-19"] },

  { t: "r", r: "lb", title: "Long Beach",
    
    who: ["California's seventh-largest city.", "One of the largest Cambodian communities outside Cambodia, in Cambodia Town.", "Workers at the Port of Long Beach and students at Cal State Long Beach.", "Neighborhoods from North Long Beach to Belmont Shore and Naples."], pp: "the people of Long Beach",
    ref: ["Psalm 24:1", "PSA.24.1"] },
  { t: "p", r: "lb", title: "Downtown & Central Long Beach", places: ["Downtown Long Beach", "Cambodia Town", "Central Long Beach", "Wrigley", "Alamitos Beach", "West Long Beach"], at: [33.78, -118.19] },
  { t: "p", r: "lb", title: "North Long Beach & Bixby Knolls", places: ["North Long Beach", "Bixby Knolls", "Houghton Park", "California Heights", "Los Cerritos"], at: [33.86, -118.18] },
  { t: "p", r: "lb", title: "East Long Beach & Signal Hill", places: ["Signal Hill", "Belmont Shore", "Los Altos", "Naples", "Belmont Heights", "Lakewood Village"], at: [33.78, -118.13] },
  { t: "f", title: "Cambodian and Southeast Asian",
    who: ["Cambodia Town in Long Beach, the largest Cambodian community outside Cambodia.", "Thai Town in East Hollywood, and Lao and Hmong families.", "Buddhist and Muslim neighbors from Myanmar, Indonesia and Malaysia."], pp: "Cambodian, Thai, Lao, Burmese and Indonesian families",
    ref: ["Isaiah 52:15", "ISA.52.15"], peoples: ["cambodian",  "thai",  "laotian",  "hmong",  "burmese",  "indonesian",  "malaysian"] },
  { t: "f", title: "Pacific Islander",
    who: ["Carson, Long Beach, Wilmington and the harbor.", "Samoan and Tongan churches, ready to be sent.", "Families, young people and elders far from their islands."], pp: "Samoan, Tongan, Fijian and Marshallese families",
    ref: ["Isaiah 42:10–12", "ISA.42.10-12"], peoples: ["samoan",  "tongan",  "fijian",  "marshallese"] },
  { t: "f", title: "Universities and students",
    
    who: ["Students and staff at UCLA, USC, UC Irvine and the Cal State campuses in Long Beach, Fullerton, Northridge and Los Angeles.", "Private colleges such as Pepperdine, Chapman, Biola and Loyola Marymount, and many community colleges.", "International students from around the world.", "Professors, researchers and campus workers."], pp: "students, staff and faculty",
    ref: ["1 Timothy 4:12", "1TI.4.12"], pins: [[34.07, -118.445], [34.02, -118.285], [33.646, -117.843], [33.783, -118.114], [33.883, -117.885], [34.24, -118.53]] },

  { t: "r", r: "noc", title: "North County",
    
    who: ["Fullerton, Anaheim, Brea and the cities along the LA County line.", "Disneyland Resort and Angel Stadium, and the hotel, restaurant and theme park workers who staff them.", "Arab American families and businesses in Anaheim's Little Arabia.", "Korean communities in Buena Park and Fullerton, and students at Cal State Fullerton."], pp: "the people of North Orange County",
    ref: ["Psalm 67:1–4", "PSA.67.1-4"] },
  { t: "p", r: "noc", title: "Fullerton", places: ["Fullerton", "Sunny Hills", "Downtown Fullerton"], at: [33.87, -117.925] },
  { t: "p", r: "noc", title: "Anaheim", places: ["West Anaheim", "Central Anaheim", "Anaheim Resort", "Platinum Triangle", "Little Arabia"], at: [33.835, -117.915] },
  { t: "p", r: "noc", title: "Yorba Linda, Brea & La Habra", places: ["Anaheim Hills", "Yorba Linda", "Placentia", "Brea", "La Habra"], at: [33.897, -117.855] },
  { t: "p", r: "noc", title: "Buena Park, La Palma & Cypress", places: ["Buena Park", "La Palma", "Cypress"], at: [33.84, -118.02] },
  { t: "f", title: "Arab, Assyrian and North African",
    who: ["Little Arabia in Anaheim, and families across North and Central Orange County.", "Families from Egypt, Lebanon, Syria, Iraq, Palestine, Jordan and Morocco.", "Coptic, Assyrian and Chaldean believers, well placed to reach their Muslim neighbors."], pp: "Arab, Assyrian, Chaldean and North African families",
    ref: ["Isaiah 19:23–25", "ISA.19.23-25"], peoples: ["arab",  "egyptian",  "lebanese",  "syrian",  "iraqi",  "palestinian",  "jordanian",  "moroccan",  "assyrian"] },
  { t: "r", r: "coc", title: "Central County",
    
    who: ["Santa Ana, the county seat, where most residents are Latino.", "Some of the most crowded neighborhoods in Orange County.", "Courts, county offices and the people who work in and pass through them.", "Vietnamese and Korean communities in Garden Grove, and the historic center of Orange."], pp: "the people of Central Orange County",
    ref: ["Jeremiah 29:7", "JER.29.7"] },
  { t: "p", r: "coc", title: "Santa Ana", places: ["Downtown Santa Ana", "Logan", "Lacy", "Delhi", "South Coast Metro", "French Park", "Floral Park", "Washington Square"], at: [33.745, -117.868] },
  { t: "p", r: "coc", title: "Orange & Villa Park", places: ["Orange", "Old Towne Orange", "Villa Park", "El Modena", "Orange Park Acres"], at: [33.79, -117.84] },
  { t: "p", r: "coc", title: "Tustin", places: ["Tustin", "Tustin Legacy", "North Tustin"], at: [33.74, -117.82] },
  { t: "p", r: "coc", title: "Garden Grove & Stanton", places: ["Garden Grove", "Stanton", "Koreatown OC"], at: [33.775, -117.96] },

  { t: "r", r: "woc", title: "West County",
    
    who: ["Little Saigon in Westminster and Garden Grove, the largest Vietnamese community outside Vietnam.", "Huntington Beach and the surf and beach communities along the coast.", "Seal Beach, Los Alamitos and Rossmoor, next to the Joint Forces Training Base.", "Families in Fountain Valley, Midway City and Stanton."], pp: "the people of West Orange County",
    ref: ["Acts 17:26–27", "ACT.17.26-27"] },
  { t: "p", r: "woc", title: "Huntington Beach", places: ["Huntington Beach", "Huntington Harbour", "Downtown HB", "Sunset Beach"], at: [33.68, -118.0] },
  { t: "p", r: "woc", title: "Westminster & Fountain Valley", places: ["Westminster", "Little Saigon", "Midway City", "Fountain Valley", "Mile Square"], at: [33.733, -117.97] },
  { t: "p", r: "woc", title: "Seal Beach & Los Alamitos", places: ["Seal Beach", "Los Alamitos", "Rossmoor", "Surfside"], at: [33.78, -118.07] },
  { t: "f", title: "Vietnamese",
    who: ["Little Saigon in Westminster and Garden Grove, the largest Vietnamese community outside Vietnam.", "Elders who came as refugees, and their children and grandchildren.", "Buddhist temples, Catholic parishes and Vietnamese evangelical churches."], pp: "Vietnamese families in LA and OC",
    ref: ["Psalm 86:9", "PSA.86.9"], peoples: ["vietnamese"] },
  { t: "r", r: "soc", title: "South County",
    
    who: ["Irvine, with UC Irvine and a large Asian American and international population.", "Planned communities such as Mission Viejo, Lake Forest, Rancho Santa Margarita and Ladera Ranch.", "San Juan Capistrano and San Clemente, near the San Diego County line and Camp Pendleton.", "Many retirees, including in Laguna Woods."], pp: "the people of South Orange County",
    ref: ["Matthew 9:36–38", "MAT.9.36-38"] },
  { t: "p", r: "soc", title: "Irvine", places: ["Irvine", "University Park (Irvine)", "Woodbridge", "Great Park", "Turtle Rock", "Northwood"], at: [33.685, -117.8] },
  { t: "p", r: "soc", title: "Lake Forest, Laguna Hills & Aliso Viejo", places: ["Lake Forest", "Laguna Hills", "Aliso Viejo", "Laguna Woods", "Foothill Ranch", "Portola Hills"], at: [33.63, -117.7] },
  { t: "p", r: "soc", title: "Mission Viejo & Laguna Niguel", places: ["Mission Viejo", "Laguna Niguel"], at: [33.58, -117.68] },
  { t: "p", r: "soc", title: "Rancho Santa Margarita & Ladera Ranch", places: ["Rancho Santa Margarita", "Ladera Ranch", "Coto de Caza", "Trabuco Canyon", "Las Flores", "Rancho Mission Viejo", "Silverado"], at: [33.6, -117.6] },
  { t: "p", r: "soc", title: "San Juan Capistrano & San Clemente", places: ["San Juan Capistrano", "San Clemente", "Talega"], at: [33.47, -117.63] },
  { t: "r", r: "coast", title: "Coastal OC",
    
    who: ["Newport Beach, Costa Mesa, Laguna Beach and Dana Point.", "Harbor, tourism, hotel and restaurant workers, many of whom commute in.", "Artists and galleries in Laguna Beach.", "Students at Orange Coast College and Vanguard University in Costa Mesa."], pp: "the people of coastal Orange County",
    ref: ["Psalm 95:4–7", "PSA.95.4-7"] },
  { t: "p", r: "coast", title: "Newport Beach & Costa Mesa", places: ["Newport Beach", "Costa Mesa", "Balboa", "Corona del Mar", "Newport Coast", "Lido Isle"], at: [33.64, -117.9] },
  { t: "p", r: "coast", title: "Laguna Beach & Dana Point", places: ["Laguna Beach", "Emerald Bay & South Laguna", "Dana Point", "Monarch Beach & Lantern District", "Capistrano Beach"], at: [33.505, -117.74] },

  { t: "f", sec: "Across both counties", title: "Hospitals and healthcare workers",
    
    who: ["Nurses, doctors, aides, technicians and hospital cleaners.", "Patients and families at large medical centers such as Cedars-Sinai, UCLA, Children's Hospital Los Angeles and UCI Health.", "County hospitals and community clinics serving people without insurance.", "Chaplains and hospice workers."], pp: "healthcare workers, patients and their families",
    ref: ["Matthew 11:28–30", "MAT.11.28-30"] },
  { t: "f", title: "First responders and city leaders",
    
    who: ["Police officers, sheriff's deputies, firefighters and paramedics.", "Mayors, city councils and county supervisors across 122 cities and two counties.", "Dispatchers, court staff and other public workers.", "The families of all of these."], pp: "first responders, public servants and their families",
    ref: ["1 Timothy 2:1–4", "1TI.2.1-4"] },
  { t: "f", title: "Laborers and churches praying together",
    
    who: ["Churches of many languages and traditions across both counties.", "Believers already making disciples in their neighborhoods, workplaces and schools.", "Ministries serving the poor, immigrants, students and families."], pp: null,
    ref: ["Luke 10:1–3", "LUK.10.1-3"] },

  { t: "a", title: "No place left in Los Angeles and Orange County",
    desc: "The last day. Look back over the map you have prayed across, and ask God to finish what He has started.",
    who: ["Every neighborhood, city and community you have prayed through."], pp: "people in every place across LA and OC",
    ref: ["Romans 15:18–23", "ROM.15.18-23"] },
];

// Spanish for every piece of English content that is not a place name. Anything missing falls back to English.
export const ES: Record<string, string> = {
  // people-group days
  "Korean": "Coreanos",
  "Korean families in LA and OC": "las familias coreanas de LA y OC",
  "Koreatown, among the most densely populated neighborhoods in the country, and Koreatown OC in Garden Grove and Buena Park.": "Koreatown, uno de los barrios más densamente poblados del país, y el Koreatown de OC en Garden Grove y Buena Park.",
  "Hundreds of Korean churches, many already sending workers to the nations.": "Cientos de iglesias coreanas, muchas de las cuales ya envían obreros a las naciones.",
  "Students, young professionals, small-business owners and recent arrivals.": "Estudiantes, jóvenes profesionales, dueños de pequeños negocios y recién llegados.",
  "Filipino": "Filipinos",
  "Filipino families in LA and OC": "las familias filipinas de LA y OC",
  "Historic Filipinotown, Eagle Rock, West Covina, Cerritos and Carson.": "Historic Filipinotown, Eagle Rock, West Covina, Cerritos y Carson.",
  "Nurses, caregivers and healthcare workers in hospitals across both counties.": "Enfermeras, cuidadores y trabajadores de la salud en hospitales de ambos condados.",
  "Filipino churches and fellowships with a heart for the nations.": "Iglesias y comunidades filipinas con un corazón por las naciones.",
  "Ethiopian, Eritrean and African": "Etíopes, eritreos y africanos",
  "Ethiopian, Eritrean, Somali, Nigerian and other African families": "las familias etíopes, eritreas, somalíes, nigerianas y de otros países africanos",
  "Little Ethiopia on Fairfax Avenue, with its restaurants, shops and churches.": "Little Ethiopia en Fairfax Avenue, con sus restaurantes, tiendas e iglesias.",
  "Nigerian and Ghanaian families and churches in Inglewood, Long Beach and the Inland edges of LA.": "Familias e iglesias nigerianas y ghanesas en Inglewood, Long Beach y las orillas del interior de LA.",
  "Oromo, Somali and Sudanese families, from some of the least reached peoples of Africa.": "Familias oromo, somalíes y sudanesas, de algunos de los pueblos menos alcanzados de África.",
  "Persian, Israeli and Central Asian": "Persas, israelíes y de Asia Central",
  "Persian, Israeli, Afghan and Central Asian families": "las familias persas, israelíes, afganas y de Asia Central",
  "Westwood, Beverly Hills and the Westside, home to one of the largest Persian communities outside Iran, Muslim, Jewish and Baha’i.": "Westwood, Beverly Hills y el Westside, hogar de una de las comunidades persas más grandes fuera de Irán, musulmana, judía y bahaí.",
  "Israelis in the San Fernando Valley and on the Westside.": "Israelíes en el Valle de San Fernando y en el Westside.",
  "Afghan families who arrived in recent years, and Turkish, Uzbek and Mongolian neighbors.": "Familias afganas que llegaron en los últimos años, y vecinos turcos, uzbekos y mongoles.",
  "Japanese": "Japoneses",
  "Japanese families in LA and OC": "las familias japonesas de LA y OC",
  "Little Tokyo, Sawtelle, Gardena and Torrance.": "Little Tokyo, Sawtelle, Gardena y Torrance.",
  "Japanese companies and their families in the South Bay, many here for a few years only.": "Empresas japonesas y sus familias en el South Bay, muchas aquí solo por unos años.",
  "Japanese American families who have lived here for generations.": "Familias japonesas-estadounidenses que han vivido aquí por generaciones.",
  "Armenian": "Armenios",
  "Armenian families in LA": "las familias armenias de LA",
  "Glendale, Burbank, North Hollywood and Little Armenia in East Hollywood.": "Glendale, Burbank, North Hollywood y Little Armenia en el este de Hollywood.",
  "Families who came by way of Armenia, Iran, Lebanon and Syria.": "Familias que llegaron desde Armenia, Irán, Líbano y Siria.",
  "Armenian Apostolic, Catholic and evangelical churches.": "Iglesias apostólicas armenias, católicas y evangélicas.",
  "Chinese and Taiwanese": "Chinos y taiwaneses",
  "Chinese and Taiwanese families in LA and OC": "las familias chinas y taiwanesas de LA y OC",
  "Alhambra, Monterey Park, San Gabriel, Arcadia, Rowland Heights and Diamond Bar.": "Alhambra, Monterey Park, San Gabriel, Arcadia, Rowland Heights y Diamond Bar.",
  "Chinatown, and growing communities in Irvine.": "Chinatown, y comunidades en crecimiento en Irvine.",
  "International students at UCLA, USC, UC Irvine and Cal State campuses.": "Estudiantes internacionales en UCLA, USC, UC Irvine y los campus de Cal State.",
  "South Asian": "Sudasiáticos",
  "Indian, Pakistani, Bangladeshi, Sri Lankan, Nepali and Sikh families": "las familias indias, pakistaníes, bangladesíes, esrilanquesas, nepalíes y sijs",
  "Little India in Artesia, and families across Cerritos, Irvine and the Valley.": "Little India en Artesia, y familias en Cerritos, Irvine y el Valle.",
  "Little Bangladesh in Koreatown, and Sikh gurdwaras across both counties.": "Little Bangladesh en Koreatown, y templos sijs en ambos condados.",
  "Hindu, Muslim and Sikh neighbors, from some of the largest unreached peoples on earth.": "Vecinos hindúes, musulmanes y sijs, de algunos de los pueblos no alcanzados más grandes de la tierra.",
  "Cambodian and Southeast Asian": "Camboyanos y del sudeste asiático",
  "Cambodian, Thai, Lao, Burmese and Indonesian families": "las familias camboyanas, tailandesas, laosianas, birmanas e indonesias",
  "Cambodia Town in Long Beach, the largest Cambodian community outside Cambodia.": "Cambodia Town en Long Beach, la comunidad camboyana más grande fuera de Camboya.",
  "Thai Town in East Hollywood, and Lao and Hmong families.": "Thai Town en el este de Hollywood, y familias laosianas y hmong.",
  "Buddhist and Muslim neighbors from Myanmar, Indonesia and Malaysia.": "Vecinos budistas y musulmanes de Myanmar, Indonesia y Malasia.",
  "Pacific Islander": "Isleños del Pacífico",
  "Samoan, Tongan, Fijian and Marshallese families": "las familias samoanas, tonganas, fiyianas y marshalesas",
  "Carson, Long Beach, Wilmington and the harbor.": "Carson, Long Beach, Wilmington y el puerto.",
  "Samoan and Tongan churches, ready to be sent.": "Iglesias samoanas y tonganas, listas para ser enviadas.",
  "Families, young people and elders far from their islands.": "Familias, jóvenes y ancianos lejos de sus islas.",
  "Arab, Assyrian and North African": "Árabes, asirios y norteafricanos",
  "Arab, Assyrian, Chaldean and North African families": "las familias árabes, asirias, caldeas y norteafricanas",
  "Little Arabia in Anaheim, and families across North and Central Orange County.": "Little Arabia en Anaheim, y familias en el norte y el centro del Condado de Orange.",
  "Families from Egypt, Lebanon, Syria, Iraq, Palestine, Jordan and Morocco.": "Familias de Egipto, Líbano, Siria, Irak, Palestina, Jordania y Marruecos.",
  "Coptic, Assyrian and Chaldean believers, well placed to reach their Muslim neighbors.": "Creyentes coptos, asirios y caldeos, bien ubicados para alcanzar a sus vecinos musulmanes.",
  "Vietnamese": "Vietnamitas",
  "Vietnamese families in LA and OC": "las familias vietnamitas de LA y OC",
  "Elders who came as refugees, and their children and grandchildren.": "Ancianos que llegaron como refugiados, y sus hijos y nietos.",
  "Buddhist temples, Catholic parishes and Vietnamese evangelical churches.": "Templos budistas, parroquias católicas e iglesias evangélicas vietnamitas.",
  // regions and group names
  "Central & Downtown LA": "Centro y Downtown de LA", "Westside & South Bay": "Westside y South Bay",
  "San Fernando Valley": "Valle de San Fernando", "Antelope & Santa Clarita Valleys": "Valles de Antelope y Santa Clarita",
  "San Gabriel Valley": "Valle de San Gabriel", "South LA & Gateway Cities": "Sur de LA y Gateway Cities",
  "North County": "Norte del Condado de Orange", "Central County": "Centro del Condado de Orange",
  "West County": "Oeste del Condado de Orange", "South County": "Sur del Condado de Orange", "Coastal OC": "Costa del Condado de Orange",
  "Boyle Heights & East LA": "Boyle Heights y el Este de LA", "Northeast LA": "Noreste de LA", "South LA": "Sur de LA",
  "Beach Cities": "Ciudades de playa (Beach Cities)", "Palos Verdes Peninsula": "Península de Palos Verdes",
  "Acton, Agua Dulce & the mountain towns": "Acton, Agua Dulce y los pueblos de montaña",
  "Downtown & Central Long Beach": "Centro de Long Beach", "East Long Beach & Signal Hill": "Este de Long Beach y Signal Hill",
  // whole-area and focus day titles
  "All of Los Angeles and Orange County": "Todo Los Ángeles y el Condado de Orange",
  "People experiencing homelessness": "Personas sin hogar",
  "Hollywood and the entertainment industry": "Hollywood y la industria del entretenimiento",
  "Communities rebuilding after the fires": "Comunidades que se reconstruyen después de los incendios",
  "The ports and freight workers": "Los puertos y los trabajadores de carga",
  "Schools and teachers": "Escuelas y maestros",
  "Asian and Pacific Islander communities": "Comunidades asiáticas y de las islas del Pacífico",
  "Latino families": "Familias latinas", "Universities and students": "Universidades y estudiantes",
  "Middle Eastern, Armenian and Persian communities": "Comunidades del Medio Oriente, armenias y persas",
  "Hospitals and healthcare workers": "Hospitales y trabajadores de la salud",
  "First responders and city leaders": "Personal de emergencia y líderes de la ciudad",
  "Laborers and churches praying together": "Obreros e iglesias orando juntos",
  "No place left in Los Angeles and Orange County": "Que no quede ningún lugar en Los Ángeles y el Condado de Orange",
  "The last day. Look back over the map you have prayed across, and ask God to finish what He has started.":
    "El último día. Mira el mapa por el que has orado y pídele a Dios que termine lo que ha comenzado.",
  // who's here, and the people each day prays for
  "Nearly 13 million people: about 9.7 million in LA County and 3.2 million in Orange County.": "Casi 13 millones de personas: alrededor de 9.7 millones en el Condado de Los Ángeles y 3.2 millones en el Condado de Orange.",
  "88 cities in LA County and 34 in Orange County, plus large unincorporated communities such as East Los Angeles.": "88 ciudades en el Condado de Los Ángeles y 34 en el Condado de Orange, además de grandes comunidades no incorporadas como el Este de Los Ángeles.",
  "People from almost every nation, speaking more than 100 languages at home.": "Personas de casi todas las naciones, que hablan más de 100 idiomas en casa.",
  "High-rise apartments downtown, suburbs, beach towns, desert towns and mountain communities.": "Edificios de apartamentos en el centro, suburbios, pueblos de playa, pueblos del desierto y comunidades en las montañas.",
  "everyone who lives in Los Angeles and Orange County": "todos los que viven en Los Ángeles y el Condado de Orange",
  "Downtown office workers, residents of new high-rises, and the people of Skid Row, a few blocks apart.": "Trabajadores de oficina del centro, residentes de nuevos rascacielos y la gente de Skid Row, a pocas cuadras de distancia.",
  "Korean, Latino, Armenian, Thai and Filipino communities in Koreatown, Little Armenia, Thai Town and Historic Filipinotown.": "Comunidades coreanas, latinas, armenias, tailandesas y filipinas en Koreatown, Little Armenia, Thai Town e Historic Filipinotown.",
  "Long-rooted Latino families in Boyle Heights, East LA and Northeast LA.": "Familias latinas con raíces profundas en Boyle Heights, el Este de LA y el Noreste de LA.",
  "Artists, students and young professionals in Echo Park, Silver Lake and Hollywood.": "Artistas, estudiantes y jóvenes profesionales en Echo Park, Silver Lake y Hollywood.",
  "the people of Central and Downtown LA": "la gente del centro de Los Ángeles",
  "Tens of thousands of people across LA County without a home on any given night.": "Decenas de miles de personas en el Condado de Los Ángeles sin hogar en cualquier noche.",
  "Skid Row in Downtown LA, one of the largest concentrations of unhoused people in the country.": "Skid Row, en el centro de Los Ángeles, una de las mayores concentraciones de personas sin hogar del país.",
  "People living in tents, vehicles and shelters, including many who recently lost a job or a place to live.": "Personas que viven en carpas, vehículos y albergues, incluidas muchas que perdieron hace poco su trabajo o su vivienda.",
  "Outreach workers, shelter staff, case managers and churches serving on the streets.": "Trabajadores de alcance, personal de albergues, trabajadores sociales e iglesias que sirven en las calles.",
  "people experiencing homelessness, and those who serve them": "las personas sin hogar y quienes les sirven",
  "Actors, writers, directors, musicians and crew members.": "Actores, guionistas, directores, músicos y equipos de producción.",
  "Studios and production lots in Hollywood, Burbank, Studio City and Culver City.": "Estudios y sets de filmación en Hollywood, Burbank, Studio City y Culver City.",
  "Many young people who moved to LA to pursue a career in entertainment.": "Muchos jóvenes que se mudaron a Los Ángeles para seguir una carrera en el entretenimiento.",
  "Workers behind the scenes: editors, set builders, costume and makeup artists, drivers.": "Trabajadores detrás de cámaras: editores, constructores de escenarios, vestuaristas, maquillistas y choferes.",
  "people who work in film, television and music": "quienes trabajan en el cine, la televisión y la música",
  "Beach cities and coastal neighborhoods from Malibu to Palos Verdes.": "Ciudades de playa y vecindarios costeros desde Malibu hasta Palos Verdes.",
  "Students and staff at UCLA, and people working in tech, aerospace and at LAX.": "Estudiantes y personal de UCLA, y personas que trabajan en tecnología, la industria aeroespacial y LAX.",
  "Harbor communities in San Pedro and Wilmington, next to the Port of Los Angeles.": "Comunidades portuarias en San Pedro y Wilmington, junto al Puerto de Los Ángeles.",
  "Japanese American and other Asian communities in Gardena, Torrance and Sawtelle.": "Comunidades japonesas americanas y otras comunidades asiáticas en Gardena, Torrance y Sawtelle.",
  "the people of the Westside and South Bay": "la gente del Westside y el South Bay",
  "Families from Pacific Palisades, Malibu and Altadena whose homes burned in January 2025.": "Familias de Pacific Palisades, Malibu y Altadena cuyas casas se quemaron en enero de 2025.",
  "Many still living in temporary housing, with relatives, or in other cities.": "Muchas todavía viven en vivienda temporal, con familiares o en otras ciudades.",
  "Longtime Altadena residents, including Black families who had owned their homes for generations.": "Residentes de Altadena de muchos años, incluidas familias afroamericanas que habían sido dueñas de sus casas por generaciones.",
  "Firefighters, builders, insurance workers and volunteers involved in rebuilding.": "Bomberos, constructores, trabajadores de seguros y voluntarios que participan en la reconstrucción.",
  "families affected by the Palisades and Eaton fires": "las familias afectadas por los incendios de Palisades y Eaton",
  "Dockworkers, crane operators and longshore crews at the Ports of Los Angeles and Long Beach.": "Estibadores, operadores de grúas y cuadrillas portuarias en los Puertos de Los Ángeles y Long Beach.",
  "Truck drivers who move containers between the ports, rail yards and warehouses.": "Choferes de camiones que transportan contenedores entre los puertos, los patios de ferrocarril y las bodegas.",
  "Warehouse and logistics workers, many on night and weekend shifts.": "Trabajadores de bodegas y logística, muchos en turnos de noche y de fin de semana.",
  "Sailors from around the world on ships docked in the harbor.": "Marineros de todo el mundo en barcos atracados en el puerto.",
  "dockworkers, truck drivers, warehouse workers and seafarers": "los estibadores, choferes de camiones, trabajadores de bodegas y marineros",
  "Close to two million people, from Glendale and Burbank in the east to Calabasas in the west.": "Cerca de dos millones de personas, desde Glendale y Burbank en el este hasta Calabasas en el oeste.",
  "Latino families across the northeast Valley in Pacoima, Sylmar, Panorama City and Arleta.": "Familias latinas en el noreste del valle, en Pacoima, Sylmar, Panorama City y Arleta.",
  "A large Armenian community, centered in Glendale and Burbank.": "Una gran comunidad armenia, con su centro en Glendale y Burbank.",
  "Filipino, Thai, Persian and Jewish communities, and studio workers in Burbank and Studio City.": "Comunidades filipinas, tailandesas, persas y judías, y trabajadores de los estudios en Burbank y Studio City.",
  "the people of the San Fernando Valley": "la gente del Valle de San Fernando",
  "Families in Santa Clarita, Lancaster and Palmdale, many commuting long hours into the LA basin.": "Familias en Santa Clarita, Lancaster y Palmdale, muchas viajando largas horas para trabajar en la cuenca de Los Ángeles.",
  "Aerospace and military workers at Edwards Air Force Base and Air Force Plant 42.": "Trabajadores aeroespaciales y militares en la Base Aérea Edwards y la Planta 42 de la Fuerza Aérea.",
  "Small desert and mountain towns such as Acton, Littlerock and Lake Los Angeles.": "Pequeños pueblos del desierto y de montaña como Acton, Littlerock y Lake Los Angeles.",
  "Growing Latino and Black communities in the Antelope Valley.": "Comunidades latinas y afroamericanas en crecimiento en el Valle de Antelope.",
  "the people of the Antelope and Santa Clarita valleys": "la gente de los valles de Antelope y Santa Clarita",
  "Students in LA Unified, the second-largest school district in the country, and in dozens of other districts.": "Estudiantes del LAUSD, el segundo distrito escolar más grande del país, y de docenas de otros distritos.",
  "Teachers, aides, counselors, coaches and custodians.": "Maestros, asistentes, consejeros, entrenadores y conserjes.",
  "Many students learning English, and many from low-income families.": "Muchos estudiantes que están aprendiendo inglés y muchos de familias de bajos ingresos.",
  "Parents juggling work and school schedules.": "Padres que equilibran el trabajo con los horarios escolares.",
  "students, teachers and school staff": "los estudiantes, maestros y personal escolar",
  "Large Chinese and Taiwanese American communities in Alhambra, San Gabriel, Monterey Park, Arcadia and Rowland Heights.": "Grandes comunidades chinas y taiwanesas en Alhambra, San Gabriel, Monterey Park, Arcadia y Rowland Heights.",
  "Vietnamese and other Southeast Asian families in Rosemead and El Monte.": "Familias vietnamitas y de otros países del sudeste asiático en Rosemead y El Monte.",
  "Latino families across Baldwin Park, El Monte, La Puente and Pomona.": "Familias latinas en Baldwin Park, El Monte, La Puente y Pomona.",
  "Students at Caltech, Cal Poly Pomona and the Claremont Colleges.": "Estudiantes de Caltech, Cal Poly Pomona y los Claremont Colleges.",
  "the people of the San Gabriel Valley": "la gente del Valle de San Gabriel",
  "Korean families and businesses in Koreatown, and Japanese Americans in Little Tokyo, Gardena and Torrance.": "Familias y negocios coreanos en Koreatown, y japoneses americanos en Little Tokyo, Gardena y Torrance.",
  "Chinese and Taiwanese communities across the San Gabriel Valley.": "Comunidades chinas y taiwanesas en todo el Valle de San Gabriel.",
  "Vietnamese families in Little Saigon in Westminster and Garden Grove.": "Familias vietnamitas en Little Saigon, en Westminster y Garden Grove.",
  "Filipino, Thai, Cambodian and Pacific Islander communities in Historic Filipinotown, Thai Town, Long Beach and Carson.": "Comunidades filipinas, tailandesas, camboyanas y de las islas del Pacífico en Historic Filipinotown, Thai Town, Long Beach y Carson.",
  "Asian and Pacific Islander families across LA and OC": "las familias asiáticas y de las islas del Pacífico en LA y OC",
  "Black families with deep roots in South LA, Inglewood and Compton.": "Familias afroamericanas con raíces profundas en el Sur de LA, Inglewood y Compton.",
  "Latino families, who now make up most of the population in many of these neighborhoods.": "Familias latinas, que ahora son la mayoría en muchos de estos vecindarios.",
  "Working cities along the 710 and 605 freeways, such as South Gate, Huntington Park, Downey and Norwalk.": "Ciudades trabajadoras a lo largo de las autopistas 710 y 605, como South Gate, Huntington Park, Downey y Norwalk.",
  "Churches that have served these communities for generations.": "Iglesias que han servido a estas comunidades por generaciones.",
  "the people of South LA and the Gateway Cities": "la gente del Sur de LA y las Gateway Cities",
  "About half of LA County and about a third of Orange County is Latino.": "Alrededor de la mitad del Condado de Los Ángeles y cerca de un tercio del Condado de Orange es latino.",
  "Families whose roots here go back generations, and families who arrived recently.": "Familias con raíces aquí de muchas generaciones y familias que llegaron hace poco.",
  "Many from Mexico and Central America, including Guatemala and El Salvador.": "Muchas de México y Centroamérica, incluidos Guatemala y El Salvador.",
  "Spanish-speaking households, and bilingual young people moving between two cultures.": "Hogares de habla hispana y jóvenes bilingües que viven entre dos culturas.",
  "Latino families across LA and OC": "las familias latinas de LA y OC",
  "California's seventh-largest city.": "La séptima ciudad más grande de California.",
  "One of the largest Cambodian communities outside Cambodia, in Cambodia Town.": "Una de las comunidades camboyanas más grandes fuera de Camboya, en Cambodia Town.",
  "Workers at the Port of Long Beach and students at Cal State Long Beach.": "Trabajadores del Puerto de Long Beach y estudiantes de Cal State Long Beach.",
  "Neighborhoods from North Long Beach to Belmont Shore and Naples.": "Vecindarios desde North Long Beach hasta Belmont Shore y Naples.",
  "the people of Long Beach": "la gente de Long Beach",
  "Students and staff at UCLA, USC, UC Irvine and the Cal State campuses in Long Beach, Fullerton, Northridge and Los Angeles.": "Estudiantes y personal de UCLA, USC, UC Irvine y los campus de Cal State en Long Beach, Fullerton, Northridge y Los Ángeles.",
  "Private colleges such as Pepperdine, Chapman, Biola and Loyola Marymount, and many community colleges.": "Universidades privadas como Pepperdine, Chapman, Biola y Loyola Marymount, y muchos colegios comunitarios.",
  "International students from around the world.": "Estudiantes internacionales de todo el mundo.",
  "Professors, researchers and campus workers.": "Profesores, investigadores y trabajadores de los campus.",
  "students, staff and faculty": "los estudiantes, el personal y los profesores",
  "Fullerton, Anaheim, Brea and the cities along the LA County line.": "Fullerton, Anaheim, Brea y las ciudades a lo largo de la línea del Condado de Los Ángeles.",
  "Disneyland Resort and Angel Stadium, and the hotel, restaurant and theme park workers who staff them.": "Disneyland Resort y Angel Stadium, y los trabajadores de hoteles, restaurantes y parques temáticos.",
  "Arab American families and businesses in Anaheim's Little Arabia.": "Familias y negocios árabes americanos en Little Arabia, en Anaheim.",
  "Korean communities in Buena Park and Fullerton, and students at Cal State Fullerton.": "Comunidades coreanas en Buena Park y Fullerton, y estudiantes de Cal State Fullerton.",
  "the people of North Orange County": "la gente del norte del Condado de Orange",
  "Santa Ana, the county seat, where most residents are Latino.": "Santa Ana, la sede del condado, donde la mayoría de los residentes son latinos.",
  "Some of the most crowded neighborhoods in Orange County.": "Algunos de los vecindarios más poblados del Condado de Orange.",
  "Courts, county offices and the people who work in and pass through them.": "Tribunales, oficinas del condado y las personas que trabajan en ellos o pasan por ellos.",
  "Vietnamese and Korean communities in Garden Grove, and the historic center of Orange.": "Comunidades vietnamitas y coreanas en Garden Grove, y el centro histórico de Orange.",
  "the people of Central Orange County": "la gente del centro del Condado de Orange",
  "Armenian families in Glendale, Burbank and across the San Fernando Valley.": "Familias armenias en Glendale, Burbank y todo el Valle de San Fernando.",
  "Persian (Iranian) communities in Westwood, Beverly Hills, Irvine and the Valley.": "Comunidades persas (iraníes) en Westwood, Beverly Hills, Irvine y el valle.",
  "Arab families and businesses in Anaheim's Little Arabia.": "Familias y negocios árabes en Little Arabia, en Anaheim.",
  "Families from Egypt, Lebanon, Syria, Iraq and other countries in the region.": "Familias de Egipto, Líbano, Siria, Irak y otros países de la región.",
  "Armenian, Persian, Arab and other Middle Eastern families": "las familias armenias, persas, árabes y de otros países del Medio Oriente",
  "Little Saigon in Westminster and Garden Grove, the largest Vietnamese community outside Vietnam.": "Little Saigon, en Westminster y Garden Grove, la comunidad vietnamita más grande fuera de Vietnam.",
  "Huntington Beach and the surf and beach communities along the coast.": "Huntington Beach y las comunidades de surf y playa a lo largo de la costa.",
  "Seal Beach, Los Alamitos and Rossmoor, next to the Joint Forces Training Base.": "Seal Beach, Los Alamitos y Rossmoor, junto a la Base de Entrenamiento de las Fuerzas Conjuntas.",
  "Families in Fountain Valley, Midway City and Stanton.": "Familias en Fountain Valley, Midway City y Stanton.",
  "the people of West Orange County": "la gente del oeste del Condado de Orange",
  "Irvine, with UC Irvine and a large Asian American and international population.": "Irvine, con UC Irvine y una gran población asiática americana e internacional.",
  "Planned communities such as Mission Viejo, Lake Forest, Rancho Santa Margarita and Ladera Ranch.": "Comunidades planificadas como Mission Viejo, Lake Forest, Rancho Santa Margarita y Ladera Ranch.",
  "San Juan Capistrano and San Clemente, near the San Diego County line and Camp Pendleton.": "San Juan Capistrano y San Clemente, cerca de la línea del Condado de San Diego y Camp Pendleton.",
  "Many retirees, including in Laguna Woods.": "Muchos jubilados, incluso en Laguna Woods.",
  "the people of South Orange County": "la gente del sur del Condado de Orange",
  "Newport Beach, Costa Mesa, Laguna Beach and Dana Point.": "Newport Beach, Costa Mesa, Laguna Beach y Dana Point.",
  "Harbor, tourism, hotel and restaurant workers, many of whom commute in.": "Trabajadores del puerto, el turismo, hoteles y restaurantes, muchos de los cuales vienen de otras ciudades.",
  "Artists and galleries in Laguna Beach.": "Artistas y galerías en Laguna Beach.",
  "Students at Orange Coast College and Vanguard University in Costa Mesa.": "Estudiantes de Orange Coast College y Vanguard University en Costa Mesa.",
  "the people of coastal Orange County": "la gente de la costa del Condado de Orange",
  "Nurses, doctors, aides, technicians and hospital cleaners.": "Enfermeras, médicos, asistentes, técnicos y personal de limpieza de hospitales.",
  "Patients and families at large medical centers such as Cedars-Sinai, UCLA, Children's Hospital Los Angeles and UCI Health.": "Pacientes y familias en grandes centros médicos como Cedars-Sinai, UCLA, Children's Hospital Los Angeles y UCI Health.",
  "County hospitals and community clinics serving people without insurance.": "Hospitales del condado y clínicas comunitarias que atienden a personas sin seguro médico.",
  "Chaplains and hospice workers.": "Capellanes y trabajadores de cuidados paliativos.",
  "healthcare workers, patients and their families": "los trabajadores de la salud, los pacientes y sus familias",
  "Police officers, sheriff's deputies, firefighters and paramedics.": "Policías, alguaciles, bomberos y paramédicos.",
  "Mayors, city councils and county supervisors across 122 cities and two counties.": "Alcaldes, concejos municipales y supervisores del condado en 122 ciudades y dos condados.",
  "Dispatchers, court staff and other public workers.": "Operadores de emergencias, personal de tribunales y otros servidores públicos.",
  "The families of all of these.": "Las familias de todos ellos.",
  "first responders, public servants and their families": "el personal de emergencia, los servidores públicos y sus familias",
  "Churches of many languages and traditions across both counties.": "Iglesias de muchos idiomas y tradiciones en ambos condados.",
  "Believers already making disciples in their neighborhoods, workplaces and schools.": "Creyentes que ya están haciendo discípulos en sus vecindarios, trabajos y escuelas.",
  "Ministries serving the poor, immigrants, students and families.": "Ministerios que sirven a los pobres, a los inmigrantes, a los estudiantes y a las familias.",
  "Every neighborhood, city and community you have prayed through.": "Cada vecindario, ciudad y comunidad por la que has orado.",
  "people in every place across LA and OC": "la gente de cada lugar de LA y OC",
};
