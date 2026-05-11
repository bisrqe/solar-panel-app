/**
 * Toggle.jsx — Boolean toggle switch with label.
 */
export default function Toggle({ id, label, checked, onChange, helpText }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#1A2B4A] cursor-pointer select-none"
        >
          {label}
        </label>
        {helpText && <span className="text-xs text-[#6b7280]">{helpText}</span>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 ${
          checked ? 'bg-[#F5A623]' : 'bg-gray-200'
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
