/**
 * NavButtons.jsx — Wizard navigation (Anterior / Siguiente) buttons.
 */
import { useNavigate } from 'react-router-dom';
import { useSolar } from '../context/SolarContext';

const ROUTES = ['/', '/meta', '/diagnostico', '/planes', '/instala'];

export default function NavButtons({ onNext, canProceed = true, hidePrev = false, nextLabel = 'Siguiente →' }) {
  const { currentStep, setCurrentStep } = useSolar();
  const navigate = useNavigate();

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      navigate(ROUTES[prevStep - 1]);
    }
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (onNext) {
      onNext();
    } else {
      const nextStep = currentStep + 1;
      if (nextStep <= ROUTES.length) {
        setCurrentStep(nextStep);
        navigate(ROUTES[nextStep - 1]);
      }
    }
  };

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#e8e0d2]">
      {!hidePrev && currentStep > 1 ? (
        <button
          type="button"
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#d4c9b5] text-[#1A2B4A] text-sm font-medium hover:bg-[#F0E9DA] transition-colors duration-150"
        >
          ← Anterior
        </button>
      ) : (
        <div />
      )}

      {currentStep < ROUTES.length && (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          aria-disabled={!canProceed}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
            canProceed
              ? 'bg-[#F5A623] text-[#1A2B4A] hover:bg-[#E8890C] shadow-sm hover:shadow-md active:scale-[0.98]'
              : 'bg-[#d4c9b5] text-[#8a7e6e] cursor-not-allowed'
          }`}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
