// Mock PEP Pax location data for South Africa
// In a real implementation, this would come from PEP's API

export interface PepLocation {
  id: string
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  coordinates: {
    lat: number
    lng: number
  }
  operatingHours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  phone: string
  services: string[]
}

export const PEP_LOCATIONS: PepLocation[] = [
  // Gauteng - Major Cities
  {
    id: "pep_sandton_001",
    name: "PEP Sandton City",
    address: "83 Rivonia Rd, Sandhurst",
    city: "Sandton",
    province: "Gauteng",
    postalCode: "2196",
    coordinates: { lat: -26.1076, lng: 28.0567 },
    operatingHours: {
      weekdays: "08:00 - 18:00",
      saturday: "08:00 - 17:00",
      sunday: "09:00 - 15:00"
    },
    phone: "011 784 7000",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_rosebank_002",
    name: "PEP Rosebank Mall",
    address: "50 Bath Ave, Rosebank",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2196",
    coordinates: { lat: -26.1463, lng: 28.0436 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "09:00 - 17:00",
      sunday: "10:00 - 16:00"
    },
    phone: "011 447 5000",
    services: ["PEP Send Collection", "Returns"]
  },
  {
    id: "pep_eastgate_003",
    name: "PEP Eastgate Shopping Centre",
    address: "43 Bradford Rd, Bedfordview",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2008",
    coordinates: { lat: -26.1667, lng: 28.1667 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 17:00"
    },
    phone: "011 615 4300",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_menlyn_004",
    name: "PEP Menlyn Park Shopping Centre",
    address: "Atterbury Rd & Lois Ave, Menlyn",
    city: "Pretoria",
    province: "Gauteng",
    postalCode: "0181",
    coordinates: { lat: -25.7879, lng: 28.2774 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 17:00"
    },
    phone: "012 348 2900",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_centurion_013",
    name: "PEP Centurion Mall",
    address: "Heuwel Rd, Centurion Central",
    city: "Centurion",
    province: "Gauteng",
    postalCode: "0157",
    coordinates: { lat: -25.8601, lng: 28.1880 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "012 663 0900",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_soweto_014",
    name: "PEP Maponya Mall",
    address: "Pimville Zone 1, Soweto",
    city: "Soweto",
    province: "Gauteng",
    postalCode: "1809",
    coordinates: { lat: -26.2692, lng: 27.8546 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:00 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "011 938 0300",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_randburg_015",
    name: "PEP Cresta Shopping Centre",
    address: "Cnr Beyers Naude Dr & Weltevreden Rd",
    city: "Randburg",
    province: "Gauteng",
    postalCode: "2194",
    coordinates: { lat: -26.1034, lng: 27.9784 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "011 476 1200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_germiston_016",
    name: "PEP Eastrand Mall",
    address: "Cnr North Rand Rd & Rietfontein Rd",
    city: "Germiston",
    province: "Gauteng",
    postalCode: "1401",
    coordinates: { lat: -26.2309, lng: 28.1772 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "011 823 1500",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // Western Cape - Major Cities
  {
    id: "pep_canal_walk_005",
    name: "PEP Canal Walk Shopping Centre",
    address: "Century Blvd, Century City",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "7441",
    coordinates: { lat: -33.8916, lng: 18.5108 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "09:00 - 17:00",
      sunday: "10:00 - 16:00"
    },
    phone: "021 555 2900",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_v_a_waterfront_006",
    name: "PEP V&A Waterfront",
    address: "V&A Waterfront, Dock Rd",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
    coordinates: { lat: -33.9025, lng: 18.4187 },
    operatingHours: {
      weekdays: "09:00 - 19:00",
      saturday: "09:00 - 19:00",
      sunday: "10:00 - 18:00"
    },
    phone: "021 408 7600",
    services: ["PEP Send Collection", "Returns"]
  },
  {
    id: "pep_tyger_valley_007",
    name: "PEP Tyger Valley Shopping Centre",
    address: "Willie van Schoor Ave, Bellville",
    city: "Bellville",
    province: "Western Cape",
    postalCode: "7530",
    coordinates: { lat: -33.9147, lng: 18.6341 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 17:00"
    },
    phone: "021 914 4200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_claremont_017",
    name: "PEP Cavendish Square",
    address: "Dreyer St, Claremont",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "7708",
    coordinates: { lat: -33.9847, lng: 18.4655 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "09:00 - 17:00",
      sunday: "10:00 - 16:00"
    },
    phone: "021 674 4900",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_stellenbosch_018",
    name: "PEP Eikestad Mall",
    address: "Andringa St, Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    postalCode: "7600",
    coordinates: { lat: -33.9249, lng: 18.8607 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "021 887 9200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_paarl_019",
    name: "PEP Grande Centre Paarl",
    address: "Cecilia St, Paarl",
    city: "Paarl",
    province: "Western Cape",
    postalCode: "7646",
    coordinates: { lat: -33.7369, lng: 18.9584 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "021 872 3400",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_george_020",
    name: "PEP Garden Route Mall",
    address: "Knysna Rd, George",
    city: "George",
    province: "Western Cape",
    postalCode: "6529",
    coordinates: { lat: -33.9608, lng: 22.4614 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "044 874 0200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // KwaZulu-Natal - Major Cities
  {
    id: "pep_gateway_008",
    name: "PEP Gateway Theatre of Shopping",
    address: "1 Palm Blvd, Umhlanga Ridge",
    city: "Durban",
    province: "KwaZulu-Natal",
    postalCode: "4319",
    coordinates: { lat: -29.7267, lng: 31.0834 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "09:00 - 17:00",
      sunday: "10:00 - 16:00"
    },
    phone: "031 566 4200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_pavilion_009",
    name: "PEP Pavilion Shopping Centre",
    address: "Jack Martens Dr, Westville",
    city: "Durban",
    province: "KwaZulu-Natal",
    postalCode: "3629",
    coordinates: { lat: -29.8587, lng: 30.9339 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 17:00"
    },
    phone: "031 265 0300",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_pietermaritzburg_021",
    name: "PEP Liberty Midlands Mall",
    address: "50 Sanctuary Rd, Pietermaritzburg",
    city: "Pietermaritzburg",
    province: "KwaZulu-Natal",
    postalCode: "3201",
    coordinates: { lat: -29.6144, lng: 30.3915 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "033 347 2800",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_richards_bay_022",
    name: "PEP Boardwalk Inkwazi Shopping Centre",
    address: "Cnr John Ross Pkwy & Kruger Rand Rd",
    city: "Richards Bay",
    province: "KwaZulu-Natal",
    postalCode: "3900",
    coordinates: { lat: -28.7830, lng: 32.0378 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "035 789 1200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_newcastle_023",
    name: "PEP Newcastle Mall",
    address: "Cnr Scott & Murchison St",
    city: "Newcastle",
    province: "KwaZulu-Natal",
    postalCode: "2940",
    coordinates: { lat: -27.7567, lng: 29.9167 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "034 312 4500",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // Eastern Cape - Major Cities
  {
    id: "pep_walmer_park_010",
    name: "PEP Walmer Park Shopping Centre",
    address: "Cnr 15th Ave & Heugh Rd, Walmer",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postalCode: "6070",
    coordinates: { lat: -33.9608, lng: 25.5731 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "041 581 2400",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_east_london_024",
    name: "PEP Hemingways Mall",
    address: "Cnr Western Ave & Devereaux Ave",
    city: "East London",
    province: "Eastern Cape",
    postalCode: "5217",
    coordinates: { lat: -32.9892, lng: 27.8546 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "043 726 8900",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_grahamstown_025",
    name: "PEP Pepper Grove Mall",
    address: "African St, Grahamstown",
    city: "Makhanda",
    province: "Eastern Cape",
    postalCode: "6139",
    coordinates: { lat: -33.3047, lng: 26.5317 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "046 622 7300",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // Free State - Major Cities
  {
    id: "pep_mimosa_mall_011",
    name: "PEP Mimosa Mall",
    address: "Dan Pienaar Ave, Bloemfontein",
    city: "Bloemfontein",
    province: "Free State",
    postalCode: "9301",
    coordinates: { lat: -29.0852, lng: 26.1596 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "051 444 6800",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_welkom_026",
    name: "PEP Goldfields Mall",
    address: "Cnr Stateway & Buiten St",
    city: "Welkom",
    province: "Free State",
    postalCode: "9459",
    coordinates: { lat: -27.9770, lng: 26.7336 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "057 352 8400",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_kroonstad_027",
    name: "PEP Kroonstad Plaza",
    address: "Cnr Cross & Miller St",
    city: "Kroonstad",
    province: "Free State",
    postalCode: "9499",
    coordinates: { lat: -27.6506, lng: 27.2340 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "056 212 3600",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // Mpumalanga - Major Cities
  {
    id: "pep_riverside_mall_012",
    name: "PEP Riverside Mall",
    address: "Cnr R40 & Old Pretoria Rd, Nelspruit",
    city: "Mbombela",
    province: "Mpumalanga",
    postalCode: "1200",
    coordinates: { lat: -25.4753, lng: 30.9698 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "013 755 3400",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_witbank_028",
    name: "PEP Highveld Mall",
    address: "Cnr Mandela Dr & Beatty Ave",
    city: "Emalahleni",
    province: "Mpumalanga",
    postalCode: "1035",
    coordinates: { lat: -25.8738, lng: 29.2321 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "013 656 2800",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_secunda_029",
    name: "PEP Secunda Mall",
    address: "Cnr Goosen & Kruger St",
    city: "Secunda",
    province: "Mpumalanga",
    postalCode: "2302",
    coordinates: { lat: -26.5504, lng: 29.1781 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "017 634 1900",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // Limpopo - Major Cities
  {
    id: "pep_polokwane_030",
    name: "PEP Mall of the North",
    address: "Cnr N1 & R81, Bendor",
    city: "Polokwane",
    province: "Limpopo",
    postalCode: "0699",
    coordinates: { lat: -23.8962, lng: 29.4486 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "015 297 5200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_tzaneen_031",
    name: "PEP Tzaneen Lifestyle Centre",
    address: "Cnr Danie Joubert & Peace St",
    city: "Tzaneen",
    province: "Limpopo",
    postalCode: "0850",
    coordinates: { lat: -23.8328, lng: 30.1634 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "015 307 4100",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_thohoyandou_032",
    name: "PEP Thavhani Mall",
    address: "Cnr R524 & Eltivillas Rd",
    city: "Thohoyandou",
    province: "Limpopo",
    postalCode: "0950",
    coordinates: { lat: -22.9467, lng: 30.4849 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "015 962 3700",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // North West - Major Cities
  {
    id: "pep_rustenburg_033",
    name: "PEP Waterfall Mall",
    address: "Cnr Heystek & Nelson Mandela Dr",
    city: "Rustenburg",
    province: "North West",
    postalCode: "0299",
    coordinates: { lat: -25.6674, lng: 27.2416 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "014 592 8300",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_klerksdorp_034",
    name: "PEP City Mall",
    address: "Cnr Margaretha Prinsloo & Joe Slovo St",
    city: "Klerksdorp",
    province: "North West",
    postalCode: "2571",
    coordinates: { lat: -26.8515, lng: 26.6649 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "018 462 7200",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_potchefstroom_035",
    name: "PEP Mooirivier Mall",
    address: "Cnr Molen & Steve Biko St",
    city: "Potchefstroom",
    province: "North West",
    postalCode: "2531",
    coordinates: { lat: -26.7136, lng: 27.0982 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "018 294 6500",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },

  // Northern Cape - Major Cities
  {
    id: "pep_kimberley_036",
    name: "PEP Diamond Pavilion Shopping Centre",
    address: "Cnr Memorial Rd & Schmidtsdrift Rd",
    city: "Kimberley",
    province: "Northern Cape",
    postalCode: "8301",
    coordinates: { lat: -28.7282, lng: 24.7499 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "053 832 1400",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  },
  {
    id: "pep_upington_037",
    name: "PEP Kalahari Mall",
    address: "Cnr Mark & Schroder St",
    city: "Upington",
    province: "Northern Cape",
    postalCode: "8800",
    coordinates: { lat: -28.4478, lng: 21.2561 },
    operatingHours: {
      weekdays: "09:00 - 18:00",
      saturday: "08:30 - 17:00",
      sunday: "09:00 - 16:00"
    },
    phone: "054 332 6700",
    services: ["PEP Send Collection", "Returns", "Exchanges"]
  }
]

// Utility functions for PEP location management

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Find nearest PEP locations with distance sorting
export function findNearestPepLocations(
  userLat: number, 
  userLng: number, 
  limit: number = 5
): (PepLocation & { distance: number })[] {
  return PEP_LOCATIONS
    .map(location => ({
      ...location,
      distance: calculateDistance(userLat, userLng, location.coordinates.lat, location.coordinates.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

// Enhanced search function with multiple criteria
export function searchPepLocationsByArea(query: string): PepLocation[] {
  if (!query.trim()) return PEP_LOCATIONS
  
  const searchTerm = query.toLowerCase().trim()
  
  return PEP_LOCATIONS.filter(location => 
    location.city.toLowerCase().includes(searchTerm) ||
    location.province.toLowerCase().includes(searchTerm) ||
    location.name.toLowerCase().includes(searchTerm) ||
    location.address.toLowerCase().includes(searchTerm) ||
    location.postalCode.includes(searchTerm)
  )
}

// Get locations grouped by province
export function getLocationsByProvince(): Record<string, PepLocation[]> {
  return PEP_LOCATIONS.reduce((acc, location) => {
    if (!acc[location.province]) {
      acc[location.province] = []
    }
    acc[location.province].push(location)
    return acc
  }, {} as Record<string, PepLocation[]>)
}

// Get locations by specific province
export function getLocationsByProvinceFilter(province: string): PepLocation[] {
  return PEP_LOCATIONS.filter(location => 
    location.province.toLowerCase() === province.toLowerCase()
  )
}

// Get all unique provinces
export function getAllProvinces(): string[] {
  return [...new Set(PEP_LOCATIONS.map(location => location.province))].sort()
}

// Advanced search with filters
export function advancedSearchPepLocations(
  query: string = '',
  province?: string,
  userLat?: number,
  userLng?: number,
  maxDistance?: number
): (PepLocation & { distance?: number })[] {
  let results = PEP_LOCATIONS

  // Filter by province if specified
  if (province && province !== 'all') {
    results = results.filter(location => 
      location.province.toLowerCase() === province.toLowerCase()
    )
  }

  // Filter by search query if provided
  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim()
    results = results.filter(location => 
      location.city.toLowerCase().includes(searchTerm) ||
      location.name.toLowerCase().includes(searchTerm) ||
      location.address.toLowerCase().includes(searchTerm) ||
      location.postalCode.includes(searchTerm)
    )
  }

  // Add distance and filter by max distance if user location is provided
  let locationsWithDistance = results.map(location => {
    if (userLat !== undefined && userLng !== undefined) {
      const distance = calculateDistance(userLat, userLng, location.coordinates.lat, location.coordinates.lng)
      return { ...location, distance }
    }
    return location
  })

  // Filter by maximum distance if specified
  if (maxDistance && userLat !== undefined && userLng !== undefined) {
    locationsWithDistance = locationsWithDistance.filter(location => 
      'distance' in location && location.distance !== undefined && location.distance <= maxDistance
    )
  }

  // Sort by distance if user location is available, otherwise by name
  if (userLat !== undefined && userLng !== undefined) {
    locationsWithDistance.sort((a, b) => {
      const aDistance = 'distance' in a ? (a.distance || 0) : 0
      const bDistance = 'distance' in b ? (b.distance || 0) : 0
      return aDistance - bDistance
    })
  } else {
    locationsWithDistance.sort((a, b) => a.name.localeCompare(b.name))
  }

  return locationsWithDistance
}

// Get location by ID
export function getPepLocationById(id: string): PepLocation | undefined {
  return PEP_LOCATIONS.find(location => location.id === id)
}