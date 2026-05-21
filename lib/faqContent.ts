export interface FaqItem { q: string; a: string }
export interface FaqCategory { category: string; emoji: string; faqs: FaqItem[] }

const FAQ_EN: FaqCategory[] = [
  {
    category: 'Booking & Payment', emoji: '💳',
    faqs: [
      { q: 'How do I book a tour?', a: 'You can book directly on our website by clicking "Book Now", call us, or send a WhatsApp message. We confirm your booking within 1 hour with all trip details.' },
      { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm), bank transfer, credit/debit cards via Razorpay, and cash on arrival. A 30% advance secures your booking.' },
      { q: 'Is advance payment required?', a: 'For most packages, a 30% advance is required to confirm booking. The remaining 70% can be paid on the day of the trip before departure.' },
      { q: 'Can I book on the same day?', a: 'Yes, same-day bookings are available subject to vehicle availability. We recommend booking at least 1 day in advance, and 1 week in advance during festivals.' },
      { q: 'Do you offer discounts for group bookings?', a: 'Yes, groups of 10 or more get special pricing. Contact us directly on WhatsApp for a custom group quote.' },
    ],
  },
  {
    category: 'Tour Packages', emoji: '🚗',
    faqs: [
      { q: 'What is included in the package price?', a: 'The price includes AC vehicle, experienced driver, all fuel charges, parking fees, and inter-city transfers. Meals, hotel stays, and entry fees are not included unless specifically mentioned.' },
      { q: 'Can I customize the itinerary?', a: 'Absolutely! We specialize in custom itineraries. Tell us your temples of interest, duration, group size, and budget — we will create a personalized plan.' },
      { q: 'Do you provide a guide along with the driver?', a: 'Our drivers have deep local knowledge. A dedicated professional guide is available as an add-on for ₹500/day.' },
      { q: 'What vehicles are available?', a: 'Swift Dzire (4 pax), Maruti Eeco (7 pax), Maruti Ertiga (7 pax), Toyota Innova (8 pax), and Innova Crysta (7 pax). All AC, GPS-equipped, and regularly serviced.' },
      { q: 'Do you offer airport or railway station pickup?', a: 'Yes, pickup from Mathura Junction, Agra Airport, and Delhi IGI Airport. This can be added when booking.' },
    ],
  },
  {
    category: 'Hotels & Restaurants', emoji: '🏨',
    faqs: [
      { q: 'Do you help with hotel bookings?', a: 'Yes, hotel finding assistance is completely free. We know the best hotels in Mathura, Vrindavan, Govardhan and Barsana across all budgets.' },
      { q: 'Are restaurants in Mathura Vrindavan vegetarian?', a: 'Yes, the vast majority serve only pure vegetarian food as the cities are sacred to Lord Krishna. We can recommend the best options for your budget.' },
      { q: 'Can you arrange prasadam for us?', a: 'Yes, we guide you to temples where prasadam is distributed and also to dhaba-style places serving traditional Braj cuisine.' },
    ],
  },
  {
    category: 'Cancellation & Refunds', emoji: '❌',
    faqs: [
      { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before trip — 100% refund. 12–24 hours before: 80% refund. Less than 12 hours: 50% refund. No-shows: no refund.' },
      { q: 'How long does the refund take?', a: 'Refunds are processed within 3-5 business days to the original payment method.' },
      { q: "What if the driver doesn't show up?", a: "This has never happened in our 5+ years of service. But if it ever does, you get a 100% refund and we arrange an alternative vehicle within 30 minutes." },
    ],
  },
  {
    category: 'Places & Darshan', emoji: '🛕',
    faqs: [
      { q: 'Which is the most important temple in Mathura?', a: 'Shri Krishna Janmabhoomi (birthplace of Krishna) is the most sacred. Dwarkadhish Temple and Vishram Ghat are also must-visits.' },
      { q: 'What is the best time to visit Mathura Vrindavan?', a: 'October to March is the best time — pleasant weather. Janmashtami (August) and Holi (March) are the most spectacular festivals. Avoid May-June summers.' },
      { q: 'How many temples can we visit in one day?', a: 'On a typical one-day tour you can comfortably visit 6-8 major temples and ghats across Mathura and Vrindavan.' },
      { q: 'Is Govardhan Parikrama possible in a day trip?', a: 'Yes. We recommend starting by 5 AM. E-rickshaws are available on the Parikrama path for those who cannot walk the full 21 km.' },
    ],
  },
]

const FAQ_HI: FaqCategory[] = [
  {
    category: 'बुकिंग और भुगतान', emoji: '💳',
    faqs: [
      { q: 'टूर कैसे बुक करें?', a: '"अभी बुक करें" पर क्लिक करके, कॉल करके, या व्हाट्सऐप संदेश भेजकर सीधे हमारी वेबसाइट पर बुक करें। हम 1 घंटे के भीतर सभी यात्रा विवरण के साथ आपकी बुकिंग की पुष्टि करते हैं।' },
      { q: 'आप कौन से भुगतान तरीके स्वीकार करते हैं?', a: 'हम UPI (GPay, PhonePe, Paytm), बैंक ट्रांसफर, Razorpay के माध्यम से क्रेडिट/डेबिट कार्ड, और नकद स्वीकार करते हैं। 30% अग्रिम भुगतान से बुकिंग सुनिश्चित होती है।' },
      { q: 'क्या अग्रिम भुगतान आवश्यक है?', a: 'अधिकांश पैकेज के लिए बुकिंग की पुष्टि के लिए 30% अग्रिम आवश्यक है। शेष 70% यात्रा के दिन प्रस्थान से पहले भुगतान किया जा सकता है।' },
      { q: 'क्या उसी दिन बुकिंग संभव है?', a: 'हाँ, वाहन उपलब्धता के आधार पर उसी दिन बुकिंग उपलब्ध है। कम से कम 1 दिन पहले और त्यौहारों के दौरान 1 सप्ताह पहले बुकिंग की सिफारिश की जाती है।' },
      { q: 'क्या समूह बुकिंग पर छूट मिलती है?', a: 'हाँ, 10 या अधिक लोगों के समूह को विशेष मूल्य निर्धारण मिलता है। व्यक्तिगत समूह उद्धरण के लिए सीधे व्हाट्सऐप पर संपर्क करें।' },
    ],
  },
  {
    category: 'टूर पैकेज', emoji: '🚗',
    faqs: [
      { q: 'पैकेज मूल्य में क्या शामिल है?', a: 'मूल्य में AC वाहन, अनुभवी ड्राइवर, सभी ईंधन शुल्क, पार्किंग शुल्क और अंतर-शहर स्थानांतरण शामिल हैं। भोजन, होटल ठहराव और प्रवेश शुल्क शामिल नहीं हैं जब तक विशेष रूप से उल्लेख न हो।' },
      { q: 'क्या यात्रा-क्रम अनुकूलित किया जा सकता है?', a: 'बिल्कुल! हम कस्टम यात्रा-क्रम में विशेषज्ञ हैं। हमें अपने रुचि के मंदिर, अवधि, समूह आकार और बजट बताएं — हम व्यक्तिगत योजना बनाएंगे।' },
      { q: 'क्या ड्राइवर के साथ गाइड भी मिलता है?', a: 'हमारे ड्राइवरों को गहरा स्थानीय ज्ञान है। ₹500/दिन के अतिरिक्त शुल्क पर समर्पित पेशेवर गाइड उपलब्ध है।' },
      { q: 'कौन से वाहन उपलब्ध हैं?', a: 'स्विफ्ट डिजायर (4 सीट), मारुति ईको (7 सीट), मारुति अर्टिगा (7 सीट), टोयोटा इनोवा (8 सीट) और इनोवा क्रिस्टा (7 सीट)। सभी AC, GPS-सुसज्जित और नियमित रूप से सर्विस किए गए।' },
      { q: 'क्या हवाई अड्डे या रेलवे स्टेशन से पिकअप मिलता है?', a: 'हाँ, मथुरा जंक्शन, आगरा हवाई अड्डे और दिल्ली IGI हवाई अड्डे से पिकअप। बुकिंग के समय यह जोड़ा जा सकता है।' },
    ],
  },
  {
    category: 'होटल और रेस्टोरेंट', emoji: '🏨',
    faqs: [
      { q: 'क्या आप होटल बुकिंग में सहायता करते हैं?', a: 'हाँ, होटल खोजने में सहायता पूरी तरह निःशुल्क है। हम मथुरा, वृन्दावन, गोवर्धन और बरसाना में सभी बजट के सर्वोत्तम होटल जानते हैं।' },
      { q: 'क्या मथुरा वृन्दावन के रेस्टोरेंट शाकाहारी हैं?', a: 'हाँ, अधिकांश केवल शुद्ध शाकाहारी भोजन परोसते हैं क्योंकि ये शहर भगवान कृष्ण के लिए पवित्र हैं। हम आपके बजट के लिए सर्वोत्तम विकल्प सुझा सकते हैं।' },
      { q: 'क्या आप हमारे लिए प्रसाद की व्यवस्था कर सकते हैं?', a: 'हाँ, हम आपको उन मंदिरों तक ले जाते हैं जहाँ प्रसाद वितरित किया जाता है और पारंपरिक ब्रज व्यंजन परोसने वाले ढाबे में भी।' },
    ],
  },
  {
    category: 'रद्दीकरण और धनवापसी', emoji: '❌',
    faqs: [
      { q: 'आपकी रद्दीकरण नीति क्या है?', a: 'यात्रा से 24 घंटे पहले निःशुल्क रद्दीकरण — 100% धनवापसी। 12–24 घंटे पहले: 80% धनवापसी। 12 घंटे से कम: 50% धनवापसी। नो-शो: कोई धनवापसी नहीं।' },
      { q: 'धनवापसी में कितना समय लगता है?', a: 'मूल भुगतान विधि पर 3-5 व्यापार दिवसों के भीतर धनवापसी प्रक्रिया की जाती है।' },
      { q: 'यदि ड्राइवर नहीं आता तो क्या होगा?', a: 'हमारी 5+ वर्षों की सेवा में ऐसा कभी नहीं हुआ। लेकिन यदि कभी हो, तो आपको 100% धनवापसी मिलेगी और हम 30 मिनट के भीतर वैकल्पिक वाहन की व्यवस्था करेंगे।' },
    ],
  },
  {
    category: 'स्थान और दर्शन', emoji: '🛕',
    faqs: [
      { q: 'मथुरा में सबसे महत्वपूर्ण मंदिर कौन सा है?', a: 'श्री कृष्ण जन्मभूमि (कृष्ण का जन्मस्थान) सबसे पवित्र है। द्वारकाधीश मंदिर और विश्राम घाट भी अवश्य देखने योग्य हैं।' },
      { q: 'मथुरा वृन्दावन जाने का सबसे अच्छा समय क्या है?', a: 'अक्टूबर से मार्च सबसे अच्छा समय है — सुखद मौसम। जन्माष्टमी (अगस्त) और होली (मार्च) सबसे शानदार उत्सव हैं। मई-जून की गर्मी से बचें।' },
      { q: 'एक दिन में कितने मंदिर देखे जा सकते हैं?', a: 'एक सामान्य एक दिवसीय दौरे पर आप मथुरा और वृन्दावन में 6-8 प्रमुख मंदिर और घाट आराम से देख सकते हैं।' },
      { q: 'क्या गोवर्धन परिक्रमा दिन की यात्रा में संभव है?', a: 'हाँ। हम सुबह 5 बजे से शुरू करने की सिफारिश करते हैं। जो पूरे 21 किमी नहीं चल सकते उनके लिए ई-रिक्शा उपलब्ध हैं।' },
    ],
  },
]

export function getFaqData(locale: string): FaqCategory[] {
  return locale === 'hi' ? FAQ_HI : FAQ_EN
}
