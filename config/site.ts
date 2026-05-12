export const siteConfig = {
  name: 'Mathura Vrindavan Dham Yatra',
  shortName: 'MV Dham Yatra',
  tagline: 'Experience the Divine Land of Lord Krishna',
  description:
    'Best tour packages, taxi services, hotel assistance for Mathura & Vrindavan pilgrimage trips.',
  url: 'https://mathuravrindavandhamyatra.com',
  phone: '+91 85348 90870',
  whatsapp: '918534890870',
  email: 'info@mathuravrindavandhamyatra.com',
  address: 'Mathura, Uttar Pradesh, India — 281001',
  social: {
    facebook: 'https://facebook.com/mathuravrindavandhamyatra',
    instagram: 'https://instagram.com/mathuravrindavandhamyatra',
    youtube: 'https://youtube.com/@mathuravrindavandhamyatra',
  },
}

export const cars = [
  {
    id: 'wagonr',
    name: 'Wagon R',
    image: '/images/cars/wagonr.png',
    capacity: '4 Passengers',
    luggage: '2 Bags',
    ac: true,
    basePrice: 2000,
    pricePerKm: 12,
    features: ['AC', 'Music System', 'GPS'],
    type: 'sedan',
  },
  {
    id: 'swift',
    name: 'Swift Dzire',
    image: '/images/cars/swift.png',
    capacity: '4 Passengers',
    luggage: '2 Bags',
    ac: true,
    basePrice: 2000,
    pricePerKm: 12,
    features: ['AC', 'Music System', 'GPS'],
    type: 'sedan',
  },
  {
    id: 'eeco',
    name: 'Maruti Eeco',
    image: '/images/cars/eeco.png',
    capacity: '7 Passengers',
    luggage: '4 Bags',
    ac: true,
    basePrice: 2500,
    pricePerKm: 14,
    features: ['AC', 'Spacious', 'GPS'],
    type: 'van',
  },
  {
    id: 'ertiga',
    name: 'Maruti Ertiga',
    image: '/images/cars/ertiga.png',
    capacity: '7 Passengers',
    luggage: '4 Bags',
    ac: true,
    basePrice: 3000,
    pricePerKm: 16,
    features: ['AC', 'Music System', 'GPS', 'Comfortable'],
    type: 'suv',
  },
  {
    id: 'innova',
    name: 'Toyota Innova',
    image: '/images/cars/innova.png',
    capacity: '8 Passengers',
    luggage: '5 Bags',
    ac: true,
    basePrice: 4500,
    pricePerKm: 20,
    features: ['AC', 'Premium', 'GPS', 'Extra Legroom'],
    type: 'suv',
  },
  {
    id: 'crysta',
    name: 'Innova Crysta',
    image: '/images/cars/crysta.png',
    capacity: '7 Passengers',
    luggage: '5 Bags',
    ac: true,
    basePrice: 5500,
    pricePerKm: 24,
    features: ['AC', 'Luxury', 'GPS', 'USB Charging'],
    type: 'luxury',
  },
  {
    id: 'karens',
    name: 'Kia Karens',
    image: '/images/cars/karens.png',
    capacity: '7 Passengers',
    luggage: '5 Bags',
    ac: true,
    basePrice: 6000,
    pricePerKm: 24,
    features: ['AC', 'Luxury', 'GPS', 'USB Charging'],
    type: 'luxury',
  },
]

export const durations = [
  { id: '1day',  label: '1 Day',              nights: 0, days: 1 },
  { id: '2days', label: '2 Days / 1 Night',   nights: 1, days: 2 },
  { id: '3days', label: '3 Days / 2 Nights',  nights: 2, days: 3 },
  { id: '4days', label: '4 Days / 3 Nights',  nights: 3, days: 4 },
  { id: '7days', label: '7 Days / 6 Nights',  nights: 6, days: 7 },
]

export const cities = [
  { id: 'mathura',   name: 'Mathura',   state: 'Uttar Pradesh' },
  { id: 'vrindavan', name: 'Vrindavan', state: 'Uttar Pradesh' },
  { id: 'gokul',     name: 'Gokul',     state: 'Uttar Pradesh' },
  { id: 'govardhan', name: 'Govardhan', state: 'Uttar Pradesh' },
  { id: 'barsana',   name: 'Barsana',   state: 'Uttar Pradesh' },
  { id: 'nandgaon',  name: 'Nandgaon',  state: 'Uttar Pradesh' },
]

export const placeTypes = [
  { id: 'temple',      label: 'Temple',      icon: '🛕' },
  { id: 'ghat',        label: 'Ghat',        icon: '🌊' },
  { id: 'garden',      label: 'Garden',      icon: '🌺' },
  { id: 'museum',      label: 'Museum',      icon: '🏛️' },
  { id: 'market',      label: 'Market',      icon: '🛒' },
  { id: 'sacred-site', label: 'Sacred Site', icon: '🙏' },
  { id: 'hill',        label: 'Hill',        icon: '⛰️' },
]

export const bookingStatuses = {
  PENDING:         'pending',
  CONFIRMED:       'confirmed',
  DRIVER_ASSIGNED: 'driver_assigned',
  ONGOING:         'ongoing',
  COMPLETED:       'completed',
  CANCELLED:       'cancelled',
} as const

export const userRoles = {
  CUSTOMER: 'customer',
  DRIVER:   'driver',
  ADMIN:    'admin',
} as const

export const addons = [
  {
    id: 'hotel_help',
    label: 'Hotel Finding Assistance',
    description: 'We help find & book best hotels in your budget',
    price: 0,
    icon: '🏨',
  },
  {
    id: 'guide',
    label: 'Local Guide',
    description: 'Expert local guide who knows every temple story',
    price: 500,
    icon: '🧭',
  },
  {
    id: 'airport_pickup',
    label: 'Airport / Station Pickup',
    description: 'Pickup from Mathura Junction or Agra Airport',
    price: 300,
    icon: '✈️',
  },
  {
    id: 'restaurant_help',
    label: 'Restaurant Recommendations',
    description: 'Pure veg restaurant guide for the holy city',
    price: 0,
    icon: '🍽️',
  },
  {
    id: 'puja_arrangement',
    label: 'Puja Arrangements',
    description: 'Yamuna aarti, special puja booking assistance',
    price: 200,
    icon: '🪔',
  },
]