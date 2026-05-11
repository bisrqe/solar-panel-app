/**
 * panelsDatabase.js — Mock solar panel product catalog
 * TODO: replace with API call to distributor/ERP inventory endpoint
 */

export const panelsDatabase = [
  {
    id: 'jinko-n-type-400',
    brand: 'JinkoSolar',
    model: 'Eagle NEOstar 400N',
    powerW: 400,
    pricePerPanel: 4_800,
    warrantyYears: 25,
    efficiency: 20.4,
    tier: 'premium',
  },
  {
    id: 'longi-hi-mo6-420',
    brand: 'LONGi Solar',
    model: 'Hi-MO 6 420W',
    powerW: 420,
    pricePerPanel: 5_200,
    warrantyYears: 25,
    efficiency: 21.3,
    tier: 'premium',
  },
  {
    id: 'canadian-hiku6-370',
    brand: 'Canadian Solar',
    model: 'HiKu6 370W',
    powerW: 370,
    pricePerPanel: 4_100,
    warrantyYears: 25,
    efficiency: 19.9,
    tier: 'estándar',
  },
  {
    id: 'risen-titan-380',
    brand: 'Risen Energy',
    model: 'Titan RSM110-8 380W',
    powerW: 380,
    pricePerPanel: 3_950,
    warrantyYears: 20,
    efficiency: 19.4,
    tier: 'estándar',
  },
  {
    id: 'axitec-ac380',
    brand: 'AXITEC',
    model: 'AXIblackpremium HC 380W',
    powerW: 380,
    pricePerPanel: 4_300,
    warrantyYears: 25,
    efficiency: 19.8,
    tier: 'estándar',
  },
  {
    id: 'astronergy-chsm54',
    brand: 'Astronergy',
    model: 'CHSM54M-HC 380W',
    powerW: 380,
    pricePerPanel: 3_700,
    warrantyYears: 20,
    efficiency: 19.1,
    tier: 'económico',
  },
  {
    id: 'trina-vertex-s-395',
    brand: 'Trina Solar',
    model: 'Vertex S TSM-DE09R 395W',
    powerW: 395,
    pricePerPanel: 4_600,
    warrantyYears: 25,
    efficiency: 20.8,
    tier: 'premium',
  },
];

// Inverter cost estimate: ~25% of panel total cost (simplified)
export const INVERTER_COST_RATIO = 0.25;
// Installation labor: ~15% of panel total cost
export const LABOR_COST_RATIO = 0.15;
// Structural mounting: ~10% of panel total cost
export const MOUNTING_COST_RATIO = 0.10;
