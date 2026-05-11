import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SolarContext = createContext(null);

const STORAGE_KEY = 'solardiag_state';

const defaultConsumptionData = {
  postalCode: '',
  cfeReceiptPhoto: null,
  tariffType: '1A',
  connectionType: 'Monofásica',
  hasGrounding: false,
  roofMaterial: 'Concreto',
  roofFreeArea: '',
  hasObstacles: false,
  hasGasConsumption: false,
  gasType: 'LP',
  monthlyGasCost: '',
};

const defaultGoalData = {
  coveragePercentage: 100,
  installationType: 'Instalación completa',
  targetMonths: '',
  monthlyBudget: '',
  availableBudget: '',
};

const defaultSection5Data = {
  hasInfonavit: false,
  mortgageStatus: 'Sin hipoteca',
  monthlyBill: '',
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function SolarProvider({ children }) {
  const saved = loadFromStorage();

  const [consumptionData, setConsumptionDataRaw] = useState(
    saved?.consumptionData ?? defaultConsumptionData
  );
  const [goalData, setGoalDataRaw] = useState(
    saved?.goalData ?? defaultGoalData
  );
  const [section5Data, setSection5DataRaw] = useState(
    saved?.section5Data ?? defaultSection5Data
  );
  const [currentStep, setCurrentStep] = useState(saved?.currentStep ?? 1);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ consumptionData, goalData, section5Data, currentStep })
      );
    } catch {
      // Storage quota exceeded — fail silently
    }
  }, [consumptionData, goalData, section5Data, currentStep]);

  const setConsumptionData = useCallback((updater) => {
    setConsumptionDataRaw((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const setGoalData = useCallback((updater) => {
    setGoalDataRaw((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const setSection5Data = useCallback((updater) => {
    setSection5DataRaw((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const resetAll = useCallback(() => {
    setConsumptionDataRaw(defaultConsumptionData);
    setGoalDataRaw(defaultGoalData);
    setSection5DataRaw(defaultSection5Data);
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SolarContext.Provider
      value={{
        consumptionData,
        setConsumptionData,
        goalData,
        setGoalData,
        section5Data,
        setSection5Data,
        currentStep,
        setCurrentStep,
        resetAll,
      }}
    >
      {children}
    </SolarContext.Provider>
  );
}

export function useSolar() {
  const ctx = useContext(SolarContext);
  if (!ctx) throw new Error('useSolar must be used within <SolarProvider>');
  return ctx;
}
