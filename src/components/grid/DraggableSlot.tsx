import { useDraggable } from '@dnd-kit/core';
import type { TimeSlot } from '../../types/schedule';
import { SlotContent } from './SlotContent';
import { ResizeHandle } from './ResizeHandle';

interface Props {
  slot: TimeSlot;
  rowHeight: number;
  top: number;
  left: number;   // percentage 0–100
  width: number;  // percentage 0–100
  hasConflict: boolean;
  onClick: () => void;
}

export function DraggableSlot({ slot, rowHeight, top, left, width, hasConflict, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: slot.id,
    data: { slot },
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    top,
    left: `${left}%`,
    width: `${width}%`,
    height: slot.durationSlots * rowHeight,
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <SlotContent slot={slot} hasConflict={hasConflict} />
      <ResizeHandle slotId={slot.id} currentDuration={slot.durationSlots} rowHeight={rowHeight} />
    </div>
  );
}
