import React from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";

export function SourceGridItem({
  key,
  id,
  type,
  containerId,
  children,
  onMouseEnter,
  onMouseLeave,
  w,
  h
}) {
  const [{ opacity }, drag, preview] = useDrag({
    item: { id, type, containerId, w, h },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1
    })
  });
  const handleStyle = {
    backgroundColor: "green",
    width: "1rem",
    height: "1rem",
    display: "inline-block",
    marginRight: "0.75rem",
    cursor: "move"
  };
  return (
    <div ref={preview} style={{ opacity }}>
      <div
        ref={drag}
        style={handleStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {children}
    </div>
  );
}
