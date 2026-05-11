/**
 * Section4.jsx — "Planes y ahorro"
 * Recommended solar plans with financial projections and charts.
 */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useSolar } from '../context/SolarContext';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import NavButtons from '../components/NavButtons';
import { getSolarRadiation, getAverageConsumption } from '../data/solarData';
import { panelsDatabase } from '../data/panelsDatabase';
import {
  calculatePanelsNeeded,
  calculateTotalCost,
  calculateMonthlySavings,
  calculateROI,
  calculateFIDEROI,
  calculateRequiredKw,
  calculateGradualTable,
  buildSavingsProjection,
  formatMXN,
} from '../utils/calculations';
import FormField, { inputClass } from '../components/FormField';

const TABS = ['Recomendado', 'Completo', 'Gradual', 'Con Financiamiento FIDE'];

function PanelModelCard({ panel }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[#F9F5EE] border border-[#e8e0d2] rounded-xl">
      <div className="flex-shrink-0 w-10 h-10 bg-[#1A2B4A] rounded-lg flex items-center justify-center">
        <span className="text-[#F5A623] text-lg">◼</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">{panel.brand}</p>
        <p className="text-sm font-semibold text-[#1A2B4A] truncate">{panel.model}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
            {panel.powerW} W
          </span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {panel.efficiency}% eficiencia
          </span>
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
            {panel.warrantyYears} años garantía
          </span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-[#6b7280]">precio/panel</p>
        <p className="text-sm font-bold text-[#1A2B4A]">{formatMXN(panel.pricePerPanel)}</p>
      </div>
    </div>
  );
}

function FinancialRow({ label, value, highlight }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-[#f0e9da] last:border-0 ${highlight ? 'font-semibold' : ''}`}>
      <span className={`text-sm ${highlight ? 'text-[#1A2B4A]' : 'text-[#6b7280]'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'text-[#F5A623] text-base font-bold' : 'text-[#1A2B4A] font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e8e0d2] rounded-xl p-3 shadow-md text-sm">
        <p className="font-semibold text-[#1A2B4A] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{formatMXN(p.value)}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Section4() {
  const { consumptionData, goalData, setCurrentStep } = useSolar();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [simMonths, setSimMonths] = useState('');
  const [simBudget, setSimBudget] = useState('');

  const { tariffType, postalCode } = consumptionData;
  const { coveragePercentage, installationType, targetMonths, monthlyBudget, availableBudget } = goalData;

  // Derived values
  const radiation = useMemo(() => getSolarRadiation(postalCode), [postalCode]);
  const consumption = useMemo(() => getAverageConsumption(tariffType), [tariffType]);
  const requiredKw = useMemo(
    () => calculateRequiredKw(consumption.avgKwh, coveragePercentage, radiation.hoursPerDay),
    [consumption.avgKwh, coveragePercentage, radiation.hoursPerDay]
  );
  const kwCovered = useMemo(() => Math.round((consumption.avgKwh * coveragePercentage) / 100), [consumption.avgKwh, coveragePercentage]);

  // Choose recommended panel: best efficiency within budget, else highest efficiency
  const recommendedPanel = useMemo(() => {
    const budget = Number(availableBudget) || Infinity;
    const sorted = [...panelsDatabase].sort((a, b) => b.efficiency - a.efficiency);
    const affordable = sorted.filter((p) => {
      const panels = calculatePanelsNeeded(requiredKw, p.powerW);
      const cost = calculateTotalCost(panels, p.pricePerPanel).total;
      return cost <= budget;
    });
    return affordable[0] ?? sorted[0];
  }, [requiredKw, availableBudget]);

  // Financials for recommended panel
  const numPanels = useMemo(
    () => calculatePanelsNeeded(requiredKw, recommendedPanel.powerW),
    [requiredKw, recommendedPanel.powerW]
  );
  const costBreakdown = useMemo(
    () => calculateTotalCost(numPanels, recommendedPanel.pricePerPanel),
    [numPanels, recommendedPanel.pricePerPanel]
  );
  const monthlySavings = useMemo(() => calculateMonthlySavings(kwCovered, tariffType), [kwCovered, tariffType]);
  const roiMonths = useMemo(() => calculateROI(costBreakdown.total, monthlySavings), [costBreakdown.total, monthlySavings]);
  const fide = useMemo(() => calculateFIDEROI(costBreakdown.total, monthlySavings), [costBreakdown.total, monthlySavings]);

  // Gradual table
  const gradualTable = useMemo(() => {
    if (installationType !== 'Instalación gradual') return [];
    const savingsPerPanel = numPanels > 0 ? monthlySavings / numPanels : 0;
    return calculateGradualTable(
      numPanels,
      Number(targetMonths) || 12,
      Number(monthlyBudget) || 0,
      recommendedPanel.pricePerPanel,
      savingsPerPanel
    );
  }, [installationType, numPanels, monthlySavings, targetMonths, monthlyBudget, recommendedPanel.pricePerPanel]);

  // 5-year savings projection
  const savingsProjection = useMemo(
    () => buildSavingsProjection(monthlySavings, 5, costBreakdown.total),
    [monthlySavings, costBreakdown.total]
  );

  // Monthly bill comparison chart
  const billComparisonData = useMemo(() => {
    const fullBill = Math.round(consumption.avgKwh * (1.2)); // simplified
    return [
      { name: 'Sin paneles', monto: fullBill },
      { name: 'Con paneles', monto: Math.max(0, fullBill - monthlySavings) },
      { name: 'Con FIDE', monto: Math.max(0, fullBill - monthlySavings + fide.monthlyPayment) },
    ];
  }, [consumption.avgKwh, monthlySavings, fide.monthlyPayment]);

  // Simulator
  const simResult = useMemo(() => {
    const budget = Number(simBudget);
    const months = Number(simMonths);
    if (budget > 0 && numPanels > 0 && recommendedPanel.pricePerPanel > 0) {
      const panelsPerMonth = Math.max(1, Math.floor(budget / recommendedPanel.pricePerPanel));
      const monthsNeeded = Math.ceil(numPanels / panelsPerMonth);
      return { monthsNeeded };
    }
    if (months > 0 && numPanels > 0 && recommendedPanel.pricePerPanel > 0) {
      const panelsPerMonth = Math.ceil(numPanels / months);
      const budgetNeeded = panelsPerMonth * recommendedPanel.pricePerPanel;
      return { budgetNeeded };
    }
    return null;
  }, [simBudget, simMonths, numPanels, recommendedPanel.pricePerPanel]);

  const handleNext = useCallback(() => {
    setCurrentStep(5);
    navigate('/instala');
  }, [setCurrentStep, navigate]);

  const tabContent = [
    // Recomendado
    <div key="rec" className="flex flex-col gap-4">
      <PanelModelCard panel={recommendedPanel} />
      <div>
        <FinancialRow label="Paneles requeridos" value={`${numPanels} paneles`} />
        <FinancialRow label="Costo de paneles" value={formatMXN(costBreakdown.panelsCost)} />
        <FinancialRow label="Inversor estimado" value={formatMXN(costBreakdown.inverterCost)} />
        <FinancialRow label="Mano de obra" value={formatMXN(costBreakdown.laborCost)} />
        <FinancialRow label="Estructura y montaje" value={formatMXN(costBreakdown.mountingCost)} />
        <FinancialRow label="Inversión total del sistema" value={formatMXN(costBreakdown.total)} highlight />
        <FinancialRow label="Ahorro mensual estimado" value={formatMXN(monthlySavings)} highlight />
        <FinancialRow label="Ahorro anual estimado" value={formatMXN(monthlySavings * 12)} />
        <FinancialRow label="ROI sin financiamiento" value={roiMonths === Infinity ? 'N/A' : `${roiMonths} meses`} />
      </div>
    </div>,

    // Completo — full system with all panel models
    <div key="completo" className="flex flex-col gap-3">
      <p className="text-xs text-[#6b7280]">Comparativa de todos los modelos disponibles para cubrir {coveragePercentage}% de tu consumo:</p>
      {panelsDatabase.map((panel) => {
        const n = calculatePanelsNeeded(requiredKw, panel.powerW);
        const cost = calculateTotalCost(n, panel.pricePerPanel);
        const sav = calculateMonthlySavings(kwCovered, tariffType);
        const roi = calculateROI(cost.total, sav);
        return (
          <div key={panel.id} className="border border-[#e8e0d2] rounded-xl p-3 bg-white hover:border-[#F5A623]/50 transition-colors">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-[#6b7280]">{panel.brand}</p>
                <p className="text-sm font-semibold text-[#1A2B4A]">{panel.model}</p>
                <p className="text-xs text-[#a89e8e] mt-0.5">{n} paneles × {formatMXN(panel.pricePerPanel)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1A2B4A]">{formatMXN(cost.total)}</p>
                <p className="text-xs text-emerald-600 font-medium">ROI: {roi} meses</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  panel.tier === 'premium' ? 'bg-amber-100 text-amber-700' :
                  panel.tier === 'estándar' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {panel.tier}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>,

    // Gradual
    <div key="gradual" className="flex flex-col gap-4">
      {installationType !== 'Instalación gradual' ? (
        <Card variant="info">
          <p className="text-sm text-blue-800">
            Seleccionaste <strong>Instalación completa</strong> en el Paso 2. Regresa para cambiar a Instalación gradual si quieres ver este plan.
          </p>
        </Card>
      ) : gradualTable.length === 0 ? (
        <p className="text-sm text-[#6b7280]">Define presupuesto mensual en el Paso 2 para ver la tabla gradual.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e8e0d2]">
          <table className="w-full text-sm">
            <thead className="bg-[#1A2B4A] text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-3 text-left">Mes</th>
                <th className="px-3 py-3 text-right">Paneles</th>
                <th className="px-3 py-3 text-right">% Cubierto</th>
                <th className="px-3 py-3 text-right">Ahorro mensual</th>
                <th className="px-3 py-3 text-right">Ahorro acumulado</th>
              </tr>
            </thead>
            <tbody>
              {gradualTable.map((row, i) => (
                <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9F5EE]'}>
                  <td className="px-3 py-2.5 font-medium text-[#1A2B4A]">{row.month}</td>
                  <td className="px-3 py-2.5 text-right text-[#1A2B4A]">{row.panelsInstalled}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-[#E8890C] font-semibold">{row.coveragePercent}%</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-emerald-700">{formatMXN(row.monthlySavings)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-[#1A2B4A]">{formatMXN(row.cumulativeSavings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>,

    // FIDE financing
    <div key="fide" className="flex flex-col gap-4">
      <Card variant="success">
        <h4 className="font-semibold text-emerald-800 mb-2">Programa FIDE — Paneles Solares para tu Casa</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-emerald-700 font-medium">Incentivo (25%)</p>
            <p className="text-lg font-bold text-emerald-800">{formatMXN(fide.incentiveAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-700 font-medium">Monto a financiar (75%)</p>
            <p className="text-lg font-bold text-emerald-800">{formatMXN(fide.financedAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-700 font-medium">Pago mensual (60 meses, 0%)</p>
            <p className="text-lg font-bold text-emerald-800">{formatMXN(fide.monthlyPayment)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-700 font-medium">Ahorro neto mensual</p>
            <p className="text-lg font-bold text-emerald-800">{formatMXN(fide.netMonthlySavings)}</p>
          </div>
        </div>
      </Card>
      <FinancialRow label="Inversión total del sistema" value={formatMXN(costBreakdown.total)} />
      <FinancialRow label="Menos incentivo FIDE (25%)" value={`- ${formatMXN(fide.incentiveAmount)}`} />
      <FinancialRow label="Financiado a 60 meses (0%)" value={formatMXN(fide.financedAmount)} />
      <FinancialRow label="Ahorro mensual en CFE" value={formatMXN(monthlySavings)} highlight />
      <FinancialRow label="Pago mensual FIDE (vía recibo)" value={formatMXN(fide.monthlyPayment)} />
      <FinancialRow label="Ahorro neto mensual" value={formatMXN(fide.netMonthlySavings)} highlight />
      <FinancialRow label="ROI con FIDE" value={fide.roiMonths === Infinity ? 'N/A' : `${fide.roiMonths} meses`} />
    </div>,
  ];

  return (
    <div className="section-enter max-w-3xl mx-auto px-4 py-8">
      <SectionHeader
        step={4}
        title="Planes y ahorro"
        description="Aquí están tus opciones de instalación con proyecciones financieras detalladas."
      />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-5 p-1 bg-[#F0E9DA] rounded-xl">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === i
                ? 'bg-[#1A2B4A] text-white shadow-sm'
                : 'text-[#6b7280] hover:text-[#1A2B4A] hover:bg-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card className="mb-5">{tabContent[activeTab]}</Card>

      {/* Cumulative savings line chart */}
      <Card className="mb-5">
        <h3 className="text-sm font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          Ahorro acumulado en 5 años
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={savingsProjection} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e9da" />
            <XAxis dataKey="year" tickFormatter={(v) => `Año ${v}`} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="ahorroBruto" name="Ahorro bruto" stroke="#F5A623" strokeWidth={2.5} dot={{ r: 4, fill: '#F5A623' }} />
            <Line type="monotone" dataKey="conPaneles" name="Ahorro neto (menos inversión)" stroke="#2D9B6F" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly bill comparison bar chart */}
      <Card className="mb-5">
        <h3 className="text-sm font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          Comparativa de factura mensual (MXN estimado)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={billComparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e9da" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="monto" name="Monto mensual" radius={[6, 6, 0, 0]}
              fill="#1A2B4A"
              label={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Scenario Simulator */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer list-none">
          <div className="flex items-center gap-2 px-5 py-3 bg-[#1A2B4A] text-white rounded-xl hover:bg-[#243559] transition-colors w-full">
            <span>🎮</span>
            <span className="font-semibold text-sm">Simulador de escenarios</span>
            <span className="ml-auto text-[#F5A623] text-xs group-open:rotate-180 transition-transform">▼</span>
          </div>
        </summary>

        <Card className="mt-3">
          <p className="text-xs text-[#6b7280] mb-4">
            Ingresa uno de los dos valores para calcular el otro automáticamente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="¿En cuántos meses quieres completar?"
              htmlFor="simMonths"
              helpText="→ Calcula el presupuesto mensual necesario"
            >
              <input
                id="simMonths"
                type="number"
                min="1"
                value={simMonths}
                onChange={(e) => { setSimMonths(e.target.value); setSimBudget(''); }}
                placeholder="p.ej. 18"
                className={inputClass}
              />
            </FormField>

            <FormField
              label="¿Cuánto puedes ahorrar por mes?"
              htmlFor="simBudget"
              helpText="→ Calcula cuántos meses necesitas"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89e8e] text-sm">$</span>
                <input
                  id="simBudget"
                  type="number"
                  min="0"
                  value={simBudget}
                  onChange={(e) => { setSimBudget(e.target.value); setSimMonths(''); }}
                  placeholder="p.ej. 5000"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </FormField>
          </div>

          {simResult && (
            <div className="mt-4 p-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl">
              {simResult.monthsNeeded && (
                <p className="text-sm font-semibold text-[#1A2B4A]">
                  Con {formatMXN(Number(simBudget))}/mes necesitarás{' '}
                  <span className="text-[#E8890C]">{simResult.monthsNeeded} meses</span> para completar la instalación.
                </p>
              )}
              {simResult.budgetNeeded && (
                <p className="text-sm font-semibold text-[#1A2B4A]">
                  Para completar en {simMonths} meses necesitas{' '}
                  <span className="text-[#E8890C]">{formatMXN(simResult.budgetNeeded)}/mes</span>.
                </p>
              )}
            </div>
          )}
        </Card>
      </details>

      <NavButtons onNext={handleNext} canProceed />
    </div>
  );
}
