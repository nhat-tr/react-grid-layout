// @flow
import React, { useState, useEffect } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import type { Layout, LayoutItem } from "../../lib/utils";
import type { PositionParams } from "../../lib/calculateUtils";
import { calcXY } from "../../lib/calculateUtils";
import type { Props as GridLayoutProps } from "../../lib/ReactGridLayoutPropTypes";
import { TargetGridItem } from "../../lib/TargetGridItem";
import { SourceGridItem } from "../../lib/SourceGridItem";
import type {
  ChildrenArray as ReactChildrenArray,
  Element as ReactElement
} from "react";

const ReactGridLayout = WidthProvider(RGL);

type Props = GridLayoutProps & {
  id: string,
  containerWidth: number,
  propsLayout: Layout
};

export function NestedGridLayoutItem({
  id,
  containerWidth,
  className = "layout",
  cols = 12,
  margin = [0, 0],
  maxRows = Infinity,
  rowHeight = 30,
  containerPadding = [0, 0],
  compactType = null,
  children,
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

  const [layout, setLayout] = useState(gridLayoutProps.layout);

  const onDropHandler = (item, offset) => {
    const posParams = {
      ...positionParams,
      containerWidth: offset.containerWidth
    };
    const pos = calcXY(posParams, offset.y, offset.x, item.w, item.h);
    const updated: Layout = layout.map(l =>
      l.i === item.id ? { ...l, x: pos.x, y: pos.y } : l
    );
    setLayout(updated);
    console.log("drop handler", id, item, offset);
  };
  const onMouseEnter = i => e => {
    const updated: Layout = layout.map(l =>
      l.i === i ? { ...l, isDraggable: false } : l
    );
    setLayout(updated);
  };
  const onMouseLeave = i => e => {
    const updated: Layout = layout.map(l =>
      l.i === i ? { ...l, isDraggable: true } : l
    );
    setLayout(updated);
  };
  const onLayoutChangeHandler = (newLayout, width) => {
    setLayout(newLayout);
  };

  const processGridItem = (child: ReactElement<any>) => {
    const item = layout.find(l => l.i === child.props.id);
    if (!item) return;

    return (
      <div key={child.props.id}>
        <SourceGridItem
          id={child.props.id}
          type="item"
          containerId={id}
          onMouseEnter={onMouseEnter(child.props.id)}
          onMouseLeave={onMouseLeave(child.props.id)}
          w={item.w}
          h={item.h}
        >
          {child.props.children}
        </SourceGridItem>
      </div>
    );
  };

  return (
    <TargetGridItem id={id} onDrop={onDropHandler}>
      <ReactGridLayout
        {...gridLayoutProps}
        className={className}
        compactType={compactType}
        cols={cols}
        margin={margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        containerPadding={containerPadding}
        onLayoutChange={onLayoutChangeHandler}
        style={{ height: "100%" }}
        layout={layout}
      >
        {React.Children.toArray(children).map(child => processGridItem(child))}
      </ReactGridLayout>
    </TargetGridItem>
  );
}
