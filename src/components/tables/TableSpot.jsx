/**
 * TableSpot — visual restaurant table component matching the screenshot.
 * Shows the table body + surrounding seat pills with status colors.
 * Fully self-contained; receives a table object + click handler.
 */

// ── Color palette keyed by status ──────────────────────────────────────────
const PALETTE = {
  Available: {
    body:   'bg-[#2D4A3E]',          // dark teal
    border: 'border-transparent',
    text:   'text-white',
    seat:   'bg-emerald-400',
    dot:    'bg-emerald-400',
    sub:    'text-emerald-200/70',
  },
  Occupied: {
    body:   'bg-[#2D4A3E]',
    border: 'border-rose-500 border-[3px]',
    text:   'text-white',
    seat:   'bg-rose-400',
    dot:    'bg-rose-400',
    sub:    'text-rose-200/70',
  },
  Reserved: {
    body:   'bg-[#3A372A]',          // muted dark for reserved
    border: 'border-amber-400 border-[3px] border-dashed',
    text:   'text-amber-100',
    seat:   'bg-amber-400',
    dot:    'bg-amber-400',
    sub:    'text-amber-200/80',
  },
  Maintenance: {
    body:   'bg-slate-500',
    border: 'border-transparent',
    text:   'text-slate-200',
    seat:   'bg-slate-400 opacity-50',
    dot:    'bg-slate-400',
    sub:    'text-slate-300/60',
  },
};

// ── Seat pill component ─────────────────────────────────────────────────────
function SeatPill({ palette, vertical = false, style = {} }) {
  return (
    <div
      className={`absolute ${palette.seat} shadow-sm transition-all duration-300 ${
        vertical ? 'w-4 h-3 rounded-full' : 'w-3 h-4 rounded-full'
      }`}
      style={style}
    />
  );
}

// ── Seat layouts per shape ──────────────────────────────────────────────────
function RectangleSeats({ capacity, palette }) {
  const topSeats    = Math.floor(capacity / 2);
  const bottomSeats = Math.floor(capacity / 2);
  const gap         = 24; // px between seats

  const makeRow = (count, side) =>
    Array.from({ length: count }, (_, i) => {
      const offset = (i - (count - 1) / 2) * gap;
      return (
        <SeatPill
          key={`${side}-${i}`}
          palette={palette}
          vertical
          style={{
            [side === 'top' ? 'top' : 'bottom']: -12,
            left: '50%',
            transform: `translateX(calc(-50% + ${offset}px))`,
          }}
        />
      );
    });

  return (
    <>
      {makeRow(topSeats, 'top')}
      {makeRow(bottomSeats, 'bottom')}
      {/* end caps */}
      <SeatPill palette={palette} style={{ top: '50%', left: -11, transform: 'translateY(-50%)' }} />
      <SeatPill palette={palette} style={{ top: '50%', right: -11, transform: 'translateY(-50%)' }} />
    </>
  );
}

function SquareSeats({ palette }) {
  return (
    <>
      <SeatPill palette={palette} vertical style={{ top: -12, left: '50%', transform: 'translateX(-50%)' }} />
      <SeatPill palette={palette} vertical style={{ bottom: -12, left: '50%', transform: 'translateX(-50%)' }} />
      <SeatPill palette={palette} style={{ left: -11, top: '50%', transform: 'translateY(-50%)' }} />
      <SeatPill palette={palette} style={{ right: -11, top: '50%', transform: 'translateY(-50%)' }} />
    </>
  );
}

function CircleSeats({ palette }) {
  return (
    <>
      <SeatPill palette={palette} vertical style={{ top: -12, left: '50%', transform: 'translateX(-50%)' }} />
      <SeatPill palette={palette} vertical style={{ bottom: -12, left: '50%', transform: 'translateX(-50%)' }} />
      <SeatPill palette={palette} style={{ left: -11, top: '50%', transform: 'translateY(-50%)' }} />
      <SeatPill palette={palette} style={{ right: -11, top: '50%', transform: 'translateY(-50%)' }} />
    </>
  );
}

// ── Table body dimensions per shape ────────────────────────────────────────
function getBodyClass(shape) {
  if (shape === 'rectangle') return 'w-[96px] h-[58px] rounded-[10px]';
  if (shape === 'circle')    return 'w-[58px] h-[58px] rounded-full';
  return                             'w-[70px] h-[70px] rounded-[10px]'; // square
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function TableSpot({ table, onClick }) {
  const pal    = PALETTE[table.status] || PALETTE.Available;
  const disabled = !table.isOrderingEnabled;

  return (
    // Outer wrapper: gives generous padding so seats don't clip
    <div className="relative flex items-center justify-center p-7 group">

      {/* Seat layer (sits behind table body) */}
      <div className={`relative ${getBodyClass(table.shape)}`} style={{ isolation: 'isolate' }}>

        {/* Seats */}
        <div className="absolute inset-0">
          {table.shape === 'rectangle' && <RectangleSeats capacity={table.capacity} palette={pal} />}
          {table.shape === 'square'    && <SquareSeats    palette={pal} />}
          {table.shape === 'circle'    && <CircleSeats    palette={pal} />}
        </div>

        {/* Table body */}
        <button
          onClick={!disabled ? onClick : undefined}
          disabled={disabled}
          className={`
            relative z-10 w-full h-full
            flex flex-col items-center justify-center
            ${pal.body} ${pal.border}
            ${getBodyClass(table.shape)}
            transition-all duration-300 shadow-md
            ${disabled
              ? 'opacity-50 grayscale cursor-not-allowed'
              : 'cursor-pointer hover:brightness-110 hover:scale-105 hover:shadow-xl active:scale-95'
            }
          `}
        >
          {/* Active orders badge */}
          {table.activeOrdersCount > 0 && (
            <div className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow">
              {table.activeOrdersCount}
            </div>
          )}

          <span className={`font-black text-lg leading-none tracking-wide ${pal.text}`}>
            {table.tableNumber}
          </span>

          {table.reservationNote && (
            <span className={`text-[9px] font-bold mt-0.5 leading-none ${pal.sub}`}>
              {table.reservationNote}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
