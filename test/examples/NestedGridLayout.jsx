// @flow
import React, { useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import type { Layout } from "../../lib/utils";
import type { PositionParams } from "../../lib/calculateUtils";
import { calcXY } from "../../lib/calculateUtils";
import type { Props as GridLayoutProps } from "../../lib/ReactGridLayoutPropTypes";
import { SourceGridItem } from "../../lib/SourceGridItem";
import { TargetGridItem } from "../../lib/TargetGridItem";

const ReactGridLayout = WidthProvider(RGL);

type Props = GridLayoutProps & {
  id: string,
  containerWidth: number,
  propsLayout: Layout
};

export function NestedGridLayoutItem({
  id,
  containerWidth,
  propsLayout,
  className = "layout",
  cols = 12,
  margin = [0, 0],
  maxRows = Infinity,
  rowHeight = 30,
  containerPadding = [0, 0],
  compactType = null,
  ...gridLayoutProps
}: Props) {
  const positionParams: PositionParams = {
    cols,
    margin,
    maxRows,
    rowHeight,
    containerWidth,
    containerPadding
  };

  const [layout, setLayout] = useState(propsLayout);

  const onDropHandler = (item, offset) => {
    const posParams = {
      ...positionParams,
      containerWidth: offset.containerWidth
    };
    const calculatedPosition = calcXY(
      posParams,
      offset.y,
      offset.x,
      item.w,
      item.h
    );
    setLayout(
      layout.map(l => (l.i === item.id ? { ...l, ...calculatedPosition } : l))
    );
  };
  const onLayoutChangeHandler = (newLayout, width) => {
    setLayout(newLayout);
  };

  const onMouseOverHandler = i => e => {
    setLayout(layout.map(l => (l.i == i ? { ...l, isDraggable: false } : l)));
  };
  const onMouseOutHandler = i => e => {
    setLayout(layout.map(l => (l.i == i ? { ...l, isDraggable: true } : l)));
  };

  const generateDOM = () => {
    return layout.map(l => {
      return (
        <div key={l.i}>
          <SourceGridItem
            id={l.i}
            type="item"
            containerId="nested"
            onMouseOverHandler={onMouseOverHandler(l.i)}
            onMouseOutHandler={onMouseOutHandler(l.i)}
          >
            {" "}
            <span className="text">{l.i}</span>
          </SourceGridItem>
        </div>
      );
    });
  };
  const onDragStart = (layout, l1, l2, p, e, _) => {
    e.preventDefault();
  };
  return (
    <TargetGridItem
      id={id}
      onDrop={onDropHandler}
      onMouseOver={onMouseOverHandler}
      onMouseOut={onMouseOutHandler}
    >
      <ReactGridLayout
        {...gridLayoutProps}
        className={className}
        compactType={compactType}
        cols={cols}
        margin={margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        containerPadding={containerPadding}
        onDragStart={onDragStart}
        onLayoutChange={onLayoutChangeHandler}
        style={{ height: "100%" }}
        layout={layout}
      >
        {generateDOM()}
      </ReactGridLayout>
    </TargetGridItem>
  );
}
