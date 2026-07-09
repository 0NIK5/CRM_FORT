// Реальний контур України (equirectangular-проєкція, viewBox 100 x 66.67).
// Піни-сердечка розставлені за реальними координатами обласних локацій —
// координати спроєктовані тією ж проєкцією, що й контур, тож лягають точно.
const UA_PATH =
  'M53.91 1.95 L55.98 2.29 L57.38 0.39 L59.07 0.81 L64.83 0 L68.39 4.73 L67 6.43 L67.46 9.02 L71.89 9.43 L73.87 13.05 L73.74 14.7 L80.8 17.64 L85.07 16.31 L88.5 20.23 L91.74 20.14 L99.93 22.86 L100 25.32 L97.74 29.69 L98.97 34.3 L98.1 37.09 L92.72 37.71 L89.85 40.04 L89.68 43.75 L85.24 44.42 L81.55 47.13 L76.34 47.57 L71.56 50.69 L71.88 55.89 L74.6 57.9 L80.27 57.4 L79.18 60.39 L73.1 61.83 L65.56 66.67 L62.47 64.97 L63.69 61.04 L57.62 58.59 L58.6 56.99 L63.92 54.21 L62.31 52.3 L53.67 50.18 L53.29 47.07 L48.14 48.09 L46.08 52.7 L41.78 58.88 L39.26 57.44 L36.64 58.79 L34.16 57.25 L35.56 56.34 L36.53 53.47 L38.06 50.81 L37.66 49.31 L38.82 48.64 L39.37 49.8 L42.65 50.04 L44.12 49.43 L43.08 48.58 L43.47 47.33 L41.53 45.21 L40.73 41.71 L38.71 40.34 L39.11 37.51 L36.59 35.26 L34.31 34.95 L30.21 32.34 L26.52 33.17 L25.19 34.4 L22.85 34.4 L21.45 36.36 L17.35 37.16 L15.45 38.44 L12.87 36.4 L9.31 36.37 L5.87 35.44 L3.47 37.23 L3.09 34.99 L0 32.72 L1.08 29.35 L2.63 27.17 L3.84 27.66 L2.41 23.9 L7.45 16.95 L10.21 15.97 L10.8 13.63 L8.01 6.33 L10.67 6 L13.71 3.73 L18.02 3.55 L23.63 4.2 L29.83 6.21 L34.21 6.38 L36.3 7.59 L38.38 6.13 L39.84 8.08 L44.86 7.68 L47.07 8.49 L47.42 4.28 L49.14 2.45 L53.91 1.95 Z';

// region → [x, y] у координатах viewBox контуру
const REGION_XY: Record<string, [number, number]> = {
  'Харківська': [78.6, 19.61],
  'Донецька': [86.1, 30.06],
  'Дніпропетровська': [71.99, 32.4],
  'Запорізька': [72.54, 37.59],
  'Миколаївська': [55.04, 44.86],
  'Херсонська': [58.48, 47.62],
};

export function UkraineImpactMap({ records, metric = 'patients' }:
  { records: { location: string; region: string; lat: number; lng: number;
    patients: number; consultations: number; meds: number }[]; metric?: 'patients'|'consultations'|'meds' }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-surface-soft" style={{ aspectRatio: '100 / 67' }}>
      <svg viewBox="-4 -3 108 73" className="h-full w-full">
        <path d={UA_PATH} fill="#EBEBEB" stroke="#D0D0D0" strokeWidth="0.4"
              strokeLinejoin="round" />
        {records.map((r, i) => {
          const xy = REGION_XY[r.region];
          if (!xy) return null;
          const [x, y] = xy;
          const leftLabel = x > 66; // східні локації — підпис ліворуч, щоб не виходив за край
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 2.6 L-2.6 0.2 A1.8 1.8 0 0 1 0 -2 A1.8 1.8 0 0 1 2.6 0.2 Z"
                    fill="#FF6900" stroke="#fff" strokeWidth="0.4" />
              <text x={leftLabel ? -3.4 : 3.4} y="1.1" fontSize="3.2"
                    fill="#0A0A0A" fontWeight="700"
                    textAnchor={leftLabel ? 'end' : 'start'}>
                {r[metric].toLocaleString('uk-UA')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
