/**
 * installers.js — Mock directory of certified solar installers in Mexico
 * TODO: replace with API call to ANES (Asociación Nacional de Energía Solar) installer registry
 */

export const installers = [
  {
    id: 1,
    name: 'SolTech Instalaciones',
    city: 'Monterrey',
    state: 'Nuevo León',
    postalPrefix: '64',
    phone: '+52 81 1234 5678',
    email: 'contacto@soltech.mx',
    certifications: ['ANES Certificado', 'FIDE Autorizado'],
    rating: 4.8,
    yearsExperience: 9,
  },
  {
    id: 2,
    name: 'Energía Verde CDMX',
    city: 'Ciudad de México',
    state: 'Ciudad de México',
    postalPrefix: '06',
    phone: '+52 55 9876 5432',
    email: 'info@energiaverdecdmx.mx',
    certifications: ['ANES Certificado', 'PROFECO Registrado'],
    rating: 4.6,
    yearsExperience: 7,
  },
  {
    id: 3,
    name: 'Jalisco Solar Pro',
    city: 'Guadalajara',
    state: 'Jalisco',
    postalPrefix: '44',
    phone: '+52 33 3344 5566',
    email: 'ventas@jaliscosolar.mx',
    certifications: ['ANES Certificado'],
    rating: 4.5,
    yearsExperience: 5,
  },
  {
    id: 4,
    name: 'Solarix Puebla',
    city: 'Puebla',
    state: 'Puebla',
    postalPrefix: '72',
    phone: '+52 222 123 4567',
    email: 'hola@solarixpuebla.mx',
    certifications: ['FIDE Autorizado', 'ANES Certificado'],
    rating: 4.7,
    yearsExperience: 6,
  },
  {
    id: 5,
    name: 'Sol del Norte Sonora',
    city: 'Hermosillo',
    state: 'Sonora',
    postalPrefix: '83',
    phone: '+52 662 456 7890',
    email: 'contacto@soldelnorte.mx',
    certifications: ['ANES Certificado', 'FIDE Autorizado'],
    rating: 4.9,
    yearsExperience: 12,
  },
  {
    id: 6,
    name: 'Yucasol Mérida',
    city: 'Mérida',
    state: 'Yucatán',
    postalPrefix: '97',
    phone: '+52 999 321 6543',
    email: 'info@yucasol.mx',
    certifications: ['ANES Certificado'],
    rating: 4.4,
    yearsExperience: 4,
  },
  {
    id: 7,
    name: 'TecnoSolar Chihuahua',
    city: 'Chihuahua',
    state: 'Chihuahua',
    postalPrefix: '31',
    phone: '+52 614 654 3210',
    email: 'ventas@tecnosolar.mx',
    certifications: ['ANES Certificado', 'PROFECO Registrado'],
    rating: 4.6,
    yearsExperience: 8,
  },
  {
    id: 8,
    name: 'InstaSol Coahuila',
    city: 'Saltillo',
    state: 'Coahuila',
    postalPrefix: '25',
    phone: '+52 844 789 0123',
    email: 'contacto@instasol.mx',
    certifications: ['FIDE Autorizado'],
    rating: 4.3,
    yearsExperience: 3,
  },
  {
    id: 9,
    name: 'Quantum Solar Querétaro',
    city: 'Querétaro',
    state: 'Querétaro',
    postalPrefix: '76',
    phone: '+52 442 234 5678',
    email: 'info@quantumsolar.mx',
    certifications: ['ANES Certificado', 'FIDE Autorizado'],
    rating: 4.7,
    yearsExperience: 7,
  },
  {
    id: 10,
    name: 'Sinaloa Energía Solar',
    city: 'Culiacán',
    state: 'Sinaloa',
    postalPrefix: '80',
    phone: '+52 667 345 6789',
    email: 'ventas@sinaloasolar.mx',
    certifications: ['ANES Certificado'],
    rating: 4.5,
    yearsExperience: 6,
  },
];

/**
 * Filter installers by postal code (matches on first 2 digits).
 * Falls back to returning all installers if no match found.
 * @param {string} postalCode
 * @returns {Array}
 */
export function getInstallersByPostalCode(postalCode) {
  const prefix = String(postalCode).slice(0, 2);
  const filtered = installers.filter((i) => i.postalPrefix === prefix);
  return filtered.length > 0 ? filtered : installers;
}
