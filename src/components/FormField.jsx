/**
 * FormField.jsx — Labelled input wrapper with inline validation.
 */
export default function FormField({ label, htmlFor, error, required, children, helpText }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[#1A2B4A]"
      >
        {label}
        {required && <span className="text-[#D94040] ml-1" aria-hidden="true">*</span>}
      </label>
      {helpText && <p className="text-xs text-[#6b7280] -mt-0.5">{helpText}</p>}
      {children}
      {error && (
        <p className="text-xs text-[#D94040] mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Shared input className for consistency.
 */
export const inputClass =
  'w-full rounded-xl border border-[#d4c9b5] bg-white px-3 py-2.5 text-sm text-[#1A2B4A] placeholder-[#a89e8e] focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

export const selectClass =
  'w-full rounded-xl border border-[#d4c9b5] bg-white px-3 py-2.5 text-sm text-[#1A2B4A] focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all duration-150 cursor-pointer';
