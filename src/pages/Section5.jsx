/**
 * Section5.jsx — "Instala tu sistema"
 * Installer directory, FIDE eligibility, maintenance plan.
 */
import { useState, useMemo } from 'react';
import { useSolar } from '../context/SolarContext';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import FormField, { inputClass, selectClass } from '../components/FormField';
import { MORTGAGE_STATUS_OPTIONS } from '../data/solarData';
import { getInstallersByPostalCode } from '../data/installers';
import { panelsDatabase } from '../data/panelsDatabase';
import { getAverageConsumption, getSolarRadiation } from '../data/solarData';
import { calculateRequiredKw, calculatePanelsNeeded } from '../utils/calculations';

const FIDE_TARIFFS = ['1A', '1B', '1C', '1D', '1E', '1F'];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Calificación: ${rating} de 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-[#F5A623]' : 'text-gray-200'}`} aria-hidden="true">
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-[#6b7280] font-medium">{rating}</span>
    </div>
  );
}

function InstallerCard({ installer }) {
  return (
    <Card className="flex flex-col gap-3 hover:border-[#F5A623]/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#1A2B4A] text-sm">{installer.name}</p>
          <p className="text-xs text-[#6b7280]">
            {installer.city}, {installer.state}
          </p>
        </div>
        <div className="flex-shrink-0 bg-[#F5A623]/10 rounded-lg p-2">
          <span className="text-lg" aria-hidden="true">🏢</span>
        </div>
      </div>

      <StarRating rating={installer.rating} />

      <div className="flex flex-wrap gap-1">
        {installer.certifications.map((cert) => (
          <span key={cert} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            {cert}
          </span>
        ))}
      </div>

      <div className="text-xs text-[#6b7280]">
        <p>{installer.yearsExperience} años de experiencia</p>
        <p className="mt-0.5">{installer.phone}</p>
      </div>

      <a
        href={`mailto:${installer.email}`}
        className="mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1A2B4A] text-white text-xs font-semibold rounded-xl hover:bg-[#243559] transition-colors duration-150"
        aria-label={`Contactar a ${installer.name} por correo electrónico`}
      >
        ✉ Contactar
      </a>
    </Card>
  );
}

export default function Section5() {
  const { consumptionData, section5Data, setSection5Data, goalData, resetAll } = useSolar();
  const [form, setForm] = useState(section5Data);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const set = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setSection5Data(updated);
  };

  const { tariffType, postalCode } = consumptionData;
  const { coveragePercentage } = goalData;

  // FIDE eligibility
  const fideEligible = useMemo(() => {
    const bill = Number(form.monthlyBill);
    return (
      bill >= 1500 &&
      FIDE_TARIFFS.includes(tariffType) &&
      !form.hasInfonavit
    );
  }, [form.monthlyBill, form.hasInfonavit, tariffType]);

  // Selected panel warranty (from recommended panel)
  const radiation = useMemo(() => getSolarRadiation(postalCode), [postalCode]);
  const consumption = useMemo(() => getAverageConsumption(tariffType), [tariffType]);
  const requiredKw = useMemo(
    () => calculateRequiredKw(consumption.avgKwh, coveragePercentage, radiation.hoursPerDay),
    [consumption.avgKwh, coveragePercentage, radiation.hoursPerDay]
  );
  const recommendedPanel = useMemo(() => {
    return [...panelsDatabase].sort((a, b) => b.efficiency - a.efficiency)[0];
  }, []);

  // Installers
  const nearbyInstallers = useMemo(
    () => getInstallersByPostalCode(postalCode),
    [postalCode]
  );

  return (
    <div className="section-enter max-w-3xl mx-auto px-4 py-8">
      <SectionHeader
        step={5}
        title="Instala tu sistema"
        description="Todo lo que necesitas para dar el siguiente paso: instaladores, financiamiento y mantenimiento."
      />

      {/* FIDE Eligibility form */}
      <Card className="mb-5">
        <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          Elegibilidad Programa FIDE
        </h2>

        <div className="flex flex-col gap-4">
          <Toggle
            id="hasInfonavit"
            label="¿Tienes acceso a Infonavit o Fovissste?"
            helpText="Para créditos de vivienda relacionados con mejoras de eficiencia."
            checked={form.hasInfonavit}
            onChange={(v) => set('hasInfonavit', v)}
          />

          <FormField label="Situación hipotecaria" htmlFor="mortgageStatus">
            <select
              id="mortgageStatus"
              value={form.mortgageStatus}
              onChange={(e) => set('mortgageStatus', e.target.value)}
              className={selectClass}
            >
              {MORTGAGE_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FormField>

          <FormField
            label="¿Cuánto pagas mensualmente de luz? (MXN)"
            htmlFor="monthlyBill"
            helpText="Para verificar elegibilidad FIDE ($1,500+ requerido)."
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89e8e] text-sm">$</span>
              <input
                id="monthlyBill"
                type="number"
                min="0"
                step="100"
                value={form.monthlyBill}
                onChange={(e) => set('monthlyBill', e.target.value)}
                placeholder="p.ej. 2000"
                className={`${inputClass} pl-7`}
              />
            </div>
          </FormField>
        </div>
      </Card>

      {/* FIDE Eligibility Result */}
      {form.monthlyBill !== '' && (
        <Card variant={fideEligible ? 'success' : 'default'} className="mb-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{fideEligible ? '✅' : '⚪'}</span>
            <div>
              <h3 className={`font-semibold text-sm mb-2 ${fideEligible ? 'text-emerald-800' : 'text-[#6b7280]'}`}>
                Programa FIDE — Paneles Solares para tu Casa
              </h3>
              {fideEligible ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-emerald-700 font-medium">✓ Eres elegible para el Programa FIDE</p>
                  <ul className="text-xs text-emerald-700 space-y-1 ml-3 list-disc">
                    <li>25% de incentivo directo sobre el costo del sistema</li>
                    <li>75% financiado a 5 años (60 meses) a tasa 0%</li>
                    <li>Pagos vía recibo CFE — sin trámites bancarios adicionales</li>
                    <li>Aplicable a casas con valor hasta $4 MDP</li>
                    <li>Sistemas de 5 a 8 kWp elegibles</li>
                    <li>Instaladores certificados por ANES</li>
                  </ul>
                  <a
                    href="https://www.fide.org.mx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                    aria-label="Más información sobre el Programa FIDE (abre en nueva pestaña)"
                  >
                    Más información en fide.org.mx ↗
                  </a>
                </div>
              ) : (
                <div className="text-sm text-[#6b7280]">
                  <p className="mb-1">No calificas para el Programa FIDE en este momento. Razones posibles:</p>
                  <ul className="text-xs space-y-0.5 ml-3 list-disc">
                    {Number(form.monthlyBill) < 1500 && (
                      <li>Factura mensual menor a $1,500 MXN (la tuya: ${form.monthlyBill})</li>
                    )}
                    {!FIDE_TARIFFS.includes(tariffType) && (
                      <li>Tu tarifa {tariffType} no está incluida en el programa</li>
                    )}
                    {form.hasInfonavit && (
                      <li>Tienes crédito Infonavit/Fovissste activo</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Installer directory */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1A2B4A]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Instaladores certificados
          </h2>
          <span className="text-xs text-[#6b7280]">
            {nearbyInstallers.length} encontrados
            {postalCode ? ` para CP ${postalCode}` : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nearbyInstallers.map((installer) => (
            <InstallerCard key={installer.id} installer={installer} />
          ))}
        </div>
      </div>

      {/* Maintenance plan */}
      <Card variant="navy" className="mb-5">
        <h2 className="text-base font-semibold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          Plan de mantenimiento recomendado
        </h2>

        <div className="flex flex-col gap-3">
          {[
            {
              freq: 'Cada 3–6 meses',
              task: 'Limpieza de paneles',
              cost: '$300–$800 MXN',
              icon: '🧹',
            },
            {
              freq: 'Anual',
              task: 'Revisión de inversor y conexiones',
              cost: '$500–$1,200 MXN',
              icon: '🔧',
            },
            {
              freq: 'Cada 2 años',
              task: 'Inspección general del sistema',
              cost: '$800–$2,000 MXN',
              icon: '🔍',
            },
            {
              freq: `${recommendedPanel.warrantyYears} años`,
              task: 'Garantía del sistema (modelo seleccionado)',
              cost: `${recommendedPanel.brand} ${recommendedPanel.model}`,
              icon: '📋',
            },
          ].map((item) => (
            <div key={item.task} className="flex items-start gap-3 py-2 border-b border-white/10 last:border-0">
              <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.task}</p>
                <p className="text-xs text-white/60 mt-0.5">{item.freq}</p>
              </div>
              <p className="text-sm font-semibold text-[#F5A623] flex-shrink-0 text-right">{item.cost}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Success banner */}
      <Card variant="solar" className="mb-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden="true">☀</span>
          <div>
            <h3 className="font-bold text-[#1A2B4A] text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              ¡Diagnóstico completado!
            </h3>
            <p className="text-sm text-[#6b7280]">
              Tienes toda la información que necesitas para tomar una decisión informada sobre tu instalación solar.
              Contacta a un instalador certificado para obtener una cotización personalizada.
            </p>
          </div>
        </div>
      </Card>

      {/* Reset */}
      <div className="flex justify-center mt-4">
        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-[#a89e8e] hover:text-[#D94040] transition-colors underline underline-offset-2"
          >
            Reiniciar diagnóstico
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-700">¿Estás seguro? Se borrarán todos tus datos.</p>
            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold text-white bg-[#D94040] px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sí, reiniciar
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="text-xs text-[#6b7280] hover:text-[#1A2B4A] transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Prev only — last step */}
      <div className="flex justify-start mt-8 pt-6 border-t border-[#e8e0d2]">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#d4c9b5] text-[#1A2B4A] text-sm font-medium hover:bg-[#F0E9DA] transition-colors duration-150"
        >
          ← Anterior
        </a>
      </div>
    </div>
  );
}
