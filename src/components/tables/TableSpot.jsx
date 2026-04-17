// TableSpot.jsx
/**
 * TableSpot — visual restaurant table component.
 * Shows the table body + surrounding seat pills with status colors.
 * Seats strictly match the backend capacity field.
 */

// ── Color palette keyed by status ──────────────────────────────────────────
const PALETTE = {
  Available: {
    body:   'bg-[#2D4A3E]',
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
    body:   'bg-[#3A372A]',
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

// ── Generic seat placement: distributes seats evenly around a rectangle ────
function DynamicSeats({ capacity, palette, isCircle = false }) {
  // Distribute seats around 4 sides: top, bottom, left, right
  // For circle shape with capacity=2: just top and bottom
  if (isCircle) {
    return (
      <>
        <SeatPill palette={palette} vertical style={{ top: -12, left: '50%', transform: 'translateX(-50%)' }} />
        <SeatPill palette={palette} vertical style={{ bottom: -12, left: '50%', transform: 'translateX(-50%)' }} />
      </>
    );
  }

  const seats = [];
  const cap = Math.max(1, capacity);

  if (cap <= 4) {
    // Square: 1 seat per side
    seats.push(<SeatPill key="t" palette={palette} vertical style={{ top: -12, left: '50%', transform: 'translateX(-50%)' }} />);
    seats.push(<SeatPill key="b" palette={palette} vertical style={{ bottom: -12, left: '50%', transform: 'translateX(-50%)' }} />);
    seats.push(<SeatPill key="l" palette={palette} style={{ left: -11, top: '50%', transform: 'translateY(-50%)' }} />);
    seats.push(<SeatPill key="r" palette={palette} style={{ right: -11, top: '50%', transform: 'translateY(-50%)' }} />);
  } else {
    // Rectangle: distribute evenly on top and bottom, 1 each on sides
    const sideSeats = 2; // left + right
    const remaining = cap - sideSeats;
    const topCount = Math.ceil(remaining / 2);
    const bottomCount = Math.floor(remaining / 2);

    const gap = 22;

    // Top seats
    for (let i = 0; i < topCount; i++) {
      const offset = (i - (topCount - 1) / 2) * gap;
      seats.push(
        <SeatPill
          key={`top-${i}`}
          palette={palette}
          vertical
          style={{ top: -12, left: '50%', transform: `translateX(calc(-50% + ${offset}px))` }}
        />
      );
    }

    // Bottom seats
    for (let i = 0; i < bottomCount; i++) {
      const offset = (i - (bottomCount - 1) / 2) * gap;
      seats.push(
        <SeatPill
          key={`bot-${i}`}
          palette={palette}
          vertical
          style={{ bottom: -12, left: '50%', transform: `translateX(calc(-50% + ${offset}px))` }}
        />
      );
    }

    // Side seats
    seats.push(<SeatPill key="left" palette={palette} style={{ top: '50%', left: -11, transform: 'translateY(-50%)' }} />);
    seats.push(<SeatPill key="right" palette={palette} style={{ top: '50%', right: -11, transform: 'translateY(-50%)' }} />);
  }

  return <>{seats}</>;
}

// ── Table body dimensions per shape ────────────────────────────────────────
function getBodyClass(shape) {
  if (shape === 'rectangle') return 'w-[100px] h-[56px] rounded-[10px]';
  if (shape === 'circle')    return 'w-[56px] h-[56px] rounded-full';
  return                             'w-[64px] h-[64px] rounded-[10px]'; // square
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function TableSpot({ table, onClick, onContextMenu }) {
  const pal = PALETTE[table.status] || PALETTE.Available;
  const disabled = !table.isOrderingEnabled;
  const isCircle = table.shape === 'circle';

  // Long press logic for touch devices
  const handleTouchStart = (e) => {
    if (disabled || !onContextMenu) return;
    this.longPressTimeout = setTimeout(() => {
      onContextMenu(e);
      // Vibrate if supported
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
    }, 600); // 600ms long press
  };

  const handleTouchEnd = () => {
    if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
  };

  return (
    <div className="relative flex items-center justify-center p-5 group">

      {/* Seat layer */}
      <div className={`relative ${getBodyClass(table.shape)}`} style={{ isolation: 'isolate' }}>

        {/* Seats — capacity-accurate */}
        <div className="absolute inset-0">
          <DynamicSeats capacity={table.capacity} palette={pal} isCircle={isCircle} />
        </div>

        {/* Table body */}
        <button
          onClick={!disabled ? onClick : undefined}
          onContextMenu={!disabled ? onContextMenu : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          disabled={disabled}
          className={`
            relative z-10 w-full h-full
            flex flex-col items-center justify-center
            ${pal.body} ${pal.border}
            ${getBodyClass(table.shape)}
            transition-all duration-300 shadow-md outline-none
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

          <span className={`font-black text-base leading-none tracking-wide ${pal.text}`}>
            T{table.tableNumber}
          </span>

          {table.reservationNote && (
            <span className={`text-[8px] font-bold mt-0.5 leading-none ${pal.sub}`}>
              {table.reservationNote}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
