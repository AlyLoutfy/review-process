export interface PaymentPlan {
  id: string;
  name: string;
  downPayment: number; // Percentage (0-100)
  years: number;
  previewUrl: string;
  includesMaintenance: boolean;
  includesClubFees: boolean;
}

export interface UnitDesignMedia {
  offerGallery: string[];
  unitGallery: string[];
  floorPlans: string[];
}

export interface UnitDesign {
  id: string;
  name: string;
  beds: number;
  bua: number; // Built-Up Area in sqm
  media: UnitDesignMedia;
  previewUrl: string;
  amenities?: string[]; // Features like "Garden", "Storage", "Garage", etc.
}

export interface Unit {
  id: string;
  price: number;
  unitDesignId: string;
}

export interface Release {
  id: string;
  compoundName: string;
  releaseName: string;
  releaseDate: string;
  paymentPlans: PaymentPlan[];
  unitDesigns: UnitDesign[];
  units: Unit[];
}

// Using Picsum Photos with seed - each seed always returns the same image
// This ensures consistent images and guaranteed loading
const REAL_ESTATE_IMAGES = [
  'https://picsum.photos/seed/1/400/400',
  'https://picsum.photos/seed/2/400/400',
  'https://picsum.photos/seed/3/400/400',
  'https://picsum.photos/seed/4/400/400',
  'https://picsum.photos/seed/5/400/400',
  'https://picsum.photos/seed/6/400/400',
  'https://picsum.photos/seed/7/400/400',
  'https://picsum.photos/seed/8/400/400',
  'https://picsum.photos/seed/9/400/400',
  'https://picsum.photos/seed/10/400/400',
  'https://picsum.photos/seed/11/400/400',
  'https://picsum.photos/seed/12/400/400',
  'https://picsum.photos/seed/13/400/400',
  'https://picsum.photos/seed/14/400/400',
  'https://picsum.photos/seed/15/400/400',
  'https://picsum.photos/seed/16/400/400',
  'https://picsum.photos/seed/17/400/400',
  'https://picsum.photos/seed/18/400/400',
  'https://picsum.photos/seed/19/400/400',
  'https://picsum.photos/seed/20/400/400',
  'https://picsum.photos/seed/21/400/400',
  'https://picsum.photos/seed/22/400/400',
  'https://picsum.photos/seed/23/400/400',
  'https://picsum.photos/seed/24/400/400',
  'https://picsum.photos/seed/25/400/400',
  'https://picsum.photos/seed/26/400/400',
  'https://picsum.photos/seed/27/400/400',
  'https://picsum.photos/seed/28/400/400',
  'https://picsum.photos/seed/29/400/400',
  'https://picsum.photos/seed/30/400/400',
];

// Fallback image that will always work
const FALLBACK_IMAGE = 'https://picsum.photos/seed/999/400/400';

// Mock data for June compound
const generateMockImages = (count: number, prefix: string): string[] => {
  // Generate unique images by using prefix to offset the index, ensuring variety
  const prefixOffset = prefix ? prefix.split('-').reduce((acc, part) => acc + part.charCodeAt(0), 0) : 0;
  
  return Array.from({ length: count }, (_, i) => {
    const imageIndex = (i + prefixOffset) % REAL_ESTATE_IMAGES.length;
    return REAL_ESTATE_IMAGES[imageIndex];
  });
};

// Master list of all available payment plans (used across all releases)
export const allPaymentPlans: PaymentPlan[] = [
  {
    id: "pp-1",
    name: "464 Acre (Karmell 01) (C&S) (5% 5%) – (1ΟΥ) - 2025",
    downPayment: 5,
    years: 1,
    previewUrl: "/pdfs/payment-plan-karmell.pdf",
    includesMaintenance: true,
    includesClubFees: false,
  },
  {
    id: "pp-2",
    name: "464 Acre (VYE 09) (5% 5%) – (1ΟΥ) – 2025",
    downPayment: 5,
    years: 1,
    previewUrl: "/pdfs/payment-plan-vye.pdf",
    includesMaintenance: true,
    includesClubFees: false,
  },
  {
    id: "pp-3",
    name: "JUNE - P2 - (8Y) Grace - (5%-5%-5%) - 2025",
    downPayment: 5,
    years: 8,
    previewUrl: "/pdfs/payment-plan-june-p2.pdf",
    includesMaintenance: true,
    includesClubFees: true,
  },
  {
    id: "pp-4",
    name: "Allegria Resi - 6Y - (10% 10%) 2025",
    downPayment: 10,
    years: 6,
    previewUrl: "/pdfs/payment-plan-allegria.pdf",
    includesMaintenance: true,
    includesClubFees: true,
  },
  {
    id: "pp-5",
    name: "WMC - 5Y - (10% 10%) 2024 & 2025",
    downPayment: 10,
    years: 5,
    previewUrl: "/pdfs/payment-plan-wmc.pdf",
    includesMaintenance: true,
    includesClubFees: true,
  },
  {
    id: "pp-6",
    name: "JUNE - P7 (MF & Loft) - 6Y - (5%-10%) - 2025",
    downPayment: 5,
    years: 6,
    previewUrl: "/pdfs/payment-plan-june-p7.pdf",
    includesMaintenance: true,
    includesClubFees: false,
  },
  {
    id: "pp-7",
    name: "The Portal - 5Y - (10% 10%) - 2025",
    downPayment: 10,
    years: 5,
    previewUrl: "/pdfs/payment-plan-portal.pdf",
    includesMaintenance: true,
    includesClubFees: true,
  },
  {
    id: "pp-8",
    name: "The Polygon & OP - (6Y) – (10% & 10%) - 2025",
    downPayment: 10,
    years: 6,
    previewUrl: "/pdfs/payment-plan-polygon.pdf",
    includesMaintenance: true,
    includesClubFees: true,
  },
];

const generatePaymentPlans = (): PaymentPlan[] => {
  return allPaymentPlans;
};

// Available amenities/features for unit designs
const AVAILABLE_AMENITIES = ["Garden", "Storage", "Garage", "Balcony", "Terrace", "Maid Room", "Study Room", "Private Elevator"];

// Master list of all available unit designs (used across all releases)
export const allUnitDesigns: UnitDesign[] = (() => {
  const unitTypes = [
    { name: "Studio Apartment", beds: 0, bua: 45 },
    { name: "1 Bedroom", beds: 1, bua: 65 },
    { name: "1 Bedroom Deluxe", beds: 1, bua: 75 },
    { name: "2 Bedrooms", beds: 2, bua: 95 },
    { name: "2 Bedrooms Corner", beds: 2, bua: 110 },
    { name: "2 Bedrooms Penthouse", beds: 2, bua: 130 },
    { name: "3 Bedrooms", beds: 3, bua: 140 },
    { name: "3 Bedrooms Corner", beds: 3, bua: 165 },
    { name: "3 Bedrooms Penthouse", beds: 3, bua: 185 },
    { name: "4 Bedrooms", beds: 4, bua: 200 },
    { name: "4 Bedrooms Duplex", beds: 4, bua: 240 },
    { name: "4 Bedrooms Penthouse", beds: 4, bua: 280 },
    { name: "5 Bedrooms Villa", beds: 5, bua: 320 },
    { name: "5 Bedrooms Penthouse", beds: 5, bua: 350 },
    { name: "6 Bedrooms Villa", beds: 6, bua: 420 },
  ];

  return unitTypes.map((unit, index) => {
    // Generate amenities based on unit type and index for variety
    // Larger units and penthouses typically have more amenities
    const baseAmenityCount = Math.min(2 + Math.floor(unit.beds / 2), 5);
    const isPenthouse = unit.name.toLowerCase().includes('penthouse');
    const isVilla = unit.name.toLowerCase().includes('villa');
    const amenityCount = isPenthouse || isVilla 
      ? baseAmenityCount + 2 
      : unit.name.toLowerCase().includes('corner') || unit.name.toLowerCase().includes('deluxe')
      ? baseAmenityCount + 1
      : baseAmenityCount;
    
    // Select amenities based on index for consistency
    const selectedAmenities: string[] = [];
    const startIndex = (index * 3) % AVAILABLE_AMENITIES.length;
    for (let i = 0; i < amenityCount && i < AVAILABLE_AMENITIES.length; i++) {
      const amenityIndex = (startIndex + i) % AVAILABLE_AMENITIES.length;
      selectedAmenities.push(AVAILABLE_AMENITIES[amenityIndex]);
    }
    
    return {
      id: `unit-design-${index + 1}`,
      name: unit.name,
      beds: unit.beds,
      bua: unit.bua,
      media: {
        offerGallery: generateMockImages(8, `offer-${index}`),
        unitGallery: generateMockImages(10, `unit-${index}`),
        floorPlans: generateMockImages(6, `floor-${index}`),
      },
      previewUrl: `/pdfs/unit-design-${index + 1}.pdf`,
      amenities: selectedAmenities,
    };
  });
})();

const generateUnitDesigns = (): UnitDesign[] => {
  return allUnitDesigns;
};

export const generateUnits = (unitDesigns: UnitDesign[]): Unit[] => {
  const units: Unit[] = [];
  let globalUnitIndex = 1; // Start from PE-01 and increment
  
  // Generate multiple units for each unit design with varying prices
  unitDesigns.forEach((design, designIndex) => {
    // Generate 3-8 units per design type (using design index for consistency)
    const unitCount = 3 + (designIndex % 6);
    
    // Base price calculation based on BUA (roughly 8000-12000 per sqm)
    // Use design index to create consistent pricing
    const basePricePerSqm = 8000 + ((designIndex * 233) % 4000);
    const basePrice = design.bua * basePricePerSqm;
    
    for (let i = 0; i < unitCount; i++) {
      // Add some variation to price (±5%) using consistent calculation
      const priceVariation = 0.95 + ((designIndex + i) % 10) * 0.01;
      const unitPrice = Math.round(basePrice * priceVariation);
      
      // Generate realistic unit ID like "PE-07", "PE-08", etc.
      const unitId = `PE-${String(globalUnitIndex).padStart(2, '0')}`;
      
      units.push({
        id: unitId,
        price: unitPrice,
        unitDesignId: design.id,
      });
      
      globalUnitIndex++;
    }
  });
  
  return units;
};

export const mockReleases: Release[] = [
  {
    id: "june-latest",
    compoundName: "June",
    releaseName: "June Phase 3 - Latest Release",
    releaseDate: "2024-12-01",
    paymentPlans: generatePaymentPlans(),
    unitDesigns: generateUnitDesigns(),
    units: [],
  },
  {
    id: "june-phase-2",
    compoundName: "June",
    releaseName: "June Phase 2",
    releaseDate: "2024-08-15",
    paymentPlans: generatePaymentPlans(),
    unitDesigns: generateUnitDesigns().slice(0, 10),
    units: [],
  },
];

// Generate units for each release
mockReleases.forEach((release) => {
  release.units = generateUnits(release.unitDesigns);
});

// Helper function to ensure unit designs have amenities (for backward compatibility)
const ensureAmenities = (unitDesigns: UnitDesign[]): UnitDesign[] => {
  return unitDesigns.map((design) => {
    // If amenities already exist, keep them
    if (design.amenities && design.amenities.length > 0) {
      return design;
    }
    
    // Otherwise, generate amenities for this design
    const baseAmenityCount = Math.min(2 + Math.floor(design.beds / 2), 5);
    const name = design.name.toLowerCase();
    const isPenthouse = name.includes('penthouse');
    const isVilla = name.includes('villa');
    const amenityCount = isPenthouse || isVilla 
      ? baseAmenityCount + 2 
      : name.includes('corner') || name.includes('deluxe')
      ? baseAmenityCount + 1
      : baseAmenityCount;
    
    // Use design ID hash to generate consistent amenities
    const idHash = design.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startIndex = (idHash * 3) % AVAILABLE_AMENITIES.length;
    const selectedAmenities: string[] = [];
    
    for (let i = 0; i < amenityCount && i < AVAILABLE_AMENITIES.length; i++) {
      const amenityIndex = (startIndex + i) % AVAILABLE_AMENITIES.length;
      selectedAmenities.push(AVAILABLE_AMENITIES[amenityIndex]);
    }
    
    return {
      ...design,
      amenities: selectedAmenities,
    };
  });
};

// Function to get all releases (from localStorage or mock data)
export const getAllReleases = (): Release[] => {
  if (typeof window === "undefined") return mockReleases;
  
  try {
    const stored = localStorage.getItem("releases");
    if (stored) {
      const releases = JSON.parse(stored) as Release[];
      // Generate units for each release and ensure amenities exist
      releases.forEach((release) => {
        if (!release.units || release.units.length === 0) {
          release.units = generateUnits(release.unitDesigns);
        }
        // Ensure all unit designs have amenities (for backward compatibility)
        release.unitDesigns = ensureAmenities(release.unitDesigns);
      });
      return releases;
    }
  } catch {
    console.error("Error loading releases from localStorage");
  }
  
  return mockReleases;
};

// Function to save a release
export const saveRelease = (release: Release): void => {
  if (typeof window === "undefined") return;
  
  try {
    const releases = getAllReleases();
    const existingIndex = releases.findIndex((r) => r.id === release.id);
    
    if (existingIndex >= 0) {
      releases[existingIndex] = release;
    } else {
      releases.push(release);
    }
    
    // Generate units for the release
    release.units = generateUnits(release.unitDesigns);
    
    localStorage.setItem("releases", JSON.stringify(releases));
  } catch {
    console.error("Error saving release to localStorage");
  }
};

// Function to create a new release ID
export const generateReleaseId = (releaseName: string, compoundName: string): string => {
  const base = `${compoundName.toLowerCase()}-${releaseName.toLowerCase()}`;
  return base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + `-${Date.now()}`;
};

export const getReleaseById = (releaseId: string): Release | undefined => {
  const releases = getAllReleases();
  return releases.find((release) => release.id === releaseId);
};

