import type { TimeSlot, DayId } from '../../types/schedule';
import { TOTAL_SLOTS } from '../../utils/time';
import { assignCols } from '../../utils/assignCols';
import { DraggableSlot } from './DraggableSlot';

interface Props {
  dayId: DayId;
  dayLabel: string;
  slots: TimeSlot[];
  rowHeight: number;
  conflictSlotIds: Set<string>;
  onSlotClick: (slot: TimeSlot) => void;
}

export function DayColumn({ dayId: _dayId, dayLabel, slots, rowHeight, conflictSlotIds, onSlotClick }: Props) {
  const slotsWithCols = assignCols(slots);
  const totalHeight = TOTAL_SLOTS * rowHeight;

  return (
    <div className="day-column-wrapper">
      <div className="day-column-header">{dayLabel}</div>
      <div className="day-column" style={{ height: totalHeight }}>
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
          const min = (7 * 60 + i * 5) % 60;
          const cls = min === 0 ? 'grid-line-hour' : min % 15 === 0 ? 'grid-line-15' : 'grid-line-5';
          return (
            <div
              key={i}
              className={`grid-line ${cls}`}
              style={{ top: i * rowHeight }}
            />
          );
        })}

        {slotsWithCols.map(slot => (
          <DraggableSlot
            key={slot.id}
            slot={slot}
            rowHeight={rowHeight}
            top={slot.startSlot * rowHeight}
            left={slot.col / slot.totalCols * 100}
            width={1 / slot.totalCols * 100}
            hasConflict={conflictSlotIds.has(slot.id)}
            onClick={() => onSlotClick(slot)}
          />
        ))}
      </div>
    </div>
  );
}
