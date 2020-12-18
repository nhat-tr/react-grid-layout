import React from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";

export function SourceGridItem({
  key,
  id,
  type,
  containerId,
  children,
  onMouseOverHandler,
  onMouseOutHandler
}) {
  const [{ opacity }, drag, preview] = useDrag({
    item: { id, type: "item", containerId },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1
    })
  });
  const style = {
    // border: "1px dashed gray",
    // padding: "0.5rem 1rem",
    // marginBottom: ".5rem",
    // backgroundColor: "white"
  };
  const handleStyle = {
    backgroundColor: "green",
    width: "1rem",
    height: "1rem",
    display: "inline-block",
    marginRight: "0.75rem",
    cursor: "move"
  };
  return (
    <div ref={preview} style={{ ...style, opacity }}>
      <div
        ref={drag}
        style={handleStyle}
        onMouseOver={onMouseOverHandler}
        onMouseOut={onMouseOutHandler}
      />
      {children}
    </div>
  );
}
