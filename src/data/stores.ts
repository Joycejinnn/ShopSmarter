import { Store } from '../types';

export const DEMO_STORES: Store[] = [
  {
    id: 'store_harris_teeter',
    name: 'Harris Teeter (Meadowmont)',
    category: 'supermarket',
    address: '116 Meadowmont Village Cir, Chapel Hill, NC',
    city: 'Chapel Hill',
    lat: 35.9082,
    lng: -79.0065,
    openingHours: '6:00 AM - 11:00 PM',
    demoNote: 'Full-service grocery with fresh produce, organic dairy, and pantry staples.',
    color: '#E63946' // Red accent
  },
  {
    id: 'store_food_lion',
    name: 'Food Lion (Rams Plaza)',
    category: 'supermarket',
    address: '1720 Fordham Blvd, Chapel Hill, NC',
    city: 'Chapel Hill',
    lat: 35.9324,
    lng: -79.0336,
    openingHours: '7:00 AM - 10:00 PM',
    demoNote: 'Budget-friendly supermarket with everyday staples and packaged goods.',
    color: '#1D3557' // Navy accent
  },
  {
    id: 'store_target',
    name: 'Target (Chapel Hill Blvd)',
    category: 'hypermarket',
    address: '4037 Durham-Chapel Hill Blvd, Durham, NC',
    city: 'Durham',
    lat: 35.9525,
    lng: -78.9616,
    openingHours: '8:00 AM - 10:00 PM',
    demoNote: 'Household essentials, paper products, personal care, and packaged groceries.',
    color: '#CC0000' // Target red
  },
  {
    id: 'store_walmart',
    name: 'Walmart Supercenter (New Hope)',
    category: 'hypermarket',
    address: '5450 New Hope Commons Dr, Durham, NC',
    city: 'Durham',
    lat: 35.9549,
    lng: -78.9991,
    openingHours: '6:00 AM - 11:00 PM',
    demoNote: 'Low-cost supercenter with large bulk essentials, pantry items, and cleaning supplies.',
    color: '#0071CE' // Walmart blue
  },
  {
    id: 'store_asian_market',
    name: "Li Ming's Global Mart (Asian Market)",
    category: 'specialty',
    address: '3400 Westgate Dr, Durham, NC',
    city: 'Durham',
    lat: 35.9662,
    lng: -78.9632,
    openingHours: '9:00 AM - 9:00 PM',
    demoNote: 'Specialty Asian grocery: fresh tofu, doubanjiang, Sichuan peppercorn, Asian greens, specialty sauces.',
    color: '#2A9D8F' // Jade green
  },
  {
    id: 'store_trader_joes',
    name: "Trader Joe's (Eastgate Crossing)",
    category: 'supermarket',
    address: '1800 E Franklin St, Chapel Hill, NC',
    city: 'Chapel Hill',
    lat: 35.9367,
    lng: -79.0244,
    openingHours: '8:00 AM - 9:00 PM',
    demoNote: 'Neighborhood favorite for affordable organic produce, private-label staples, and specialty items.',
    color: '#D9381E' // Trader Joe's red
  }
];

export const DEMO_ORIGIN_LOCATIONS = [
  {
    id: 'unc_campus',
    label: 'UNC Campus (Franklin St, Chapel Hill)',
    lat: 35.9132,
    lng: -79.0558,
    note: 'Downtown Chapel Hill walkable student area'
  },
  {
    id: 'carrboro_downtown',
    label: 'Carrboro Town Center (Weaver St)',
    lat: 35.9105,
    lng: -79.0755,
    note: 'Downtown Carrboro / Carr Mill Mall (CHT Route J, CW)'
  },
  {
    id: 'chapel_hill_north',
    label: 'Chapel Hill North / MLK Jr Blvd',
    lat: 35.9555,
    lng: -79.0570,
    note: 'North Chapel Hill / Homestead Rd (CHT Route NS, T)'
  },
  {
    id: 'southern_village',
    label: 'Southern Village (Market St)',
    lat: 35.8778,
    lng: -79.0620,
    note: 'South Chapel Hill (CHT Route NS, V)'
  },
  {
    id: 'meadowmont_apts',
    label: 'Meadowmont Village Residential',
    lat: 35.9095,
    lng: -79.0045,
    note: 'Close to Harris Teeter & bus routes'
  },
  {
    id: 'patterson_place',
    label: 'Patterson Place / Durham Blvd',
    lat: 35.9540,
    lng: -78.9620,
    note: 'Convenient to Target and Li Ming\'s Global Mart'
  }
];
