/**
 * Section3.jsx — "Diagnóstico energético"
 * Computes and displays energy diagnostics. No new user inputs.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useSolar } from '../context/SolarContext';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import NavButtons from '../components/NavButtons';
import { getSolarRadiation, getAverageConsumption } from '../data/solarData';
import { calculateRequiredKw, formatMXN, calculateMonthlySavings } from '../utils/calculations';

const LEVEL_LABELS = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };

function StatCard({ icon, label, value, sub, variant = 'default' }) {
  return (
    <Card variant={variant} className="flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl" aria-hidden="true">{icon}</span>
        <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#1A2B4A]" style={{ fontFamily: 'Syne, sans-serif' }}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#6b7280]">{sub}</p>}
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e8e0d2] rounded-xl p-3 shadow-md text-sm">
        <p className="font-semibold text-[#1A2B4A] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{p.value} kWh</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Section3() {
  const { consumptionData, goalData, setCurrentStep } = useSolar();
  const navigate = useNavigate();

  const { tariffType, postalCode } = consumptionData;
  const { coveragePercentage } = goalData;

  const radiation = useMemo(() => getSolarRadiation(postalCode), [postalCode]);
  const consumption = useMemo(() => getAverageConsumption(tariffType), [tariffType]);

  const requiredKw = useMemo(
    () => calculateRequiredKw(consumption.avgKwh, coveragePercentage, radiation.hoursPerDay),
    [consumption.avgKwh, coveragePercentage, radiation.hoursPerDay]
  );

  const kwCovered = useMemo(
    () => Math.round((consumption.avgKwh * coveragePercentage) / 100),
    [consumption.avgKwh, coveragePercentage]
  );

  const monthlySavings = useMemo(
    () => calculateMonthlySavings(kwCovered, tariffType),
    [kwCovered, tariffType]
  );

  const chartData = [
    {
      name: 'Consumo mensual',
      'Sin paneles': consumption.avgKwh,
      'Con paneles': consumption.avgKwh - kwCovered,
      'Cubierto por solar': kwCovered,
    },
  ];

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/planes');
  };

  return (
    <div className="section-enter max-w-3xl mx-auto px-4 py-8">
      <SectionHeader
        step={3}
        title="Diagnóstico energético"
        description="Basado en tu código postal y tarifa, aquí está el análisis de tu potencial solar."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <StatCard
          icon="⚡"
          label="Consumo promedio"
          value={`${consumption.avgKwh} kWh/mes`}
          sub={`Tarifa ${tariffType} — nivel de consumo:`}
        />
        <Card className="flex flex-col gap-2 justify-center">
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Nivel de consumo</span>
          <div className="flex items-center gap-2">
            <Badge level={consumption.level}>
              {LEVEL_LABELS[consumption.level]}
            </Badge>
            {consumption.dacRisk && (
              <Badge level="warning">Riesgo DAC</Badge>
            )}
          </div>
          <p className="text-xs text-[#6b7280]">
            {consumption.level === 'alto'
              ? 'Consumo elevado — inversión en paneles muy recomendable.'
              : consumption.level === 'medio'
              ? 'Consumo moderado — paneles ofrecen buen retorno.'
              : 'Consumo bajo — considera un sistema pequeño.'}
          </p>
        </Card>

        <StatCard
          icon="☀"
          label="Radiación solar"
          value={`${radiation.hoursPerDay} hrs sol/día`}
          sub={`Región: ${radiation.region}`}
          variant="solar"
        />

        <StatCard
          icon="🔋"
          label="Potencia del sistema necesaria"
          value={`${requiredKw} kWp`}
          sub={`Para cubrir el ${coveragePercentage}% de tu consumo`}
          variant="solar"
        />
      </div>

      {/* DAC risk warning */}
      {consumption.dacRisk && tariffType !== 'DAC' && (
        <Card variant="danger" className="mb-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠</span>
            <div>
              <p className="font-semibold text-red-800">Riesgo de tarifa DAC detectado</p>
              <p className="text-sm text-red-700 mt-1">
                Tu nivel de consumo te acerca a la tarifa DAC. Con esta tarifa, el costo por kWh se multiplica hasta 5 veces.
                Un sistema solar puede protegerte de este incremento.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly savings preview */}
      <Card variant="amber" className="mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Ahorro estimado mensual</p>
            <p className="text-3xl font-bold text-[#1A2B4A]" style={{ fontFamily: 'Syne, sans-serif' }}>
              {formatMXN(monthlySavings)}
            </p>
            <p className="text-xs text-amber-700 mt-1">{formatMXN(monthlySavings * 12)} / año</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-700 font-medium">Energía cubierta</p>
            <p className="text-2xl font-bold text-[#E8890C]" style={{ fontFamily: 'Syne, sans-serif' }}>
              {kwCovered} kWh
            </p>
            <p className="text-xs text-amber-700">de {consumption.avgKwh} kWh totales</p>
          </div>
        </div>
      </Card>

      {/* Bar Chart */}
      <Card className="mb-5">
        <h3 className="text-sm font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          Comparativa de consumo mensual (kWh)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e9da" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Sin paneles" fill="#1A2B4A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Con paneles" fill="#E8890C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cubierto por solar" fill="#F5A623" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary info */}
      <Card variant="navy" className="mb-2">
        <p className="text-sm text-white/80 leading-relaxed">
          Con un sistema de <strong className="text-[#F5A623]">{requiredKw} kWp</strong>, cubrirás{' '}
          <strong className="text-[#F5A623]">{kwCovered} kWh/mes</strong> ({coveragePercentage}% de tu consumo),
          aprovechando las <strong className="text-[#F5A623]">{radiation.hoursPerDay} horas de sol</strong> disponibles
          en <strong className="text-[#F5A623]">{radiation.region}</strong>.
        </p>
      </Card>

      <NavButtons onNext={handleNext} canProceed />
    </div>
  );
}
