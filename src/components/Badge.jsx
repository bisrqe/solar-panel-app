/**
 * Badge.jsx — Status badge with level-based colors.
 */
export default function Badge({ level, children }) {
  const styles = {
    alto: 'bg-red-100 text-red-700 border border-red-200',
    medio: 'bg-amber-100 text-amber-700 border border-amber-200',
    bajo: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[level] ?? styles.neutral}`}>
      {children}
    </span>
  );
}
