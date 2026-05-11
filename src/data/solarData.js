/**
 * solarData.js — Mock solar radiation & tariff data for Mexico
 * TODO: replace with API call to CONAGUA / NASA POWER solar irradiance endpoint
 */

// Lookup table: first 2 digits of postal code → region + solar radiation data
const RADIATION_BY_PREFIX = {
  '01': { hoursPerDay: 5.8, region: 'Ciudad de México (Sur)' },
  '06': { hoursPerDay: 5.6, region: 'Ciudad de México (Centro)' },
  '64': { hoursPerDay: 5.9, region: 'Nuevo León' },
  '44': { hoursPerDay: 5.5, region: 'Jalisco' },
  '72': { hoursPerDay: 6.2, region: 'Puebla' },
  '20': { hoursPerDay: 6.8, region: 'Aguascalientes' },
  '80': { hoursPerDay: 6.5, region: 'Sinaloa' },
  '97': { hoursPerDay: 6.0, region: 'Yucatán' },
  '77': { hoursPerDay: 5.7, region: 'Quintana Roo' },
  '83': { hoursPerDay: 7.1, region: 'Sonora' },
  '31': { hoursPerDay: 6.3, region: 'Chihuahua' },
  '25': { hoursPerDay: 6.6, region: 'Coahuila' },
  '76': { hoursPerDay: 5.8, region: 'Querétaro' },
  '58': { hoursPerDay: 5.7, region: 'Michoacán' },
  '68': { hoursPerDay: 5.6, region: 'Oaxaca' },
};

const DEFAULT_RADIATION = { hoursPerDay: 5.8, region: 'México (promedio nacional)' };

/**
 * Returns solar radiation data for a given Mexican postal code.
 * @param {string} postalCode - 5-digit Mexican postal code
 * @returns {{ hoursPerDay: number, region: string }}
 */
export function getSolarRadiation(postalCode) {
  // TODO: replace with API call to NASA POWER or CONAGUA for precise GPS-based radiation
  const prefix = String(postalCode).slice(0, 2);
  return RADIATION_BY_PREFIX[prefix] ?? DEFAULT_RADIATION;
}

// Average monthly consumption and DAC risk by CFE tariff type
const TARIFF_CONSUMPTION = {
  '1A': { avgKwh: 120,  level: 'bajo',  dacRisk: false },
  '1B': { avgKwh: 200,  level: 'medio', dacRisk: false },
  '1C': { avgKwh: 280,  level: 'medio', dacRisk: false },
  '1D': { avgKwh: 340,  level: 'medio', dacRisk: true  },
  '1E': { avgKwh: 420,  level: 'alto',  dacRisk: true  },
  '1F': { avgKwh: 500,  level: 'alto',  dacRisk: true  },
  'DAC': { avgKwh: 700, level: 'alto',  dacRisk: true  },
};

/**
 * Returns average monthly consumption for a given CFE tariff type.
 * @param {string} tariffType - e.g. "1A", "1B", ..., "DAC"
 * @returns {{ avgKwh: number, level: "alto"|"medio"|"bajo", dacRisk: boolean }}
 */
export function getAverageConsumption(tariffType) {
  // TODO: replace with CFE API for user-specific bimestral bill data
  return TARIFF_CONSUMPTION[tariffType] ?? TARIFF_CONSUMPTION['1B'];
}

// Average CFE price per kWh by tariff (MXN) — approximate 2024 rates
export const CFE_RATE_BY_TARIFF = {
  '1A': 0.793,
  '1B': 0.951,
  '1C': 1.071,
  '1D': 1.168,
  '1E': 1.238,
  '1F': 1.298,
  'DAC': 5.21,  // DAC is much more expensive
};

export const TARIFF_OPTIONS = ['1A', '1B', '1C', '1D', '1E', '1F', 'DAC'];
export const ROOF_MATERIAL_OPTIONS = ['Concreto', 'Lámina metálica', 'Teja', 'Madera', 'Otro'];
export const CONNECTION_TYPE_OPTIONS = ['Monofásica', 'Bifásica', 'Trifásica'];
export const GAS_TYPE_OPTIONS = ['LP', 'Natural'];
export const MORTGAGE_STATUS_OPTIONS = ['Sin hipoteca', 'Con hipoteca vigente', 'Hipoteca pagada'];
