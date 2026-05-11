import { useState, useMemo, useCallback } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type Modifier } from '@dnd-kit/core';
import type { TimeSlot } from '../../types/schedule';
import { useSchedule } from '../../state/ScheduleContext';
import { TOTAL_SLOTS } from '../../utils/time';
import { detectConflicts } from '../../utils/conflicts';
import { createSnapToGridModifier } from '../../utils/snapModifier';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';
import { SlotEditor } from './SlotEditor';
import { SlotContent } from './SlotContent';

interface Props {
  rowHeight: number;
}

const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export function TimeGridView({ rowHeight }: Props) {
  const { state, dispatch } = useSchedule();
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<TimeSlot | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const snapModifier = useMemo(() => createSnapToGridModifier(rowHeight), [rowHeight]);

  const conflicts = useMemo(() => detectConflicts(state.slots), [state.slots]);
  const conflictSlotIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conflicts) { ids.add(c.slotA); ids.add(c.slotB); }
    return ids;
  }, [conflicts]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const slot = event.active.data.current?.slot as TimeSlot | undefined;
    setDraggingSlot(slot ?? null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDraggingSlot(null);
    const { active, delta } = event;
    if (!active.data.current) return;

    const slot = active.data.current.slot as TimeSlot;
    const deltaSlots = Math.round(delta.y / rowHeight);
    const newStartSlot = slot.startSlot + deltaSlots;

    if (newStartSlot < 0 || newStartSlot + slot.durationSlots > TOTAL_SLOTS) return;

    dispatch({
      type: 'MOVE_SLOT',
      slotId: slot.id,
      toVenueId: slot.venueId,
      toStartSlot: newStartSlot,
    });
  }, [rowHeight, dispatch]);

  return (
    <>
      <DndContext
        sensors={sensors}
        modifiers={[snapModifier, restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="time-grid">
          <TimeColumn rowHeight={rowHeight} />
          {state.days.map((day) => (
            <DayColumn
              key={day.id}
              dayId={day.id}
              dayLabel={`${day.label} · ${day.date}`}
              slots={state.slots.filter(s => s.dayId === day.id)}
              rowHeight={rowHeight}
              conflictSlotIds={conflictSlotIds}
              onSlotClick={setEditingSlot}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {draggingSlot && (
            <div style={{ width: 200, height: draggingSlot.durationSlots * rowHeight, opacity: 0.85 }}>
              <SlotContent slot={draggingSlot} hasConflict={false} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {conflicts.length > 0 && (
        <div className="conflict-banner">
          {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} — same speaker in overlapping slots
        </div>
      )}

      {editingSlot && (
        <SlotEditor slot={editingSlot} onClose={() => setEditingSlot(null)} />
      )}
    </>
  );
}
