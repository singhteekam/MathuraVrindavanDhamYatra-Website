import type { Metadata } from 'next'
import { Link }          from '@/i18n/navigation'
import Image             from 'next/image'
import { ArrowRight, MapPin, Calendar, Star } from 'lucide-react'

export const metadata: Metadata = {
  title:       'Radhe Krishna · Vrindavan Dham | Mathura Vrindavan Dham Yatra',
  description: 'Discover the divine story of Lord Krishna and Radha Rani. Explore sacred Vrindavan — its ancient temples, festivals, and eternal spiritual significance in the Braj region of India.',
  keywords:    ['Radha Krishna', 'Vrindavan temples', 'Mathura pilgrimage', 'Braj Bhoomi', 'Krishna Janmasthan', 'Janmashtami', 'Prem Mandir', 'Banke Bihari'],
}

// All images: Unsplash (free for commercial use, no attribution required)
const KRISHNA_IMGS = [
  {
    src:     'https://images.unsplash.com/photo-1641730259879-ad98e7db7bcb?auto=format&fit=crop&w=700&q=85',
    alt:     'Lord Krishna bronze statue playing the divine flute — Murlidhar',
    caption: 'मुरलीधर श्री कृष्ण · Murlidhar Shri Krishna',
  },
  {
    src:     'https://images.unsplash.com/photo-1631689644455-b570154363e2?auto=format&fit=crop&w=700&q=85',
    alt:     'Lord Krishna deity idol on a divine swing — Jhula Leela',
    caption: 'झूलन लीला · Jhula Leela of Shri Krishna',
  },
]

const RADHA_IMGS = [
  {
    src:     'https://images.unsplash.com/photo-1641913625440-158406784a9f?auto=format&fit=crop&w=700&q=85',
    alt:     'Radha Krishna deity idols together in a beautifully decorated temple sanctum',
    caption: 'राधे कृष्ण युगल · Radha Krishna Yugal Swaroop',
  },
  {
    src:     'https://images.unsplash.com/photo-1724424982688-ad5f9dffd488?auto=format&fit=crop&w=700&q=85',
    alt:     'Radha Krishna sacred deity idols — eternal divine couple',
    caption: 'शाश्वत दिव्य जोड़ी · The Eternal Divine Couple',
  },
]

const VRINDAVAN_IMGS = [
  {
    src:     'https://images.unsplash.com/photo-1652448692527-c314ff7c14a9?auto=format&fit=crop&w=700&q=85',
    alt:     'Prem Mandir Vrindavan — magnificent white marble temple',
    caption: 'प्रेम मंदिर · Prem Mandir',
  },
  {
    src:     'https://images.unsplash.com/photo-1583134993393-07aa230888f9?auto=format&fit=crop&w=700&q=85',
    alt:     'Prem Mandir Vrindavan illuminated with colourful lights at night',
    caption: 'रात्रि दर्शन · Night Illumination',
  },
  {
    src:     'https://images.unsplash.com/photo-1681508401397-10f7504c4a05?auto=format&fit=crop&w=700&q=85',
    alt:     'Vrindavan temple glowing with divine lights during evening aarti',
    caption: 'दिव्य आरती · Divine Evening Aarti',
  },
  {
    src:     'https://images.unsplash.com/photo-1687627045984-82ec8a4d2697?auto=format&fit=crop&w=700&q=85',
    alt:     'Sacred deity idol in a temple garden in Vrindavan',
    caption: 'वृंदावन दर्शन · Vrindavan Darshan',
  },
]

const TEMPLES = [
  {
    name:     'Prem Mandir',
    nameHi:   'प्रेम मंदिर',
    emoji:    '🏛️',
    location: 'Vrindavan',
    en: 'One of the ten largest Hindu temples in the world, spread over 54 glorious acres. Built by Jagadguru Kripalu Ji Maharaj and inaugurated in 2012, this white Makrana marble marvel is famous for its breathtaking evening light show — thousands of multicoloured LED lights transform it into a glowing jewel every night. The panels carved on its walls narrate the complete life-story of Lord Krishna and Radha.',
    hi: 'विश्व के दस सबसे बड़े हिंदू मंदिरों में से एक, 54 एकड़ में फैला यह अद्भुत मंदिर। जगद्गुरु कृपालु जी महाराज द्वारा निर्मित और 2012 में उद्घाटित, सफेद मकराना संगमरमर से बना यह मंदिर अपनी शाम की रंगीन रोशनी के लिए प्रसिद्ध है। हर रात हजारों एलईडी रोशनियाँ इसे एक चमकते रत्न में बदल देती हैं। इसकी दीवारों पर उकेरे गए पैनल भगवान कृष्ण और राधा की संपूर्ण जीवन-कथा को दर्शाते हैं।',
    highlight:   '54 Acres · Est. 2012 · White Marble',
    highlightHi: '54 एकड़ · स्थापना 2012 · सफेद संगमरमर',
  },
  {
    name:     'Banke Bihari Temple',
    nameHi:   'बाँके बिहारी मंदिर',
    emoji:    '🛕',
    location: 'Vrindavan',
    en: 'One of the most revered and beloved temples in Vrindavan, built in 1862 after the deity Banke-Bihari was discovered in Nidhivan by the great saint Swami Haridas — the guru of the legendary court musician Tansen. What makes this temple unique is the rhythmic opening and closing of the curtain before the deity during darshan — a tradition that prevents devotees from being overwhelmed by the intense divine gaze of Thakurji. The Phoolon ki Holi (shower of flowers) here is legendary.',
    hi: 'वृंदावन के सबसे प्रिय और पूजनीय मंदिरों में से एक, 1862 में निर्मित। यह मंदिर उस स्थान पर बना है जहाँ महान संत स्वामी हरिदास — तानसेन के गुरु — ने निधिवन में बाँके-बिहारी की मूर्ति को प्रकट किया था। इस मंदिर की विशेषता यह है कि दर्शन के दौरान पर्दा बार-बार खुलता और बंद होता है — यह परंपरा इसलिए है ताकि भक्त ठाकुरजी की तीव्र दिव्य दृष्टि से अभिभूत न हो जाएँ। यहाँ की फूलों की होली विश्वप्रसिद्ध है।',
    highlight:   'Built 1862 · Swami Haridas · Nidhivan',
    highlightHi: 'निर्मित 1862 · स्वामी हरिदास · निधिवन',
  },
  {
    name:     'ISKCON Krishna-Balarama Temple',
    nameHi:   'इस्कॉन कृष्ण-बलराम मंदिर',
    emoji:    '🕌',
    location: 'Vrindavan',
    en: 'Established in 1975 by Srila A.C. Bhaktivedanta Swami Prabhupada, founder of the International Society for Krishna Consciousness (ISKCON). The temple houses three sets of deities: Krishna-Balarama, Radha-Shyamasundar, and Gaura-Nitai. The beautiful marble samadhi of Srila Prabhupada — where his mortal remains are interred — is a major pilgrimage spot for devotees from over 100 countries. The temple runs a world-class guesthouse and the famous Govinda\'s restaurant.',
    hi: '1975 में श्रील ए.सी. भक्तिवेदांत स्वामी प्रभुपाद द्वारा स्थापित, जो अंतर्राष्ट्रीय कृष्णभावनामृत संघ (इस्कॉन) के संस्थापक हैं। इस मंदिर में तीन जोड़ी विग्रह हैं: कृष्ण-बलराम, राधा-श्यामसुन्दर और गौर-निताई। श्रील प्रभुपाद की सुंदर संगमरमर की समाधि — जहाँ उनके पार्थिव शरीर को दफनाया गया है — 100 से अधिक देशों के भक्तों के लिए एक प्रमुख तीर्थस्थल है। मंदिर एक विश्व-स्तरीय गेस्टहाउस और प्रसिद्ध गोविन्दा\'s रेस्तरां भी चलाता है।',
    highlight:   'ISKCON · Est. 1975 · Srila Prabhupada Samadhi',
    highlightHi: 'इस्कॉन · स्थापना 1975 · श्रील प्रभुपाद समाधि',
  },
  {
    name:     'Radha Raman Temple',
    nameHi:   'राधारमण मंदिर',
    emoji:    '🏯',
    location: 'Vrindavan',
    en: 'One of Vrindavan\'s most sacred temples, built at the request of Gopala Bhatta Goswami — one of the Six Goswamis sent to Vrindavan by Sri Chaitanya Mahaprabhu. The presiding deity, Radha Ramana, is a self-manifested (svayambhu) shaligram shila — a sacred black stone that miraculously took the form of Lord Krishna. Remarkably, the original deity has never been replaced or repaired in over 500 years of continuous worship. The original Radha deity installed by Gopala Bhatta still stands beside Radha Ramana today.',
    hi: 'वृंदावन के सबसे पवित्र मंदिरों में से एक, गोपाल भट्ट गोस्वामी के अनुरोध पर निर्मित — जो श्री चैतन्य महाप्रभु द्वारा वृंदावन भेजे गए छः गोस्वामियों में से एक हैं। यहाँ के देवता, राधारमण, एक स्वयंभू शालिग्राम शिला हैं — एक पवित्र काला पत्थर जो चमत्कारिक रूप से भगवान कृष्ण के रूप में प्रकट हुआ। उल्लेखनीय है कि 500 से अधिक वर्षों की निरंतर पूजा में मूल विग्रह को कभी बदला या मरम्मत नहीं किया गया। गोपाल भट्ट द्वारा स्थापित मूल राधा विग्रह आज भी राधारमण के साथ विद्यमान है।',
    highlight:   '16th Century · Svayambhu Shaligram · Six Goswamis',
    highlightHi: '16वीं शताब्दी · स्वयंभू शालिग्राम · छः गोस्वामी',
  },
  {
    name:     'Madan Mohan Temple',
    nameHi:   'मदन मोहन मंदिर',
    emoji:    '🗼',
    location: 'Vrindavan',
    en: 'The oldest surviving temple in Vrindavan, perched dramatically on a high sandstone hill overlooking the sacred Yamuna River. Built in the 16th century by Kapur Ram Das of Multan. It is intimately associated with Sri Chaitanya Mahaprabhu, who entrusted the care of the deity to Sanatana Goswami. The temple is deeply connected to the legendary sailor Ram Das Khatri, who donated his wealth after Madan Mohan supernaturally guided his ship to safety. The original deity was moved to Karauli, Rajasthan during Aurangzeb\'s reign; the current deity is a pratibhu (representative).',
    hi: 'वृंदावन का सबसे पुराना जीवित मंदिर, पवित्र यमुना नदी को देखती हुई एक ऊँची बलुआ पत्थर की पहाड़ी पर स्थित। 16वीं शताब्दी में मुलतान के कपूर राम दास द्वारा निर्मित। यह श्री चैतन्य महाप्रभु से गहराई से जुड़ा है, जिन्होंने विग्रह की देखभाल सनातन गोस्वामी को सौंपी थी। मंदिर उस किंवदंती के नाविक राम दास खटाई से भी जुड़ा है, जिन्होंने मदन मोहन द्वारा चमत्कारिक रूप से अपने जहाज को सुरक्षित बंदरगाह तक पहुँचाने के बाद अपनी सारी संपत्ति दान कर दी। औरंगजेब के शासन काल में मूल विग्रह को करौली, राजस्थान ले जाया गया; वर्तमान विग्रह एक प्रतिभू (प्रतिनिधि) है।',
    highlight:   '16th Century · Oldest in Vrindavan · Yamuna View',
    highlightHi: '16वीं शताब्दी · वृंदावन का सबसे पुराना · यमुना दृश्य',
  },
  {
    name:     'Krishna Janmasthan',
    nameHi:   'कृष्ण जन्मस्थान',
    emoji:    '⛪',
    location: 'Mathura',
    en: 'The holiest site in Mathura — the precise spot where Lord Krishna is believed to have been born 5,000 years ago, inside a prison cell where his parents Devaki and Vasudeva were imprisoned by the tyrant Kamsa. The complex includes the Keshav Deva temple, the sacred Garbha Griha shrine (the exact birth spot, surrounded by prison bars to recall the original prison), and the grand Bhagavata Bhavan hall. Draws an estimated 3–3.5 million pilgrims during Janmashtami alone. The site has been destroyed and rebuilt several times — the current complex was renovated in 1982.',
    hi: 'मथुरा में सबसे पवित्र स्थान — वह सटीक स्थान जहाँ भगवान कृष्ण का जन्म 5,000 वर्ष पूर्व हुआ था, उस कारागार में जहाँ उनके माता-पिता देवकी और वसुदेव को अत्याचारी कंस ने कैद किया था। इस परिसर में केशव देव मंदिर, पवित्र गर्भगृह (जन्म का सटीक स्थान, जेल की सलाखों से घिरा हुआ), और भव्य भागवत भवन हॉल शामिल हैं। अकेले जन्माष्टमी पर अनुमानित 30-35 लाख तीर्थयात्री आते हैं। इस स्थल को कई बार नष्ट और पुनर्निर्मित किया गया — वर्तमान परिसर 1982 में नवीनीकृत किया गया था।',
    highlight:   "Krishna's Birthplace · Garbha Griha · Mathura",
    highlightHi: 'कृष्ण की जन्मभूमि · गर्भगृह · मथुरा',
  },
]

const FESTIVALS = [
  {
    name:    'Janmashtami',
    nameHi:  'जन्माष्टमी',
    emoji:   '🎉',
    timing:  'August / September',
    timingHi:'अगस्त / सितंबर',
    color:   '#6366f1',
    en: "Celebrates Lord Krishna's birthday on the eighth day (Ashtami) of the dark fortnight in the month of Bhadrapada. Devotees fast all day and break their fast only at midnight — the exact time of Krishna's birth. In Mathura and Vrindavan, the celebration is unlike anywhere else on earth: temples are packed wall-to-wall with a sea of devotees, grand abhishek (bathing ceremony) of the deity is performed, Raslila performances depict Krishna's divine childhood, and the entire city erupts in chants of 'Hare Krishna'. Draws 3–3.5 million pilgrims to Mathura alone.",
    hi: "भाद्रपद मास की कृष्ण पक्ष की अष्टमी को भगवान कृष्ण के जन्मदिन के रूप में मनाया जाता है। भक्त दिनभर उपवास करते हैं और मध्यरात्रि में — कृष्ण के जन्म के सटीक समय — व्रत तोड़ते हैं। मथुरा और वृंदावन में यह उत्सव पृथ्वी पर किसी भी अन्य स्थान से अतुलनीय है: मंदिर भक्तों से खचाखच भरे होते हैं, देवता का भव्य अभिषेक होता है, रासलीला में कृष्ण की दिव्य बाललीला का मंचन होता है, और पूरा शहर 'हरे कृष्ण' के जयघोष से गूँज उठता है। केवल मथुरा में 30-35 लाख तीर्थयात्री आते हैं।",
  },
  {
    name:    'Braj Holi',
    nameHi:  'ब्रज होली',
    emoji:   '🎨',
    timing:  'March (week-long festival)',
    timingHi:'मार्च (सप्ताह भर का उत्सव)',
    color:   '#ec4899',
    en: "Holi in the Braj region is not a single day — it is a week-long celebration spread across multiple villages, each with its own unique tradition. Lathmar Holi in Barsana: women chase and playfully beat men with decorated sticks (lathis) while men shield themselves. Nandgaon: the roles reverse the next day. Phoolon ki Holi at Banke Bihari Temple: priests shower devotees with tonnes of fragrant flower petals. Widows' Holi at Gopinath Temple: women who were once forbidden to participate now celebrate with overwhelming joy. The festival commemorates Krishna's playful visits to Radha's village.",
    hi: "ब्रज में होली एक दिन नहीं — यह कई गाँवों में फैला सप्ताह भर का उत्सव है, जिनमें से प्रत्येक की अपनी अनूठी परंपरा है। बरसाना की लट्ठमार होली: महिलाएँ पुरुषों को सजी-धजी लाठियों से खदेड़ती और मारती हैं जबकि पुरुष ढाल लेकर बचाव करते हैं। नंदगाँव में: अगले दिन भूमिकाएँ उलट जाती हैं। बाँके बिहारी मंदिर में फूलों की होली: पुजारी भक्तों पर टनों सुगंधित फूलों की पंखुड़ियाँ बरसाते हैं। गोपीनाथ मंदिर में विधवाओं की होली: जो महिलाएँ एक समय में भाग लेने से वंचित थीं, अब अपार आनंद के साथ उत्सव मनाती हैं। यह उत्सव कृष्ण की राधा के गाँव में खेलपूर्ण यात्राओं की याद में मनाया जाता है।",
  },
  {
    name:    'Radhashtami',
    nameHi:  'राधाष्टमी',
    emoji:   '🌸',
    timing:  '15 days after Janmashtami',
    timingHi:'जन्माष्टमी के 15 दिन बाद',
    color:   '#f59e0b',
    en: "Celebrates the birth of Radha Rani — the queen of Vrindavan and the embodiment of divine love. Observed on the eighth day of the bright fortnight of Bhadrapada, exactly 15 days after Janmashtami. Barsana — Radha's birthplace — becomes the centre of the universe on this day. The Radha Rani temple is decorated with thousands of flowers, and priests perform a grand abhishek of the goddess. Devotees from across India sing 'Radhe Radhe' continuously from sunrise to sunset. Many believe that chanting 'Radhe' is even more powerful than chanting Krishna's name — as Krishna himself is said to always respond when Radha's name is called.",
    hi: "राधा रानी के जन्म का उत्सव — वृंदावन की महारानी और दिव्य प्रेम की मूर्त। भाद्रपद मास के शुक्ल पक्ष की अष्टमी को, जन्माष्टमी के ठीक 15 दिन बाद मनाया जाता है। बरसाना — राधा की जन्मभूमि — इस दिन ब्रह्मांड का केंद्र बन जाती है। राधा रानी मंदिर को हजारों फूलों से सजाया जाता है, और पुजारी देवी का भव्य अभिषेक करते हैं। पूरे भारत के भक्त सूर्योदय से सूर्यास्त तक निरंतर 'राधे राधे' का गान करते हैं। कई लोगों का मानना है कि 'राधे' का जाप कृष्ण के नाम से भी अधिक शक्तिशाली है — क्योंकि कहा जाता है कि जब राधा का नाम पुकारा जाता है तो कृष्ण स्वयं प्रतिक्रिया देते हैं।",
  },
  {
    name:    'Govardhan Puja',
    nameHi:  'गोवर्धन पूजा',
    emoji:   '🏔️',
    timing:  'Day after Diwali (October/November)',
    timingHi:'दीपावली के अगले दिन (अक्टूबर/नवंबर)',
    color:   '#10b981',
    en: "Commemorates one of Krishna's most celebrated miracles: when he lifted the mighty Govardhan Hill on his little finger for seven days to protect the people of Vrindavan from torrential rains sent by a furious Indra (god of rain), who was angered that Krishna had stopped the villagers from worshipping him. After seven days, Indra accepted defeat and bowed before Krishna. To this day, devotees perform the Govardhan Parikrama — a 21 km circumambulation of the sacred hill — barefoot, as an act of devotion. Annakut (mountain of food) is the other highlight — temples display a mountain of 56 cooked dishes (Chhappan Bhog) as an offering.",
    hi: "कृष्ण के सबसे प्रसिद्ध चमत्कारों में से एक की स्मृति में: जब उन्होंने अपनी छोटी उँगली पर सात दिनों तक विशाल गोवर्धन पर्वत उठाकर वृंदावन के लोगों को इंद्र (वर्षा के देवता) द्वारा भेजी गई मूसलाधार बारिश से बचाया। इंद्र क्रोधित थे क्योंकि कृष्ण ने ग्रामीणों को उनकी पूजा करने से रोक दिया था। सात दिनों के बाद इंद्र ने हार मान ली और कृष्ण के सामने झुके। आज भी भक्त गोवर्धन परिक्रमा करते हैं — पवित्र पर्वत की 21 किमी की नंगे पैर परिक्रमा — भक्ति के कार्य के रूप में। अन्नकूट (भोजन का पर्वत) दूसरा मुख्य आकर्षण है — मंदिरों में 56 पके हुए व्यंजनों (छप्पन भोग) का अर्पण।",
  },
]

const BRAJ_SITES = [
  { place: 'Mathura', placeHi: 'मथुरा', en: "Krishna's birthplace — Krishna Janmasthan, Vishram Ghat (where Krishna rested after slaying Kamsa), Dwarkadhish Temple, and 25 sacred ghats along the Yamuna.", hi: "कृष्ण की जन्मभूमि — कृष्ण जन्मस्थान, विश्राम घाट (जहाँ कंस-वध के बाद कृष्ण विश्राम करने आए), द्वारकाधीश मंदिर, और यमुना तट पर 25 पवित्र घाट।" },
  { place: 'Vrindavan', placeHi: 'वृंदावन', en: '5,500+ temples across 10 sq km — Banke Bihari, Prem Mandir, ISKCON, Radha Raman, Madan Mohan, Radha Damodar, Nidhivan (where Krishna is still said to perform his Raslila at night).', hi: '10 वर्ग किमी में 5,500 से अधिक मंदिर — बाँके बिहारी, प्रेम मंदिर, इस्कॉन, राधारमण, मदन मोहन, राधा दामोदर, निधिवन (जहाँ कृष्ण आज भी रात में अपनी रासलीला करते बताए जाते हैं)।' },
  { place: 'Govardhan Hill', placeHi: 'गोवर्धन पर्वत', en: 'The sacred hill Krishna lifted to save Vrindavan from Indra\'s wrath. The 21 km Govardhan Parikrama is one of the holiest acts of devotion in Vaishnavism — thousands walk it daily.', hi: 'वह पवित्र पर्वत जिसे कृष्ण ने इंद्र के क्रोध से वृंदावन को बचाने के लिए उठाया था। 21 किमी की गोवर्धन परिक्रमा वैष्णव धर्म में सबसे पवित्र भक्ति कार्यों में से एक है — हजारों लोग इसे प्रतिदिन करते हैं।' },
  { place: 'Barsana', placeHi: 'बरसाना', en: "Radha Rani's birthplace, 43 km from Mathura. Home to the celebrated Radha Rani Temple atop Brahmagiri Hill and the world-famous Lathmar Holi.", hi: "राधा रानी की जन्मभूमि, मथुरा से 43 किमी दूर। ब्रह्मगिरि पहाड़ी पर प्रसिद्ध राधा रानी मंदिर और विश्वप्रसिद्ध लट्ठमार होली का घर।" },
  { place: 'Nandgaon', placeHi: 'नंदगाँव', en: "Village of Nanda Maharaj — Krishna's foster father. Home to the hilltop Nanda Bhavan temple. Famous for Nandotsav (Krishna's naming ceremony celebration).", hi: "नंद महाराज का गाँव — कृष्ण के पालक पिता। पहाड़ी पर स्थित नंद भवन मंदिर का घर। नंदोत्सव (कृष्ण के नामकरण संस्कार उत्सव) के लिए प्रसिद्ध।" },
  { place: 'Radha Kund', placeHi: 'राधा कुंड', en: 'The holiest of all the sacred ponds in Braj, near Govardhan. Believed to be as sacred as Radha herself. Bathing here on Bahulastami night is considered the highest act of devotion.', hi: 'ब्रज के सभी पवित्र कुंडों में सबसे पावन, गोवर्धन के पास। राधा के समान ही पवित्र माना जाता है। बहुलाष्टमी की रात यहाँ स्नान करना सर्वोच्च भक्ति कार्य माना जाता है।' },
  { place: 'Gokul / Mahavan', placeHi: 'गोकुल / महावन', en: "Where infant Krishna first lived with Nanda and Yashoda after being brought secretly across the Yamuna. Site of his earliest divine leelas — killing of Putana, Trinavarta, and other demons.", hi: "यहाँ शिशु कृष्ण यमुना पार कर गुप्त रूप से लाए जाने के बाद नंद और यशोदा के साथ पहले रहे। उनकी प्रारंभिक दिव्य लीलाओं का स्थान — पूतना, तृणावर्त और अन्य राक्षसों का वध।" },
]

export default async function RadheKrishnaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const hi = locale === 'hi'

  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative py-32 overflow-hidden"
        style={{ background: 'linear-gradient(165deg, #0d0520 0%, #1a0a2e 40%, #2d1400 75%, #180800 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #ffd700 0%, #ff7d0f 45%, transparent 70%)' }} />
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute rounded-full animate-pulse"
              style={{
                width:             i % 3 === 0 ? 7 : 4,
                height:            i % 3 === 0 ? 7 : 4,
                left:              `${4 + i * 5.5}%`,
                top:               `${12 + (i % 6) * 13}%`,
                background:        ['#ffd700', '#ff7d0f', '#c084fc', '#fbbf24', '#fb923c'][i % 5],
                opacity:           0.45,
                animationDelay:    `${i * 0.28}s`,
                animationDuration: `${2.8 + i * 0.2}s`,
              }} />
          ))}
        </div>
        <div className="container-custom relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.45em] mb-6 animate-pulse"
            style={{ color: '#ffd700' }}>
            ✦ पवित्र दर्शन · Divine Vision ✦
          </p>
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: '#ffd700', textShadow: '0 0 80px rgba(255,215,0,0.6), 0 4px 30px rgba(0,0,0,0.8)' }}>
            राधे कृष्णा
          </h1>
          <p className="text-2xl sm:text-3xl font-medium mb-6" style={{ color: 'rgba(255,215,0,0.7)' }}>
            Radhe Krishna
          </p>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: 'rgba(255,200,100,0.65)' }}>
            {hi
              ? 'वृंदावन की शाश्वत दिव्य प्रेम-लीला — जहाँ हर पत्थर, हर वृक्ष और हर नदी की लहर में कृष्ण का नाम गूँजता है।'
              : 'The eternal divine love story of Vrindavan — where every stone, every tree, and every ripple of the Yamuna resonates with the name of Krishna.'}
          </p>
          <p className="text-sm max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,180,80,0.45)' }}>
            {hi
              ? 'ब्रज भूमि — 5,000 वर्ष पूर्व भगवान कृष्ण की दिव्य बाल-लीलाओं की भूमि। एक यात्रा जो आत्मा को छू जाती है।'
              : 'Braj Bhoomi — the land where Lord Krishna performed his divine childhood leelas 5,000 years ago. A journey that touches the soul.'}
          </p>
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-28" style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.5))' }} />
            <span className="text-amber-500 text-2xl">🪷</span>
            <div className="h-px w-28" style={{ background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.5))' }} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              { en: '5,500+ Temples',          hi: '5,500+ मंदिर' },
              { en: 'Braj Bhoomi',              hi: 'ब्रज भूमि' },
              { en: 'Divine Pilgrimage',        hi: 'दिव्य तीर्थयात्रा' },
              { en: "Krishna's Homeland",       hi: 'कृष्ण की जन्मभूमि' },
              { en: 'Eternal Love Story',       hi: 'शाश्वत प्रेम-कथा' },
            ].map((tag) => (
              <span key={tag.en} className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}>
                {hi ? tag.hi : tag.en}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lord Krishna ── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#ff7d0f' }}>
                {hi ? 'विष्णु के आठवें अवतार' : 'The 8th Avatar of Lord Vishnu'}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {hi ? 'भगवान श्री कृष्ण' : 'Lord Shri Krishna'}
              </h2>
              <p className="text-xl font-semibold mb-6" style={{ color: '#ff7d0f' }}>
                {hi ? 'गोविंद · मुरलीधर · माखन चोर' : 'Govinda · Murlidhar · Makhan Chor'}
              </p>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                {hi ? (
                  <>
                    <p>भगवान कृष्ण भगवान विष्णु के आठवें अवतार हैं और हिंदू धर्म में सर्वाधिक पूजनीय देवताओं में से एक हैं। उनका जन्म <strong className="text-gray-800 dark:text-gray-200">मथुरा</strong> की एक जेल में देवकी और वसुदेव के यहाँ हुआ था, जब उनके मामा कंस — एक अत्याचारी शासक — ने उनके माता-पिता को कैद किया हुआ था। चमत्कारिक रूप से जेल के दरवाजे खुल गए और वसुदेव ने उफनती यमुना नदी को पार करके नवजात शिशु को गोकुल में सुरक्षित पहुँचाया।</p>
                    <p>कृष्ण का पालन-पोषण उनके पालक माता-पिता नंद और यशोदा ने <strong className="text-gray-800 dark:text-gray-200">वृंदावन</strong> में किया। <em>माखन चोर</em> (मक्खन चुराने वाले) और <em>मुरलीधर</em> (बाँसुरी वादक) के रूप में प्रसिद्ध, उन्होंने अपना बचपन गाय चराते, बाँसुरी बजाते और दिव्य लीलाएँ करते हुए बिताया — जिन्हें आज भी 5,000 साल बाद उत्सव के रूप में मनाया जाता है। उनकी बाँसुरी की धुन इतनी मधुर थी कि वन-वन के पशु-पक्षी, नदियाँ और स्वयं वृक्ष भी मंत्रमुग्ध हो जाते थे।</p>
                    <p>कुरुक्षेत्र के युद्धक्षेत्र में अर्जुन को दिए गए उनके उपदेश — <strong className="text-gray-800 dark:text-gray-200">श्रीमद् भगवद्गीता</strong> — हिंदू दर्शन की नींव हैं। 700 श्लोकों में निहित यह ज्ञान आज भी लाखों लोगों को कर्तव्य, भक्ति और मोक्ष के मार्ग पर मार्गदर्शन करता है। कृष्ण को <em>जगद्गुरु</em> — विश्व के गुरु — कहा जाता है।</p>
                  </>
                ) : (
                  <>
                    <p>Lord Krishna is the eighth avatar of Lord Vishnu and one of the most revered deities in Hinduism. He was born to Devaki and Vasudeva in a prison cell in <strong className="text-gray-800 dark:text-gray-200">Mathura</strong>, while his uncle Kamsa — a tyrant king — had imprisoned his parents after a divine prophecy foretold that the eighth son of Devaki would slay him. Miraculously, the prison chains broke, the guards fell asleep, and Vasudeva carried the newborn across the flooded Yamuna River to safety in Gokul under a moonless, stormy night.</p>
                    <p>Krishna was raised by his foster parents Nanda Maharaj and Mother Yashoda in <strong className="text-gray-800 dark:text-gray-200">Vrindavan</strong>. Known as <em>Makhan Chor</em> (the butter thief) and <em>Murlidhar</em> (the flute bearer), he spent his childhood herding cows, enchanting all living beings with his divine flute, and performing miraculous leelas (divine pastimes) that are celebrated to this day, 5,000 years later. His flute melody was so divine that animals, rivers, and trees would fall into a trance listening to it.</p>
                    <p>His teachings in the <strong className="text-gray-800 dark:text-gray-200">Bhagavad Gita</strong>, delivered to Arjuna on the battlefield of Kurukshetra, remain the cornerstone of Hindu philosophy — 700 verses of timeless wisdom guiding millions on the path of duty (dharma), devotion (bhakti), knowledge (jnana), and liberation (moksha). Krishna is called <em>Jagadguru</em> — the teacher of the entire world.</p>
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-8">
                {[
                  { label: hi ? 'जन्मस्थान' : 'Birthplace',   value: hi ? 'मथुरा'         : 'Mathura' },
                  { label: hi ? 'बाललीला'   : 'Childhood',    value: hi ? 'वृंदावन'       : 'Vrindavan' },
                  { label: hi ? 'पवित्र ग्रंथ' : 'Sacred Text', value: hi ? 'भगवद्गीता' : 'Bhagavad Gita' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-2xl"
                    style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-muted)' }}>
                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {KRISHNA_IMGS.map((img) => (
                <div key={img.src} className="rounded-2xl overflow-hidden shadow-2xl group"
                  style={{ border: '2px solid rgba(255,125,15,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                  <div className="relative aspect-3/4">
                    <Image src={img.src} alt={img.alt} fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="px-3 py-2 text-center" style={{ background: 'rgba(255,125,15,0.08)' }}>
                    <p className="text-xs text-orange-400/80 leading-snug">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Radha Rani ── */}
      <section className="py-24" style={{ background: 'var(--bg-surface-muted)' }}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              {RADHA_IMGS.map((img) => (
                <div key={img.src} className="rounded-2xl overflow-hidden shadow-2xl group"
                  style={{ border: '2px solid rgba(236,72,153,0.3)', boxShadow: '0 20px 50px rgba(236,72,153,0.1)' }}>
                  <div className="relative aspect-3/4">
                    <Image src={img.src} alt={img.alt} fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="px-3 py-2 text-center" style={{ background: 'rgba(236,72,153,0.06)' }}>
                    <p className="text-xs leading-snug" style={{ color: '#ec4899' }}>{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#ec4899' }}>
                {hi ? 'बरसाना में जन्मी · वृंदावन की महारानी' : 'Born in Barsana · Queen of Vrindavan'}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2 text-gray-900 dark:text-gray-100"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {hi ? 'श्री राधा रानी' : 'Shri Radha Rani'}
              </h2>
              <p className="text-xl font-semibold mb-6" style={{ color: '#ec4899' }}>
                {hi ? 'ह्लादिनी शक्ति · प्रेम की देवी' : 'Hladini Shakti · Goddess of Divine Love'}
              </p>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                {hi ? (
                  <>
                    <p>राधा रानी भगवान कृष्ण की शाश्वत प्रिया और वृंदावन की महारानी हैं। <strong className="text-gray-800 dark:text-gray-200">बरसाना</strong> में वृषभानु महाराज के घर जन्मी राधा, प्रेम, कोमलता और भक्ति की देवी हैं — कृष्ण की अपनी <em>ह्लादिनी शक्ति</em> (दिव्य आनंद की शक्ति)। कहा जाता है कि जब कृष्ण बाँसुरी बजाते थे, तो वह बाँसुरी की धुन वास्तव में राधा के नाम की पुकार थी।</p>
                    <p>कई वैष्णव परंपराओं में राधा का स्थान स्वयं कृष्ण से भी ऊँचा माना जाता है। ऐसा कहा जाता है कि <em>"राधा के बिना कृष्ण अधूरे हैं।"</em> वे <strong className="text-gray-800 dark:text-gray-200">निःस्वार्थ प्रेम</strong> की साक्षात् मूर्त हैं — एक ऐसा प्रेम जो सभी सांसारिक सीमाओं को पार करता है और आत्मा को परमात्मा से मिलाता है। वैष्णव दर्शन में राधा-कृष्ण का प्रेम आत्मा और परमात्मा के मिलन का प्रतीक है।</p>
                    <p>उनकी दिव्य प्रेम-कथा, <strong className="text-gray-800 dark:text-gray-200">रासलीला</strong>, केवल एक प्रेम-कहानी नहीं है — यह परमात्मा की ओर आत्मा की यात्रा का रूपक है। इसने हजारों वर्षों से भारत भर में कला, संगीत, कविता और भक्ति को प्रेरित किया है। जयदेव की <em>गीतगोविंद</em> से लेकर मीरा के भजनों तक, राधा का प्रेम मानव हृदय की सर्वोच्च अभिव्यक्ति है।</p>
                  </>
                ) : (
                  <>
                    <p>Radha Rani is the eternal consort of Lord Krishna and the queen of Vrindavan. Born in <strong className="text-gray-800 dark:text-gray-200">Barsana</strong> to Vrishabhanu Maharaj, Radha is revered as the goddess of love, tenderness, and devotion — Krishna's own <em>hladini shakti</em> (the power of divine bliss). It is said that when Krishna played his flute, the melody was in reality a call to Radha alone.</p>
                    <p>In many Vaishnava traditions, Radha holds a place even above Krishna himself. <em>"Without Radha, Krishna is incomplete."</em> She is the living embodiment of <strong className="text-gray-800 dark:text-gray-200">unconditional love</strong> — a love so pure it transcends all worldly boundaries and unites the soul with the divine. In Vaishnava philosophy, the love of Radha-Krishna symbolises the eternal relationship between the individual soul (jivatma) and the Supreme Soul (Paramatma).</p>
                    <p>Their divine love story, the <strong className="text-gray-800 dark:text-gray-200">Raslila</strong>, is not merely a tale of romance but a profound metaphor for the soul's journey toward the divine. It has inspired thousands of years of art, music, poetry, and bhakti across India and the world — from Jayadeva's <em>Gita Govinda</em> to Mirabai's immortal bhajans. Radha's love is considered the highest expression of the human heart.</p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {(hi
                  ? ['बरसाना में जन्मी', 'गोपियों की प्रमुख', 'कृष्ण की शाश्वत प्रिया', 'प्रेम की देवी', 'ह्लादिनी शक्ति']
                  : ['Born in Barsana', 'Chief of Gopis', 'Eternal Consort of Krishna', 'Goddess of Love', 'Hladini Shakti']
                ).map((tag) => (
                  <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.25)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sacred Vrindavan ── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container-custom text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#ff7d0f' }}>
            {hi ? 'धाम की महिमा' : 'The Glory of the Dham'}
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {hi ? 'पवित्र वृंदावन धाम' : <><span style={{ color: '#ff7d0f' }}>वृंदावन</span> — Sacred Dham</>}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed text-sm sm:text-base">
            {hi
              ? 'यमुना नदी के पश्चिमी तट पर स्थित, मथुरा से लगभग 15 किमी उत्तर में और दिल्ली से 125 किमी दूर, वृंदावन हिंदू धर्म के सबसे पवित्र नगरों में से एक है। यह वह भूमि है जहाँ कृष्ण ने अपनी दिव्य बाललीलाएँ कीं — यहाँ का हर वन-उपवन, हर घाट और हर गली आज भी उनकी उपस्थिति से गुंजायमान है। 5,500 से अधिक मंदिर, असंख्य कुंड और निधिवन जैसे रहस्यमय स्थल इस धाम को अलौकिक बनाते हैं।'
              : 'Situated on the western bank of the sacred Yamuna River, approximately 15 km north of Mathura and 125 km from Delhi, Vrindavan is one of the holiest cities in all of Hinduism. This is the land where Krishna performed his divine childhood leelas — every forest grove, every ghat, and every laneway still resonates with his presence 5,000 years later. With over 5,500 temples, countless sacred ponds, and mystical forests like Nidhivan, Vrindavan is unlike any other place on earth.'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              { num: '5,500+', label: hi ? 'मंदिर' : 'Temples',            emoji: '🛕' },
              { num: '125 km', label: hi ? 'दिल्ली से'  : 'From Delhi',    emoji: '🗺️' },
              { num: '15 km',  label: hi ? 'मथुरा से'  : 'From Mathura',   emoji: '📍' },
              { num: '5,000+', label: hi ? 'वर्षों का इतिहास' : 'Years of History', emoji: '📜' },
            ].map((stat) => (
              <div key={stat.label} className="card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl mb-3">{stat.emoji}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.num}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VRINDAVAN_IMGS.map((img) => (
              <div key={img.src} className="rounded-2xl overflow-hidden shadow-xl group"
                style={{ border: '1px solid rgba(255,125,15,0.2)' }}>
                <div className="relative aspect-4/3">
                  <Image src={img.src} alt={img.alt} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="px-3 py-2 text-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
                  <p className="text-xs text-amber-200/70 leading-snug">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Major Temples ── */}
      <section className="py-24" style={{ background: 'var(--bg-surface-muted)' }}>
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#ff7d0f' }}>
              {hi ? 'दिव्य गंतव्य' : 'Divine Destinations'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100"
              style={{ fontFamily: 'var(--font-serif)' }}>
              {hi ? 'ब्रज के पवित्र मंदिर' : 'Sacred Temples of Braj'}
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
              {hi
                ? 'प्राचीन तीर्थस्थलों से लेकर भव्य आधुनिक मंदिरों तक — प्रत्येक मंदिर शाश्वत भक्ति की एक कहानी कहता है'
                : 'From ancient shrines to magnificent modern marvels — each temple tells a story of eternal devotion that has endured for centuries'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLES.map((temple) => (
              <div key={temple.name} className="card rounded-2xl p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl shrink-0">{temple.emoji}</div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">{temple.name}</h3>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#ff7d0f' }}>{temple.nameHi}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-orange-500 shrink-0" />
                      <span className="text-xs text-gray-400">{temple.location}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {hi ? temple.hi : temple.en}
                </p>
                <div className="flex items-center gap-1.5">
                  <Star size={11} fill="#ff7d0f" style={{ color: '#ff7d0f' }} />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--surface-saffron)', color: '#ff7d0f' }}>
                    {hi ? temple.highlightHi : temple.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Festivals ── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#ff7d0f' }}>
              {hi ? 'त्योहार · उत्सव' : 'Utsav · Sacred Festivals'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100"
              style={{ fontFamily: 'var(--font-serif)' }}>
              {hi ? 'ब्रज के पवित्र त्योहार' : 'Festivals of Braj'}
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
              {hi
                ? 'ब्रज क्षेत्र अपने त्योहारों को ऐसे मनाता है जैसा भारत में कहीं और नहीं — सदियों पुरानी अटूट परंपराओं के साथ'
                : 'The Braj region celebrates festivals unlike anywhere else in India — with centuries of unbroken tradition and overwhelming spiritual energy'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {FESTIVALS.map((f) => (
              <div key={f.name} className="card rounded-2xl p-7 group hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl shrink-0">{f.emoji}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl">{f.name}</h3>
                    <p className="text-base font-semibold mt-0.5" style={{ color: f.color }}>{f.nameHi}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Calendar size={12} style={{ color: f.color }} />
                      <span className="text-xs font-semibold" style={{ color: f.color }}>
                        {hi ? f.timingHi : f.timing}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {hi ? f.hi : f.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Braj Region ── */}
      <section className="py-24" style={{ background: 'var(--bg-surface-muted)' }}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#ff7d0f' }}>
                {hi ? 'ब्रज भूमि' : 'Braj Bhoomi'}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {hi ? <>पवित्र <span style={{ color: '#ff7d0f' }}>ब्रज भूमि</span></> : <>The Sacred <span style={{ color: '#ff7d0f' }}>Braj Bhoomi</span></>}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                {hi ? (
                  <>
                    <p>ब्रज — संस्कृत शब्द <em>व्रज</em> से उत्पन्न, जिसका अर्थ है "चरागाह" या "गायों के लिए आश्रय" — उत्तर भारत का एक ऐतिहासिक क्षेत्र है जो मथुरा-वृंदावन, उत्तर प्रदेश को केंद्र में रखता है। यमुना के दोनों किनारों पर लगभग 2,500 वर्ग किलोमीटर में फैला यह क्षेत्र हरियाणा, राजस्थान और मध्य प्रदेश के कुछ हिस्सों तक भी विस्तृत है।</p>
                    <p>यह <strong className="text-gray-800 dark:text-gray-200">कृष्ण तीर्थयात्रा मार्ग का मुख्य केंद्र</strong> है, जिसमें कृष्ण की दिव्य बाललीलाओं के सभी स्थान शामिल हैं: मथुरा (जन्मस्थान), वृंदावन (जहाँ वे रहे), गोवर्धन पर्वत (जिसे उन्होंने ग्रामवासियों की रक्षा के लिए उठाया), बरसाना (राधा की जन्मभूमि), और नंदगाँव (जहाँ उनके पालक पिता नंद रहते थे)।</p>
                    <p>ब्रज परिक्रमा — 84 कोस (लगभग 268 किमी) की पैदल यात्रा जो सभी प्रमुख ब्रज स्थलों को कवर करती है — को हिंदू धर्म में सबसे पवित्र तीर्थयात्राओं में से एक माना जाता है। लाखों भक्त इसे कार्तिक मास में करते हैं।</p>
                  </>
                ) : (
                  <>
                    <p>Braj — derived from the Sanskrit word <em>Vraja</em> (व्रज), meaning "pasture" or "shelter for cattle" — is a historic region in northern India centred on Mathura-Vrindavan, Uttar Pradesh. Spanning approximately 2,500 square kilometres along both banks of the Yamuna, it extends into parts of Haryana, Rajasthan, and Madhya Pradesh.</p>
                    <p>This is the <strong className="text-gray-800 dark:text-gray-200">main centre of the Krishna pilgrimage circuit</strong>, encompassing all the places of Krishna's divine childhood: Mathura (his birthplace), Vrindavan (where he lived and played), Govardhan Hill (which he lifted to protect the villagers), Barsana (Radha's birthplace), and Nandgaon (where his foster father Nanda Maharaj lived).</p>
                    <p>The Braj Parikrama — a 84-kos (approximately 268 km) walking pilgrimage covering all the major Braj sites — is considered one of the holiest pilgrimages in Hinduism. Millions of devotees undertake it during the month of Kartik, completing the entire circuit on foot as an act of supreme devotion.</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-5 text-xl"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {hi ? 'प्रमुख पवित्र स्थल' : 'Key Sacred Sites'}
              </h3>
              <div className="space-y-3">
                {BRAJ_SITES.map((site) => (
                  <div key={site.place} className="flex gap-3 p-4 rounded-xl transition-colors hover:shadow-md"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)' }}>
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: '#ff7d0f' }} />
                    <div>
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                        {site.place} <span className="font-medium text-orange-500">· {site.placeHi}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{hi ? site.hi : site.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0500 0%, #2d0f00 50%, #1a0a00 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,125,15,0.15), transparent 70%)' }} />
        <div className="container-custom relative z-10 text-center">
          <p className="text-5xl mb-6">🪷</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)', textShadow: '0 0 40px rgba(255,125,15,0.3)' }}>
            {hi ? 'अपनी दिव्य यात्रा की योजना बनाएँ' : 'Plan Your Divine Yatra'}
          </h2>
          <p className="max-w-lg mx-auto mb-3 text-base leading-relaxed" style={{ color: 'rgba(255,200,150,0.75)' }}>
            {hi
              ? 'मथुरा-वृंदावन की पवित्र भूमि का अनुभव करें हमारे विशेष तीर्थयात्रा पैकेज के साथ — AC वाहन, अनुभवी गाइड, और एक यात्रा जो आपके हृदय में सदा के लिए बस जाएगी।'
              : 'Experience the sacred land of Mathura and Vrindavan with our curated pilgrimage packages — AC vehicles, expert local guides, and a spiritual journey you will carry in your heart forever.'}
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(255,180,100,0.45)' }}>
            {hi ? '✦ राधे कृष्ण · हरे कृष्ण ✦' : '✦ Radhe Krishna · Hare Krishna ✦'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/packages"
              className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2 rounded-full font-semibold">
              {hi ? 'पैकेज देखें' : 'Explore Packages'} <ArrowRight size={18} />
            </Link>
            <Link href="/contact"
              className="px-8 py-4 rounded-full font-semibold text-base transition-all inline-flex items-center gap-2 hover:bg-white/10"
              style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#fff' }}>
              {hi ? 'संपर्क करें' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
