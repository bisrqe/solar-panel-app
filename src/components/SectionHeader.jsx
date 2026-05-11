/**
 * SectionHeader.jsx — Consistent section title/description header.
 */
export default function SectionHeader({ step, title, description }) {
  return (
    <div className="mb-7">
      <span className="inline-block text-xs font-semibold text-[#F5A623] uppercase tracking-widest mb-1">
        Paso {step} de 5
      </span>
      <h1
        className="text-2xl sm:text-3xl font-bold text-[#1A2B4A] leading-tight"
        style={{ fontFamily: 'Syne, system-ui, sans-serif' }}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-[#6b7280] max-w-prose">{description}</p>
      )}
    </div>
  );
}
