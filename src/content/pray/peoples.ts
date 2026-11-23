/**
 * The peoples layer of the Pray page: communities from the nations living in
 * Los Angeles and Orange County, so every day can pray for the peoples
 * possibly represented in that place, not only for the place.
 *
 * Counts come from the Census Bureau's American Community Survey (5-year
 * estimates, 2020–2024) by ZIP Code Tabulation Area; `scripts/build-peoples.mjs`
 * turns them into peoples.json. A census category is not a people group, so
 * each community links to people groups *possibly* represented, on Joshua
 * Project. Every link below was checked against joshuaproject.net.
 *
 * Census sources, `src`: A = B02015 (Asian alone, detailed), P = B02016 (Native
 * Hawaiian and Pacific Islander, detailed), N = B04006 (ancestry), B = B05006
 * (country of birth), followed by the line number in that table. A community
 * takes the largest of its sources in each ZIP code, because each is a floor:
 * the tables overlap and are never added together.
 *
 * This file is plain data with no imports, so the build script can read it.
 */

export interface People {
  id: string;
  src: string[];
  /** Name as listed, e.g. "Korean". */
  n: { en: string; es: string };
  /**
   * How a prayer line names the community. English: an adjective ("Korean
   * neighbors"). Spanish: a whole noun phrase ("la comunidad coreana"), so
   * the prayers never have to agree in gender and number.
   */
  x: { en: string; es: string };
  /** Religion in the homeland. The census does not ask religion. */
  relig: { en: string; es: string };
  /** One sentence about the peoples behind the census category. */
  data: { en: string; es: string };
  /** Joshua Project people groups possibly represented: [id, country code, name]. */
  u: [number, string, string][];
}

const p = (
  id: string,
  src: string[],
  n: [string, string],
  x: [string, string],
  relig: [string, string],
  data: [string, string],
  u: [number, string, string][] = [],
): People => ({
  id,
  src,
  n: { en: n[0], es: n[1] },
  x: { en: x[0], es: x[1] },
  relig: { en: relig[0], es: relig[1] },
  data: { en: data[0], es: data[1] },
  u,
});

export const PEOPLES: People[] = [
  // ── East Asia ──────────────────────────────────────────────────
  p('chinese', ['A002', 'B050'], ['Chinese', 'Chinos'], ['Chinese', 'la comunidad china'],
    ['Mostly non-religious or Chinese folk religion, with Buddhist and Christian minorities', 'Mayormente sin religión o religión popular china, con minorías budistas y cristianas'],
    ['Mandarin, Cantonese and other Chinese languages; most people of China have never heard the gospel clearly.', 'Mandarín, cantonés y otras lenguas chinas; la mayoría del pueblo chino nunca ha escuchado claramente el evangelio.'],
    [[12051, 'CH', 'Han Chinese, Mandarin'], [12057, 'CH', 'Han Chinese, Cantonese'], [11344, 'CH', 'Han Chinese, Min Nan'], [12140, 'CH', 'Hui'], [15755, 'CH', 'Uyghur']]),
  p('taiwanese', ['A008', 'B052'], ['Taiwanese', 'Taiwaneses'], ['Taiwanese', 'la comunidad taiwanesa'],
    ['Folk religion, Buddhist and Taoist, with a small Christian minority', 'Religión popular, budista y taoísta, con una pequeña minoría cristiana'],
    ['Taiwanese Hokkien, Mandarin and Hakka speakers; about 5% of Taiwan follows Jesus.', 'Hablantes de hokkien taiwanés, mandarín y hakka; cerca del 5% de Taiwán sigue a Jesús.'],
    [[11344, 'TW', 'Han Chinese, Min Nan'], [12051, 'TW', 'Han Chinese, Mandarin'], [12054, 'TW', 'Han Chinese, Hakka']]),
  p('korean', ['A005', 'B054'], ['Korean', 'Coreanos'], ['Korean', 'la comunidad coreana'],
    ['Christian, Buddhist and non-religious', 'Cristianos, budistas y sin religión'],
    ['Many Korean Americans already follow Jesus and are well placed to reach the nations around them.', 'Muchos coreanoamericanos ya siguen a Jesús y están bien ubicados para alcanzar a las naciones a su alrededor.'],
    [[12795, 'KS', 'Korean'], [22650, 'KS', 'Jejueo']]),
  p('japanese', ['A004', 'B053'], ['Japanese', 'Japoneses'], ['Japanese', 'la comunidad japonesa'],
    ['Shinto and Buddhist traditions; under 1% of Japan is evangelical', 'Tradiciones sintoístas y budistas; menos del 1% de Japón es evangélico'],
    ['Japan is one of the largest unreached peoples in the world.', 'Japón es uno de los pueblos no alcanzados más grandes del mundo.'],
    [[12322, 'JA', 'Japanese'], [11136, 'JA', 'Okinawan, Ryukyuan'], [11228, 'JA', 'Burakumin']]),
  p('mongolian', ['A006'], ['Mongolian', 'Mongoles'], ['Mongolian', 'la comunidad mongola'],
    ['Buddhist and non-religious, with a young, growing church', 'Budistas y sin religión, con una iglesia joven y en crecimiento'],
    ['Khalka Mongols and the peoples of western Mongolia.', 'Mongoles jalja y los pueblos del oeste de Mongolia.'],
    [[18605, 'MG', 'Mongol, Khalka'], [14129, 'MG', 'Kalmyk-Oirat, Western Mongol']]),

  // ── Southeast Asia ─────────────────────────────────────────────
  p('vietnamese', ['A019', 'B077'], ['Vietnamese', 'Vietnamitas'], ['Vietnamese', 'la comunidad vietnamita'],
    ['Buddhist, ancestor veneration and non-religious, with Catholic and Protestant minorities', 'Budistas, culto a los antepasados y sin religión, con minorías católicas y protestantes'],
    ['Little Saigon in Westminster and Garden Grove is the largest Vietnamese community outside Vietnam; the minority peoples of Vietnam are among the least reached.', 'Little Saigon en Westminster y Garden Grove es la comunidad vietnamita más grande fuera de Vietnam; los pueblos minoritarios de Vietnam están entre los menos alcanzados.'],
    [[15309, 'VM', 'Tay'], [13880, 'VM', 'Muong'], [14065, 'VM', 'Nung'], [15187, 'VM', 'Tai Dam'], [18689, 'VM', 'Tai Don, White Tai']]),
  p('filipino', ['A012', 'B074'], ['Filipino', 'Filipinos'], ['Filipino', 'la comunidad filipina'],
    ['Mostly Catholic, with Protestant and, in the south, Muslim communities', 'Mayormente católicos, con comunidades protestantes y, en el sur, musulmanas'],
    ['Tagalog, Ilocano, Cebuano and other languages; Filipino believers carry the gospel all over the world.', 'Tagalo, ilocano, cebuano y otras lenguas; los creyentes filipinos llevan el evangelio por todo el mundo.'],
    [[15175, 'RP', 'Tagalog']]),
  p('cambodian', ['A011', 'B070'], ['Cambodian (Khmer)', 'Camboyanos (jemeres)'], ['Cambodian', 'la comunidad camboyana'],
    ['Theravada Buddhist', 'Budistas theravada'],
    ['Long Beach has the largest Cambodian community outside Cambodia; most Khmer have never heard the gospel.', 'Long Beach tiene la comunidad camboyana más grande fuera de Camboya; la mayoría de los jemeres nunca ha escuchado el evangelio.'],
    [[12662, 'CB', 'Khmer'], [18988, 'CB', 'Khmer Krom'], [15361, 'CB', 'Cham, Western']]),
  p('thai', ['A018', 'B076'], ['Thai', 'Tailandeses'], ['Thai', 'la comunidad tailandesa'],
    ['Theravada Buddhist, with a Muslim minority in the south', 'Budistas theravada, con una minoría musulmana en el sur'],
    ['Thai Town in East Hollywood; about 1% of Thailand follows Jesus.', 'Thai Town en el este de Hollywood; cerca del 1% de Tailandia sigue a Jesús.'],
    [[11277, 'TH', 'Thai'], [15460, 'TH', 'Thai, Isan'], [12666, 'TH', 'Thai, Northern'], [14343, 'TH', 'Malay, Pattani']]),
  p('burmese', ['A010', 'B069'], ['Burmese (peoples of Myanmar)', 'Birmanos (pueblos de Myanmar)'], ['Burmese', 'la comunidad birmana'],
    ['Buddhist majority; Chin, Kachin and Karen peoples are largely Christian', 'Mayoría budista; los pueblos chin, kachin y karen son en gran parte cristianos'],
    ['The Bamar, Shan, Rakhine and Mon are among the largest unreached peoples of Myanmar.', 'Los bamar, shan, rakhine y mon están entre los pueblos no alcanzados más grandes de Myanmar.'],
    [[11029, 'BM', 'Burmese'], [18205, 'BM', 'Shan'], [13207, 'BM', 'Rakhine'], [19086, 'BM', 'Mon']]),
  p('indonesian', ['A013', 'B071'], ['Indonesian', 'Indonesios'], ['Indonesian', 'la comunidad indonesia'],
    ['Muslim majority, with Christian and Hindu minorities', 'Mayoría musulmana, con minorías cristianas e hindúes'],
    ['The Javanese and Sundanese are two of the largest unreached peoples on earth.', 'Los javaneses y los sundaneses son dos de los pueblos no alcanzados más grandes de la tierra.'],
    [[12334, 'ID', 'Java Pesisir Lor'], [15121, 'ID', 'Sunda'], [13199, 'ID', 'Madura']]),
  p('laotian', ['A014', 'B072'], ['Laotian', 'Laosianos'], ['Laotian', 'la comunidad laosiana'],
    ['Theravada Buddhist and animist', 'Budistas theravada y animistas'],
    ['Lao and the Tai peoples of Laos; few have heard the gospel.', 'Los lao y los pueblos tai de Laos; pocos han escuchado el evangelio.'],
    [[14383, 'LA', 'Phu Thai'], [14379, 'LA', 'Lao Phuan'], [18566, 'LA', 'Tai Lue']]),
  p('hmong', ['A003'], ['Hmong', 'Hmong'], ['Hmong', 'la comunidad hmong'],
    ['Animist and ancestor veneration, with a growing church', 'Animistas y culto a los antepasados, con una iglesia en crecimiento'],
    ['A highland people from Laos, Vietnam, Thailand and China, many of whom came as refugees.', 'Un pueblo de las montañas de Laos, Vietnam, Tailandia y China, muchos de los cuales llegaron como refugiados.']),
  p('malaysian', ['A015', 'B073'], ['Malaysian', 'Malasios'], ['Malaysian', 'la comunidad malasia'],
    ['Muslim majority, with Buddhist, Hindu and Christian minorities', 'Mayoría musulmana, con minorías budistas, hindúes y cristianas'],
    ['Malay, Chinese and Indian Malaysians; the Malay are almost entirely unreached.', 'Malasios de origen malayo, chino e indio; los malayos están casi totalmente sin alcanzar.'],
    [[13437, 'MY', 'Malay'], [14208, 'MY', 'Minangkabau, Orang Negeri']]),

  // ── South and Central Asia ─────────────────────────────────────
  p('indian', ['A021', 'B060'], ['Indian', 'Indios (de la India)'], ['Indian', 'la comunidad india'],
    ['Mostly Hindu, with Muslim, Sikh, Christian and Jain minorities', 'Mayormente hindúes, con minorías musulmanas, sijs, cristianas y jainistas'],
    ['Nearly all of the peoples of India are unreached; Artesia’s Little India and Cerritos are centers here.', 'Casi todos los pueblos de la India están sin alcanzar; Little India en Artesia y Cerritos son centros aquí.'],
    [[16521, 'IN', 'Brahmin unspecified'], [19597, 'IN', 'Kapu unspecified'], [17325, 'IN', 'Kunbi (Hindu traditions)'], [17452, 'IN', 'Mappila'], [18323, 'IN', 'Vanniyan']]),
  p('sikh', ['A026'], ['Sikh (Punjabi)', 'Sijs (punyabíes)'], ['Sikh', 'la comunidad sij'],
    ['Sikh', 'Sijs'],
    ['Punjabi Sikh families, most of whose peoples have no church among them.', 'Familias sijs punyabíes; la mayoría de sus pueblos no tiene una iglesia entre ellos.'],
    [[18777, 'IN', 'Jat (Sikh traditions)'], [20902, 'IN', 'Mazhabi (Sikh traditions)'], [18159, 'IN', 'Rajput (Sikh traditions)']]),
  p('pakistani', ['A025', 'B064'], ['Pakistani', 'Pakistaníes'], ['Pakistani', 'la comunidad pakistaní'],
    ['Muslim', 'Musulmanes'],
    ['Punjabi, Urdu and Pashto speakers; almost every people of Pakistan is unreached.', 'Hablantes de punyabí, urdu y pastún; casi todos los pueblos de Pakistán están sin alcanzar.'],
    [[17571, 'PK', 'Jat (Muslim traditions)'], [14256, 'PK', 'Pashtun'], [18084, 'PK', 'Shaikh']]),
  p('bangladeshi', ['A022', 'B058'], ['Bangladeshi', 'Bangladesíes'], ['Bangladeshi', 'la comunidad bangladesí'],
    ['Muslim majority, with a Hindu minority', 'Mayoría musulmana, con una minoría hindú'],
    ['Bengali Muslims are one of the largest unreached peoples in the world.', 'Los bengalíes musulmanes son uno de los pueblos no alcanzados más grandes del mundo.'],
    [[22492, 'BG', 'Bengali Muslim'], [22311, 'BG', 'Sylheti (Muslim traditions)']]),
  p('srilankan', ['A027', 'B065'], ['Sri Lankan', 'Esrilanqueses'], ['Sri Lankan', 'la comunidad esrilanquesa'],
    ['Buddhist majority, with Hindu, Muslim and Christian minorities', 'Mayoría budista, con minorías hindúes, musulmanas y cristianas'],
    ['Sinhala and Tamil speakers; Sri Lanka Moors are almost entirely unreached.', 'Hablantes de cingalés y tamil; los moros de Sri Lanka están casi totalmente sin alcanzar.'],
    [[11283, 'CE', 'Sri Lanka Moor'], [15234, 'CE', 'Tamil (Muslim traditions)']]),
  p('nepali', ['A024', 'B063'], ['Nepali', 'Nepalíes'], ['Nepali', 'la comunidad nepalí'],
    ['Hindu and Buddhist, with a fast-growing church', 'Hindúes y budistas, con una iglesia que crece rápidamente'],
    ['Chhetri, Brahmin, Magar, Newar and many other peoples.', 'Chhetri, brahmanes, magar, newar y muchos otros pueblos.'],
    [[16589, 'NP', 'Chhetri'], [20056, 'NP', 'Brahmin Hill'], [11698, 'NP', 'Magar'], [13322, 'NP', 'Newah']]),
  p('afghan', ['A029', 'N002', 'B057'], ['Afghan', 'Afganos'], ['Afghan', 'la comunidad afgana'],
    ['Muslim', 'Musulmanes'],
    ['Tajik, Pashtun and Hazara families, many of them recent arrivals.', 'Familias tayikas, pastunes y hazaras, muchas de ellas recién llegadas.'],
    [[14372, 'AF', 'Afghan, Tajik'], [14256, 'AF', 'Pashtun, Northern'], [12076, 'AF', 'Hazara']]),
  p('uzbek', ['A031', 'B066'], ['Uzbek', 'Uzbekos'], ['Uzbek', 'la comunidad uzbeka'],
    ['Muslim', 'Musulmanes'],
    ['Uzbeks are the largest people of Central Asia, and almost entirely unreached.', 'Los uzbekos son el pueblo más grande de Asia Central, y están casi totalmente sin alcanzar.'],
    [[14039, 'UZ', 'Uzbek, Northern']]),

  // ── Middle East and North Africa ───────────────────────────────
  p('iranian', ['N048', 'B061'], ['Iranian (Persian)', 'Iraníes (persas)'], ['Iranian', 'la comunidad iraní'],
    ['Shia Muslim majority, with Jewish, Baha’i, Zoroastrian and Christian minorities', 'Mayoría musulmana chiita, con minorías judías, bahaíes, zoroastrianas y cristianas'],
    ['Westwood and the Westside hold one of the largest Persian communities outside Iran; the church in Iran is growing fast.', 'Westwood y el Westside tienen una de las comunidades persas más grandes fuera de Irán; la iglesia en Irán crece rápidamente.'],
    [[14371, 'IR', 'Persian'], [18859, 'IR', 'Azerbaijani, Azeri Turk'], [12874, 'IR', 'Kurd, Southern']]),
  p('armenian', ['N016', 'B080'], ['Armenian', 'Armenios'], ['Armenian', 'la comunidad armenia'],
    ['Armenian Apostolic Christian, with Catholic and evangelical churches', 'Cristianos apostólicos armenios, con iglesias católicas y evangélicas'],
    ['Glendale and the east Valley hold the largest Armenian community outside Armenia, many by way of Iran and Lebanon.', 'Glendale y el este del Valle tienen la comunidad armenia más grande fuera de Armenia, muchos llegados por Irán y Líbano.'],
    [[10429, 'AM', 'Armenian'], [10429, 'IR', 'Armenian']]),
  p('assyrian', ['N017'], ['Assyrian and Chaldean', 'Asirios y caldeos'], ['Assyrian and Chaldean', 'la comunidad asiria y caldea'],
    ['Ancient Eastern churches, Catholic and Assyrian', 'Antiguas iglesias orientales, católicas y asirias'],
    ['Aramaic-speaking Christians from Iraq, Iran and Syria.', 'Cristianos de habla aramea de Irak, Irán y Siria.'],
    [[10464, 'IZ', 'Assyrian'], [11295, 'IZ', 'Chaldean']]),
  p('arab', ['N006'], ['Arab (all origins)', 'Árabes (todos los orígenes)'], ['Arab', 'la comunidad árabe'],
    ['Muslim majority, with Christian communities from Egypt, Lebanon, Syria, Iraq and Palestine', 'Mayoría musulmana, con comunidades cristianas de Egipto, Líbano, Siria, Irak y Palestina'],
    ['Little Arabia in Anaheim is the center of Arab life in Southern California.', 'Little Arabia en Anaheim es el centro de la vida árabe en el sur de California.'],
    [[11722, 'EG', 'Arab, Egyptian Muslim'], [12247, 'IZ', 'Arab, Iraqi'], [12368, 'JO', 'Arab, Jordanian'], [13017, 'LE', 'Arab, Lebanese Muslim'], [15152, 'SY', 'Arab, Syrian (Muslim traditions)']]),
  p('egyptian', ['N007', 'B112'], ['Egyptian', 'Egipcios'], ['Egyptian', 'la comunidad egipcia'],
    ['Muslim majority, with a large Coptic Christian minority', 'Mayoría musulmana, con una gran minoría cristiana copta'],
    ['Egyptian Arabs, with Coptic believers well placed to reach their neighbors.', 'Árabes egipcios, con creyentes coptos bien ubicados para alcanzar a sus vecinos.'],
    [[11722, 'EG', 'Arab, Egyptian Muslim'], [14643, 'EG', 'Arab, Saidi - Muslim']]),
  p('lebanese', ['N010', 'B087'], ['Lebanese', 'Libaneses'], ['Lebanese', 'la comunidad libanesa'],
    ['Muslim and Christian, with a Druze minority', 'Musulmanes y cristianos, con una minoría drusa'],
    ['Lebanese Muslims and Druze are largely unreached.', 'Los musulmanes libaneses y los drusos están en gran parte sin alcanzar.'],
    [[13017, 'LE', 'Arab, Lebanese Muslim'], [11620, 'LE', 'Druze']]),
  p('syrian', ['N013', 'B089'], ['Syrian', 'Sirios'], ['Syrian', 'la comunidad siria'],
    ['Muslim majority, with Christian, Alawite and Druze minorities', 'Mayoría musulmana, con minorías cristianas, alauitas y drusas'],
    ['Syrian Arabs, Alawites and Kurds.', 'Árabes sirios, alauitas y kurdos.'],
    [[15152, 'SY', 'Arab, Syrian (Muslim traditions)'], [18805, 'SY', 'Alawite'], [12877, 'SY', 'Kurd, Kurmanji']]),
  p('iraqi', ['N008', 'B083'], ['Iraqi', 'Iraquíes'], ['Iraqi', 'la comunidad iraquí'],
    ['Muslim majority, with Assyrian and Chaldean Christians', 'Mayoría musulmana, con cristianos asirios y caldeos'],
    ['Iraqi Arabs, Kurds and Turkmen.', 'Árabes iraquíes, kurdos y turcomanos.'],
    [[12247, 'IZ', 'Arab, Iraqi'], [11126, 'IZ', 'Kurd, Sorani'], [21538, 'IZ', 'Turkmen, Middle-Eastern']]),
  p('palestinian', ['N012'], ['Palestinian', 'Palestinos'], ['Palestinian', 'la comunidad palestina'],
    ['Muslim majority, with a Christian minority', 'Mayoría musulmana, con una minoría cristiana'],
    ['Palestinian Arabs from Gaza, the West Bank, Jordan and beyond.', 'Árabes palestinos de Gaza, Cisjordania, Jordania y más allá.'],
    [[14276, 'XP', 'Arab, Palestinian']]),
  p('jordanian', ['N009', 'B085'], ['Jordanian', 'Jordanos'], ['Jordanian', 'la comunidad jordana'],
    ['Muslim majority, with a Christian minority', 'Mayoría musulmana, con una minoría cristiana'],
    ['Jordanian and Palestinian Arabs and Bedouin.', 'Árabes jordanos y palestinos, y beduinos.'],
    [[12368, 'JO', 'Arab, Jordanian'], [10758, 'JO', 'Arab, Bedouin']]),
  p('moroccan', ['N011', 'B113'], ['Moroccan', 'Marroquíes'], ['Moroccan', 'la comunidad marroquí'],
    ['Muslim', 'Musulmanes'],
    ['Moroccan Arabs and Amazigh (Berber) peoples, almost entirely unreached.', 'Árabes marroquíes y pueblos amazigh (bereberes), casi totalmente sin alcanzar.'],
    [[13819, 'MO', 'Arab, Moroccan'], [14911, 'MO', 'Amazigh, Southern Shilha']]),
  p('israeli', ['N050', 'B084'], ['Israeli', 'Israelíes'], ['Israeli', 'la comunidad israelí'],
    ['Jewish, mostly secular', 'Judíos, mayormente seculares'],
    ['Israelis in the Valley and on the Westside; few Jewish people have heard of their Messiah.', 'Israelíes en el Valle y en el Westside; pocos judíos han oído de su Mesías.'],
    [[12267, 'IS', 'Jewish, Israeli'], [22664, 'IS', 'Jewish, Hasidic']]),
  p('turkish', ['N091', 'B090'], ['Turkish', 'Turcos'], ['Turkish', 'la comunidad turca'],
    ['Muslim, with an Alevi minority', 'Musulmanes, con una minoría aleví'],
    ['Turkey is one of the largest unreached nations; fewer than 1 in 1,000 follow Jesus.', 'Turquía es una de las naciones no alcanzadas más grandes; menos de 1 de cada 1,000 sigue a Jesús.'],
    [[18274, 'TU', 'Turk'], [22661, 'TU', 'Turk, Alevi'], [12877, 'TU', 'Kurd, Kurmanji']]),

  // ── Africa ─────────────────────────────────────────────────────
  p('ethiopian', ['N075', 'B098'], ['Ethiopian', 'Etíopes'], ['Ethiopian', 'la comunidad etíope'],
    ['Orthodox Christian and Muslim, with a large evangelical church', 'Cristianos ortodoxos y musulmanes, con una gran iglesia evangélica'],
    ['Little Ethiopia on Fairfax; the Oromo, Afar and Silt’e peoples are largely unreached.', 'Little Ethiopia en Fairfax; los pueblos oromo, afar y silt’e están en gran parte sin alcanzar.'],
    [[19653, 'ET', 'Oromo, Jima'], [11486, 'ET', 'Afar'], [11677, 'ET', "Silt'e"]]),
  p('eritrean', ['B097'], ['Eritrean', 'Eritreos'], ['Eritrean', 'la comunidad eritrea'],
    ['Orthodox Christian and Muslim', 'Cristianos ortodoxos y musulmanes'],
    ['Tigrinya and Tigre speakers; the Tigre are almost entirely unreached.', 'Hablantes de tigriña y tigré; los tigré están casi totalmente sin alcanzar.'],
    [[15482, 'ER', 'Tigre, Eritrean'], [11486, 'ER', 'Afar']]),
  p('somali', ['N082', 'B100'], ['Somali', 'Somalíes'], ['Somali', 'la comunidad somalí'],
    ['Muslim', 'Musulmanes'],
    ['Somalis are one of the least reached peoples in the world.', 'Los somalíes son uno de los pueblos menos alcanzados del mundo.'],
    [[14983, 'SO', 'Somali']]),
  p('sudanese', ['N084', 'B114'], ['Sudanese', 'Sudaneses'], ['Sudanese', 'la comunidad sudanesa'],
    ['Muslim majority; South Sudanese are largely Christian', 'Mayoría musulmana; los sursudaneses son mayormente cristianos'],
    ['Sudanese Arabs and the peoples of Darfur.', 'Árabes sudaneses y los pueblos de Darfur.'],
    [[15104, 'SU', 'Arab, Sudanese'], [11779, 'SU', 'Fur, Forok']]),
  p('nigerian', ['N079', 'B124'], ['Nigerian', 'Nigerianos'], ['Nigerian', 'la comunidad nigeriana'],
    ['Christian south, Muslim north', 'Sur cristiano, norte musulmán'],
    ['Many Nigerians here follow Jesus; the Hausa, Fulani and Kanuri of the north are largely unreached.', 'Muchos nigerianos aquí siguen a Jesús; los hausa, fulani y kanuri del norte están en gran parte sin alcanzar.'],
    [[12070, 'NI', 'Hausa'], [10949, 'NI', 'Fulani, Nigerian'], [12509, 'NI', 'Kanuri, Yerwa']]),
  p('ghanaian', ['N076', 'B121'], ['Ghanaian', 'Ghaneses'], ['Ghanaian', 'la comunidad ghanesa'],
    ['Christian majority, with a Muslim north', 'Mayoría cristiana, con un norte musulmán'],
    ['Ghanaian believers, and the unreached Muslim peoples of the north.', 'Creyentes ghaneses, y los pueblos musulmanes no alcanzados del norte.'],
    [[13471, 'GH', 'Mamprusi'], [11925, 'GH', 'Gonja']]),
  p('kenyan', ['N077', 'B099'], ['Kenyan', 'Keniatas'], ['Kenyan', 'la comunidad keniata'],
    ['Christian majority, with a Muslim minority on the coast and in the north', 'Mayoría cristiana, con una minoría musulmana en la costa y el norte'],
    ['Many Kenyans follow Jesus and can reach the Muslim peoples of East Africa.', 'Muchos keniatas siguen a Jesús y pueden alcanzar a los pueblos musulmanes de África oriental.']),

  // ── Pacific ────────────────────────────────────────────────────
  p('samoan', ['P003'], ['Samoan', 'Samoanos'], ['Samoan', 'la comunidad samoana'],
    ['Christian', 'Cristianos'],
    ['Carson, Long Beach and the harbor have large Samoan churches, ready to send.', 'Carson, Long Beach y el puerto tienen grandes iglesias samoanas, listas para enviar.'],
    [[14676, 'WS', 'Samoan']]),
  p('tongan', ['P004'], ['Tongan', 'Tonganos'], ['Tongan', 'la comunidad tongana'],
    ['Christian', 'Cristianos'],
    ['Tongan families and churches across the South Bay and Long Beach.', 'Familias e iglesias tonganas en el South Bay y Long Beach.'],
    [[15554, 'TN', 'Tongan']]),
  p('fijian', ['P011', 'B134'], ['Fijian', 'Fiyianos'], ['Fijian', 'la comunidad fiyiana'],
    ['Christian iTaukei; Fiji Indians are mostly Hindu and Muslim', 'Los iTaukei son cristianos; los indofiyianos son mayormente hindúes y musulmanes'],
    ['Fijians and Fiji Indians.', 'Fiyianos e indofiyianos.'],
    [[11200, 'FJ', 'Fijian'], [11201, 'FJ', 'Fijian Hindi']]),
  p('marshallese', ['P009', 'B135'], ['Marshallese', 'Marshaleses'], ['Marshallese', 'la comunidad marshalesa'],
    ['Christian', 'Cristianos'],
    ['Families from the Marshall Islands.', 'Familias de las Islas Marshall.'],
    [[13554, 'RM', 'Marshallese']]),
];

export const PEOPLE: Record<string, People> = Object.fromEntries(PEOPLES.map((x) => [x.id, x]));

/** Countries for links that would otherwise read the same twice (Armenian, Armenian). */
export const COUNTRY: Record<string, { en: string; es: string }> = {
  AM: { en: 'Armenia', es: 'Armenia' },
  IR: { en: 'Iran', es: 'Irán' },
};

/** Joshua Project page for a people group in one country. */
export const jpURL = ([id, cc]: [number, string, string]) => `https://joshuaproject.net/people_groups/${id}/${cc}`;

/** Short prayer lines, rotated through a day's communities. {x} is People.x in the page's language. */
export const PEOPLE_PRAYERS: { en: string; es: string }[] = [
  { en: 'Pray that God would open the eyes of {x} neighbors to the light of the gospel.', es: 'Ora para que Dios abra los ojos de {x} a la luz del evangelio.' },
  { en: 'Ask the Father to draw {x} men and women to Jesus.', es: 'Pide al Padre que atraiga a Jesús a hombres y mujeres de {x}.' },
  { en: 'Pray for persons of peace in {x} households, who welcome the message and open their homes.', es: 'Ora por personas de paz en los hogares de {x}, que reciban el mensaje y abran sus casas.' },
  { en: 'Pray that {x} families would hear the good news in a language they understand, and believe.', es: 'Ora para que las familias de {x} escuchen las buenas nuevas en un idioma que entiendan, y crean.' },
  { en: 'Pray for believers to love their {x} neighbors and share the gospel with them this week.', es: 'Ora para que los creyentes amen a {x} y compartan el evangelio con ellos esta semana.' },
  { en: 'Pray for {x} believers to be baptized and to obey all that Jesus commanded.', es: 'Ora para que los creyentes de {x} se bauticen y obedezcan todo lo que Jesús mandó.' },
  { en: 'Pray for churches to begin among {x} families and to multiply, here and in their homeland.', es: 'Ora para que comiencen iglesias entre {x} y se multipliquen, aquí y en su tierra natal.' },
  { en: 'Ask the Lord of the harvest to send workers to {x} neighbors, until no people is left without a witness.', es: 'Pide al Señor de la cosecha que envíe obreros a {x}, hasta que no quede ningún pueblo sin testigo.' },
  { en: 'Pray that God would raise up leaders among {x} believers who carry the gospel to their own people.', es: 'Ora para que Dios levante líderes entre los creyentes de {x} que lleven el evangelio a su propio pueblo.' },
];
