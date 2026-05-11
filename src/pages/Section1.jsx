/**
 * Section1.jsx — "Conoce tu consumo"
 * Collects electricity consumption data and shows aptitude result.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSolar } from '../context/SolarContext';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import FormField, { inputClass, selectClass } from '../components/FormField';
import NavButtons from '../components/NavButtons';
import {
  TARIFF_OPTIONS,
  ROOF_MATERIAL_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  GAS_TYPE_OPTIONS,
} from '../data/solarData';
import { isSolarRecommended } from '../utils/calculations';

function validate(data) {
  const errors = {};
  if (!data.postalCode || !/^\d{5}$/.test(data.postalCode)) {
    errors.postalCode = 'Ingresa un código postal válido de 5 dígitos.';
  }
  if (!data.roofFreeArea || isNaN(Number(data.roofFreeArea)) || Number(data.roofFreeArea) <= 0) {
    errors.roofFreeArea = 'Ingresa el área libre en azotea (m²).';
  }
  if (data.hasGasConsumption) {
    if (!data.monthlyGasCost || isNaN(Number(data.monthlyGasCost)) || Number(data.monthlyGasCost) < 0) {
      errors.monthlyGasCost = 'Ingresa el costo mensual de gas.';
    }
  }
  return errors;
}

export default function Section1() {
  const { consumptionData, setConsumptionData, setCurrentStep } = useSolar();
  const navigate = useNavigate();

  const [form, setForm] = useState(consumptionData);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const result = submitted ? isSolarRecommended(form) : null;

  const handleNext = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setConsumptionData(form);
    setCurrentStep(2);
    navigate('/meta');
  };

  const canProceed =
    /^\d{5}$/.test(form.postalCode) &&
    Number(form.roofFreeArea) > 0;

  const handleCheckAptitude = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setConsumptionData(form);
      setSubmitted(true);
    }
  };

  return (
    <div className="section-enter max-w-2xl mx-auto px-4 py-8">
      <SectionHeader
        step={1}
        title="Conoce tu consumo"
        description="Cuéntanos sobre tu instalación eléctrica para evaluar la viabilidad de un sistema solar fotovoltaico."
      />

      <div className="flex flex-col gap-5">
        {/* Postal code */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Ubicación y tarifa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código postal" htmlFor="postalCode" error={errors.postalCode} required>
              <input
                id="postalCode"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={form.postalCode}
                onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, ''))}
                placeholder="p.ej. 64000"
                className={inputClass}
                aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
              />
            </FormField>

            <FormField label="Tipo de tarifa CFE" htmlFor="tariffType">
              <select
                id="tariffType"
                value={form.tariffType}
                onChange={(e) => set('tariffType', e.target.value)}
                className={selectClass}
              >
                {TARIFF_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
          </div>

          {form.tariffType === 'DAC' && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-500 text-lg flex-shrink-0">⚠</span>
              <p className="text-sm text-red-700 font-medium">
                Tu tarifa actual es <strong>DAC</strong> — instalación urgentemente recomendada. Esta tarifa es la más costosa y un sistema solar puede reducir tu factura de manera significativa.
              </p>
            </div>
          )}
        </Card>

        {/* Recibo CFE */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Recibo CFE
          </h2>
          <FormField
            label="Foto del recibo CFE (parte trasera)"
            htmlFor="cfeReceiptPhoto"
            helpText="Opcional — la imagen no se sube a ningún servidor. Solo se usa localmente."
          >
            <input
              id="cfeReceiptPhoto"
              type="file"
              accept="image/*"
              onChange={(e) => set('cfeReceiptPhoto', e.target.files[0]?.name ?? null)}
              className="block w-full text-sm text-[#1A2B4A] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5A623] file:text-[#1A2B4A] hover:file:bg-[#E8890C] file:cursor-pointer cursor-pointer"
            />
            {form.cfeReceiptPhoto && (
              <p className="text-xs text-emerald-600 mt-1">✓ Archivo seleccionado: {form.cfeReceiptPhoto}</p>
            )}
          </FormField>
        </Card>

        {/* Electrical installation */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Instalación eléctrica
          </h2>
          <div className="flex flex-col gap-4">
            <FormField label="Tipo de conexión" htmlFor="connectionType">
              <div className="flex flex-wrap gap-3 mt-1" role="radiogroup" aria-labelledby="connectionType-label">
                {CONNECTION_TYPE_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="connectionType"
                      value={opt}
                      checked={form.connectionType === opt}
                      onChange={() => set('connectionType', opt)}
                      className="accent-[#F5A623] w-4 h-4"
                    />
                    <span className="text-sm text-[#1A2B4A] group-hover:text-[#E8890C] transition-colors">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </FormField>

            <Toggle
              id="hasGrounding"
              label="¿Tiene conexión a tierra física?"
              checked={form.hasGrounding}
              onChange={(v) => set('hasGrounding', v)}
            />
          </div>
        </Card>

        {/* Roof */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Condiciones de la azotea
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Material de la azotea" htmlFor="roofMaterial">
              <select
                id="roofMaterial"
                value={form.roofMaterial}
                onChange={(e) => set('roofMaterial', e.target.value)}
                className={selectClass}
              >
                {ROOF_MATERIAL_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Espacio libre en azotea (m²)"
              htmlFor="roofFreeArea"
              error={errors.roofFreeArea}
              required
            >
              <input
                id="roofFreeArea"
                type="number"
                min="0"
                step="1"
                value={form.roofFreeArea}
                onChange={(e) => set('roofFreeArea', e.target.value)}
                placeholder="p.ej. 30"
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="mt-4">
            <Toggle
              id="hasObstacles"
              label="¿Hay sombras u obstáculos?"
              helpText="Edificios, árboles, tinacos, antenas, etc."
              checked={form.hasObstacles}
              onChange={(v) => set('hasObstacles', v)}
            />
          </div>
        </Card>

        {/* Gas consumption */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Consumo de gas
          </h2>
          <Toggle
            id="hasGasConsumption"
            label="¿Consume gas LP o Natural?"
            helpText="Para evaluar si también te conviene un calentador solar."
            checked={form.hasGasConsumption}
            onChange={(v) => set('hasGasConsumption', v)}
          />

          {form.hasGasConsumption && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Tipo de gas" htmlFor="gasType">
                <select
                  id="gasType"
                  value={form.gasType}
                  onChange={(e) => set('gasType', e.target.value)}
                  className={selectClass}
                >
                  {GAS_TYPE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Gasto mensual en gas (MXN)"
                htmlFor="monthlyGasCost"
                error={errors.monthlyGasCost}
                required
              >
                <input
                  id="monthlyGasCost"
                  type="number"
                  min="0"
                  step="50"
                  value={form.monthlyGasCost}
                  onChange={(e) => set('monthlyGasCost', e.target.value)}
                  placeholder="p.ej. 500"
                  className={inputClass}
                />
              </FormField>
            </div>
          )}
        </Card>

        {/* Aptitude check button */}
        <button
          type="button"
          onClick={handleCheckAptitude}
          className="w-full py-3 rounded-xl bg-[#1A2B4A] text-white font-semibold text-sm hover:bg-[#243559] transition-colors duration-150 shadow-sm"
        >
          Verificar aptitud solar
        </button>

        {/* Result banner */}
        {submitted && result && (
          <div
            className={`rounded-2xl p-4 flex items-start gap-3 border ${
              result.recommended
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
            role="status"
          >
            <span className="text-2xl flex-shrink-0">{result.recommended ? '☀' : '✗'}</span>
            <div>
              <p className="font-semibold">
                {result.recommended
                  ? '✓ Tu establecimiento es apto para paneles solares'
                  : 'Tu instalación presenta restricciones'}
              </p>
              {result.reason && <p className="text-sm mt-1 opacity-90">{result.reason}</p>}
            </div>
          </div>
        )}

        {/* Gas info card */}
        {form.hasGasConsumption && (
          <Card variant="info">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌊</span>
              <div>
                <p className="font-semibold text-blue-800 text-sm">También puedes evaluar calentadores solares de agua</p>
                <p className="text-xs text-blue-700 mt-1">
                  Un calentador solar de agua puede reducir tu consumo de gas LP o Natural hasta en un 70%, con un retorno de inversión de 2–4 años.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <NavButtons
        onNext={handleNext}
        canProceed={canProceed}
        hidePrev
      />
    </div>
  );
}
