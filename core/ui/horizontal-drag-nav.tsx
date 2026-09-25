"use client";

import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";

type DragState = {
  pointerId: number;
  startX: number;
  scrollLeft: number;
  moved: boolean;
};

export function HorizontalDragNav({
  children,
  className,
  label = "Navegação rápida",
}: {
  children: ReactNode;
  className: string;
  label?: string;
}) {
  const dragRef = useRef<DragState | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const nav = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: nav.scrollLeft,
      moved: false,
    };
    nav.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) <= 4) return;

    drag.moved = true;
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const nav = event.currentTarget;
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (nav.hasPointerCapture(event.pointerId)) nav.releasePointerCapture(event.pointerId);
    dragRef.current = { ...drag, pointerId: -1 };
  };

  return (
    <nav
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragRef.current = null; }}
      onClickCapture={(event) => {
        if (!dragRef.current?.moved) {
          dragRef.current = null;
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        dragRef.current = null;
      }}
      className={`${className} cursor-grab select-none touch-pan-y active:cursor-grabbing`}
    >
      {children}
    </nav>
  );
}
