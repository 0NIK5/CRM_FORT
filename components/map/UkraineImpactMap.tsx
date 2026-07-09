export function UkraineImpactMap({ records, metric = 'patients' }:
  { records: { location: string; region: string; lat: number; lng: number;
    patients: number; consultations: number; meds: number }[]; metric?: 'patients'|'consultations'|'meds' }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-surface-soft" style={{ aspectRatio: '3 / 2' }}>
      <svg viewBox="0 0 100 67" className="h-full w-full">
        {/* стилизованный контур-плейсхолдер Украины */}
        <path d="M8 25 Q20 10 45 14 Q70 8 92 22 Q88 40 78 46 Q60 60 40 56 Q18 52 10 40 Z"
              fill="#EBEBEB" stroke="#DcDcDc" strokeWidth="0.5" />
        {records.map((r, i) => {
          const x = r.lng * 0.9 + 3, y = r.lat * 0.6 + 4;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 3 L-3 0 A2 2 0 0 1 0 -2 A2 2 0 0 1 3 0 Z" fill="#FF6900" />
              <text x="4" y="1.5" fontSize="3" fill="#0A0A0A" fontWeight="600">
                {r[metric].toLocaleString('uk-UA')}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
