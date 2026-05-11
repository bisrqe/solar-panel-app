/**
 * Section2.jsx — "Define tu meta solar"
 * User defines coverage goals and budget.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSolar } from '../context/SolarContext';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import FormField, { inputClass } from '../components/FormField';
import NavButtons from '../components/NavButtons';

function validate(data) {
  const errors = {};
  if (!data.availableBudget || isNaN(Number(data.availableBudget)) || Number(data.availableBudget) < 0) {
    errors.availableBudget = 'Ingresa el presupuesto disponible (puede ser 0).';
  }
  if (data.installationType === 'Instalación gradual') {
    if (!data.targetMonths || isNaN(Number(data.targetMonths)) || Number(data.targetMonths) < 1) {
      errors.targetMonths = 'Ingresa el número de meses (mínimo 1).';
    }
    if (!data.monthlyBudget || isNaN(Number(data.monthlyBudget)) || Number(data.monthlyBudget) <= 0) {
      errors.monthlyBudget = 'Ingresa el presupuesto mensual.';
    }
  }
  return errors;
}

export default function Section2() {
  const { goalData, setGoalData, setCurrentStep } = useSolar();
  const navigate = useNavigate();
  const [form, setForm] = useState(goalData);
  const [errors, setErrors] = useState({});
  const rangeRef = useRef(null);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Update CSS custom property for range track fill
  useEffect(() => {
    if (rangeRef.current) {
      const pct = ((form.coveragePercentage - 10) / 90) * 100;
      rangeRef.current.style.setProperty('--range-progress', `${pct}%`);
    }
  }, [form.coveragePercentage]);

  const canProceed =
    form.availableBudget !== '' &&
    !isNaN(Number(form.availableBudget)) &&
    Number(form.availableBudget) >= 0 &&
    (form.installationType !== 'Instalación gradual' ||
      (Number(form.targetMonths) >= 1 && Number(form.monthlyBudget) > 0));

  const handleNext = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setGoalData(form);
    setCurrentStep(3);
    navigate('/diagnostico');
  };

  return (
    <div className="section-enter max-w-2xl mx-auto px-4 py-8">
      <SectionHeader
        step={2}
        title="Define tu meta solar"
        description="Dinos cuánto de tu consumo quieres cubrir y con qué presupuesto cuentas."
      />

      <div className="flex flex-col gap-5">
        {/* Coverage slider */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            Cobertura deseada
          </h2>
          <p className="text-xs text-[#6b7280] mb-5">
            ¿Qué porcentaje de tu consumo eléctrico deseas cubrir con energía solar?
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <label htmlFor="coverageSlider" className="text-sm font-medium text-[#1A2B4A]">
                % de consumo a cubrir
              </label>
              <span className="text-3xl font-bold text-[#F5A623]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {form.coveragePercentage}%
              </span>
            </div>

            <input
              id="coverageSlider"
              ref={rangeRef}
              type="range"
              min={10}
              max={100}
              step={5}
              value={form.coveragePercentage}
              onChange={(e) => set('coveragePercentage', Number(e.target.value))}
              aria-label={`Cobertura deseada: ${form.coveragePercentage}%`}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-[#a89e8e]">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {/* Coverage meaning chips */}
            <div className="flex flex-wrap gap-2 mt-1">
              {form.coveragePercentage <= 30 && (
                <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  Apoyo parcial — reducción básica de factura
                </span>
              )}
              {form.coveragePercentage > 30 && form.coveragePercentage < 100 && (
                <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  Cobertura media — ahorro significativo
                </span>
              )}
              {form.coveragePercentage === 100 && (
                <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Autoabastecimiento total — independencia energética
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Installation type */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Tipo de instalación
          </h2>

          <div className="flex flex-col sm:flex-row gap-3" role="radiogroup" aria-label="Tipo de instalación">
            {['Instalación completa', 'Instalación gradual'].map((opt) => (
              <label
                key={opt}
                className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  form.installationType === opt
                    ? 'border-[#F5A623] bg-amber-50'
                    : 'border-[#e8e0d2] bg-white hover:border-[#d4c9b5]'
                }`}
              >
                <input
                  type="radio"
                  name="installationType"
                  value={opt}
                  checked={form.installationType === opt}
                  onChange={() => set('installationType', opt)}
                  className="mt-0.5 accent-[#F5A623] w-4 h-4 flex-shrink-0"
                />
                <div>
                  <p className={`text-sm font-semibold ${form.installationType === opt ? 'text-[#E8890C]' : 'text-[#1A2B4A]'}`}>
                    {opt}
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {opt === 'Instalación completa'
                      ? 'Instalas todos los paneles de una vez con tu presupuesto disponible.'
                      : 'Instalas paneles progresivamente según tu capacidad de pago mensual.'}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Gradual sub-fields */}
          {form.installationType === 'Instalación gradual' && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#e8e0d2]">
              <FormField
                label="Tiempo meta (meses)"
                htmlFor="targetMonths"
                error={errors.targetMonths}
                required
                helpText="¿En cuántos meses quieres completar la instalación?"
              >
                <input
                  id="targetMonths"
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  value={form.targetMonths}
                  onChange={(e) => set('targetMonths', e.target.value)}
                  placeholder="p.ej. 12"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Presupuesto mensual (MXN)"
                htmlFor="monthlyBudget"
                error={errors.monthlyBudget}
                required
                helpText="¿Cuánto puedes destinar por mes a la instalación?"
              >
                <input
                  id="monthlyBudget"
                  type="number"
                  min="0"
                  step="500"
                  value={form.monthlyBudget}
                  onChange={(e) => set('monthlyBudget', e.target.value)}
                  placeholder="p.ej. 5000"
                  className={inputClass}
                />
              </FormField>
            </div>
          )}
        </Card>

        {/* Available budget */}
        <Card>
          <h2 className="text-base font-semibold text-[#1A2B4A] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Presupuesto disponible
          </h2>

          <FormField
            label="Dinero disponible actualmente para instalación (MXN)"
            htmlFor="availableBudget"
            error={errors.availableBudget}
            required
            helpText="Ingresa 0 si deseas financiamiento completo."
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89e8e] text-sm font-medium">$</span>
              <input
                id="availableBudget"
                type="number"
                min="0"
                step="1000"
                value={form.availableBudget}
                onChange={(e) => set('availableBudget', e.target.value)}
                placeholder="p.ej. 80000"
                className={`${inputClass} pl-7`}
              />
            </div>
          </FormField>
        </Card>
      </div>

      <NavButtons onNext={handleNext} canProceed={canProceed} />
    </div>
  );
}
