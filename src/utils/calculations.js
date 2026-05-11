/**
 * calculations.js — Solar system financial calculation utilities
 */

import { CFE_RATE_BY_TARIFF } from '../data/solarData';
import { INVERTER_COST_RATIO, LABOR_COST_RATIO, MOUNTING_COST_RATIO } from '../data/panelsDatabase';

/**
 * Number of solar panels needed to cover requiredKw.
 * @param {number} requiredKw - System size in kWp
 * @param {number} panelPowerW - Single panel power in Watts
 * @returns {number}
 */
export function calculatePanelsNeeded(requiredKw, panelPowerW) {
  if (!panelPowerW) return 0;
  return Math.ceil((requiredKw * 1000) / panelPowerW);
}

/**
 * Total system cost including inverter, labor, and mounting.
 * @param {number} numPanels
 * @param {number} pricePerPanel - MXN
 * @returns {{ panelsCost: number, inverterCost: number, laborCost: number, mountingCost: number, total: number }}
 */
export function calculateTotalCost(numPanels, pricePerPanel) {
  const panelsCost = numPanels * pricePerPanel;
  const inverterCost = Math.round(panelsCost * INVERTER_COST_RATIO);
  const laborCost = Math.round(panelsCost * LABOR_COST_RATIO);
  const mountingCost = Math.round(panelsCost * MOUNTING_COST_RATIO);
  const total = panelsCost + inverterCost + laborCost + mountingCost;
  return { panelsCost, inverterCost, laborCost, mountingCost, total };
}

/**
 * Monthly savings from solar generation.
 * @param {number} kwCovered - kWh/month covered by solar
 * @param {string} tariffType - CFE tariff type
 * @returns {number} MXN/month saved
 */
export function calculateMonthlySavings(kwCovered, tariffType) {
  const rate = CFE_RATE_BY_TARIFF[tariffType] ?? CFE_RATE_BY_TARIFF['1B'];
  return Math.round(kwCovered * rate);
}

/**
 * Months to break even without financing.
 * @param {number} totalCost - MXN
 * @param {number} monthlySavings - MXN/month
 * @returns {number} months
 */
export function calculateROI(totalCost, monthlySavings) {
  if (!monthlySavings) return Infinity;
  return Math.ceil(totalCost / monthlySavings);
}

/**
 * ROI with FIDE program: 25% incentive upfront, 75% financed over 60 months at 0%.
 * @param {number} totalCost - MXN
 * @param {number} monthlySavings - MXN/month
 * @returns {{ incentiveAmount: number, financedAmount: number, monthlyPayment: number, netMonthlySavings: number, roiMonths: number }}
 */
export function calculateFIDEROI(totalCost, monthlySavings) {
  const incentiveAmount = Math.round(totalCost * 0.25);
  const financedAmount = totalCost - incentiveAmount;
  const monthlyPayment = Math.round(financedAmount / 60); // 5 years, 0% interest
  const netMonthlySavings = Math.max(0, monthlySavings - monthlyPayment);
  const roiMonths = netMonthlySavings > 0 ? Math.ceil(financedAmount / monthlySavings) : Infinity;
  return { incentiveAmount, financedAmount, monthlyPayment, netMonthlySavings, roiMonths };
}

/**
 * Required system power (kWp) to cover a percentage of monthly consumption.
 * Formula: kWp = (kWh/month × coverage%) / (hoursPerDay × 30 × efficiency)
 * @param {number} avgKwh - Monthly consumption in kWh
 * @param {number} coveragePercentage - 0-100
 * @param {number} hoursPerDay - Peak sun hours per day
 * @param {number} systemEfficiency - Typically 0.8–0.85 for losses
 * @returns {number} kWp
 */
export function calculateRequiredKw(avgKwh, coveragePercentage, hoursPerDay, systemEfficiency = 0.82) {
  const targetKwh = (avgKwh * coveragePercentage) / 100;
  const kwp = targetKwh / (hoursPerDay * 30 * systemEfficiency);
  return Math.round(kwp * 100) / 100;
}

/**
 * Gradual installation table by month.
 * @param {number} totalPanels
 * @param {number} targetMonths
 * @param {number} monthlyBudget - MXN/month available
 * @param {number} pricePerPanel - MXN per panel
 * @param {number} monthlySavingsPerPanel - MXN saved per panel per month
 * @returns {Array<{ month: number, panelsInstalled: number, coveragePercent: number, cumulativeSavings: number }>}
 */
export function calculateGradualTable(
  totalPanels,
  targetMonths,
  monthlyBudget,
  pricePerPanel,
  monthlySavingsPerPanel
) {
  const rows = [];
  let installed = 0;
  let cumulativeSavings = 0;
  const panelsPerMonth = Math.max(1, Math.floor(monthlyBudget / pricePerPanel));

  for (let month = 1; month <= Math.max(targetMonths, 1); month++) {
    if (installed < totalPanels) {
      installed = Math.min(installed + panelsPerMonth, totalPanels);
    }
    const coveragePercent = Math.round((installed / totalPanels) * 100);
    const monthlySavings = Math.round(installed * monthlySavingsPerPanel);
    cumulativeSavings += monthlySavings;

    rows.push({
      month,
      panelsInstalled: installed,
      coveragePercent,
      monthlySavings,
      cumulativeSavings,
    });
  }
  return rows;
}

/**
 * Cumulative savings projection over N years for charts.
 * @param {number} monthlySavings - MXN/month
 * @param {number} years
 * @param {number} totalCost - for "without panels" baseline
 * @returns {Array<{ year: number, sinPaneles: number, conPaneles: number }>}
 */
export function buildSavingsProjection(monthlySavings, years, totalCost) {
  return Array.from({ length: years + 1 }, (_, i) => ({
    year: i,
    sinPaneles: 0,
    conPaneles: Math.round(i * 12 * monthlySavings - (i === 0 ? 0 : totalCost)),
    ahorroBruto: i * 12 * monthlySavings,
  }));
}

/**
 * Format a number as MXN currency string.
 */
export function formatMXN(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Determine if a system is solar-recommended based on form inputs.
 */
export function isSolarRecommended({ roofFreeArea, hasObstacles, tariffType }) {
  if (!roofFreeArea || Number(roofFreeArea) < 10) {
    return { recommended: false, reason: 'El espacio disponible en azotea es insuficiente (mínimo 10 m²).' };
  }
  if (hasObstacles && Number(roofFreeArea) < 20) {
    return { recommended: false, reason: 'Con obstáculos presentes se requiere al menos 20 m² libres.' };
  }
  return { recommended: true, reason: null };
}
