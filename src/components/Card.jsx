/**
 * Card.jsx — Reusable card container with optional title and accent variants.
 */
export default function Card({ children, className = '', title, icon, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-white border border-[#e8e0d2] shadow-sm',
    navy: 'bg-[#1A2B4A] text-white border border-[#243559]',
    amber: 'bg-amber-50 border border-amber-200',
    success: 'bg-emerald-50 border border-emerald-200',
    danger: 'bg-red-50 border border-red-200',
    info: 'bg-blue-50 border border-blue-200',
    solar: 'bg-gradient-to-br from-[#F5A623]/10 to-[#F9F5EE] border border-[#F5A623]/30',
  };

  return (
    <div
      className={`rounded-2xl p-5 ${variants[variant] ?? variants.default} ${className}`}
      {...props}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
          {title && (
            <h3 className="font-semibold text-sm uppercase tracking-wide opacity-70" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
