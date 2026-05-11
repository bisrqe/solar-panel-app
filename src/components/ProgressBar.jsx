/**
 * ProgressBar.jsx — Wizard step progress bar (persistent top bar)
 */
import { useNavigate } from 'react-router-dom';
import { useSolar } from '../context/SolarContext';

const STEPS = [
  { num: 1, label: 'Consumo', path: '/' },
  { num: 2, label: 'Meta Solar', path: '/meta' },
  { num: 3, label: 'Diagnóstico', path: '/diagnostico' },
  { num: 4, label: 'Planes', path: '/planes' },
  { num: 5, label: 'Instalación', path: '/instala' },
];

export default function ProgressBar() {
  const { currentStep, setCurrentStep } = useSolar();
  const navigate = useNavigate();

  const handleStepClick = (step) => {
    if (step.num <= currentStep) {
      setCurrentStep(step.num);
      navigate(step.path);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-[#1A2B4A] shadow-lg">
      {/* App header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#243559]">
        <div className="flex items-center gap-2">
          <span className="text-[#F5A623] text-xl" aria-hidden="true">☀</span>
          <span
            className="text-white font-bold text-lg tracking-tight"
            style={{ fontFamily: 'Syne, system-ui, sans-serif' }}
          >
            SolarDiag
          </span>
        </div>
        <span className="text-[#F5A623] text-sm font-medium">
          Paso {currentStep} de {STEPS.length}
        </span>
      </div>

      {/* Steps row */}
      <div className="flex items-stretch relative px-2 py-2 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const isCompleted = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const isClickable = step.num <= currentStep;

          return (
            <div key={step.num} className="flex items-center flex-1 min-w-0">
              {/* Connector line before */}
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'bg-[#F5A623]' : 'bg-[#243559]'
                  }`}
                />
              )}

              {/* Step circle + label */}
              <button
                onClick={() => handleStepClick(step)}
                disabled={!isClickable}
                aria-label={`Paso ${step.num}: ${step.label}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex flex-col items-center gap-1 px-2 transition-opacity duration-200 ${
                  isClickable ? 'cursor-pointer opacity-100' : 'cursor-default opacity-40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#F5A623] text-[#1A2B4A]'
                      : isCurrent
                      ? 'bg-white text-[#1A2B4A] ring-2 ring-[#F5A623] ring-offset-1 ring-offset-[#1A2B4A]'
                      : 'bg-[#243559] text-[#8fa0bf]'
                  }`}
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <span
                  className={`text-[10px] hidden sm:block font-medium whitespace-nowrap transition-colors duration-200 ${
                    isCurrent
                      ? 'text-[#F5A623]'
                      : isCompleted
                      ? 'text-white'
                      : 'text-[#8fa0bf]'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line after last step */}
              {idx === STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${isCurrent || isCompleted ? 'bg-[#F5A623]' : 'bg-[#243559]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress fill bar */}
      <div className="h-1 bg-[#243559]">
        <div
          className="h-full bg-[#F5A623] transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
