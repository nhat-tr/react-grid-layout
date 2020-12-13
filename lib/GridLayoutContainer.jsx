// @flow import isEqual from "lodash.isequal";
import React, { useEffect, useState } from "react";
import type { Layout, LayoutItem } from "../lib/utils";
import ReactGridLayout from "./ReactGridLayout";
import { Props as GridLayoutProps } from "./ReactGridLayoutPropTypes";
import isEqual from "lodash.isequal";

export type Props = GridLayoutProps;

export const ContainerContext = React.createContext<any>({});

export function GridLayoutContainer(props: Props) {
  const [movingItem, setMovingItem] = useState(null);
  const [tempLayout, setTempLayout] = useState(props.layout);
  const [changedItem, setChangedItem] = useState(null);
  const [allChildren, setAllChildren] = useState(props.children);
  const [allLayouts, setAllLayouts] = useState(props.layout);
  const [allNestedGrids, setAllNestedGrids] = useState({});

  const getLayoutItem = (key, newLayouts) => {
    for (let i = 0; i < newLayouts.length; i++) {
      const l = newLayouts[i];

      if (l.i === key) return l;
    }
    return null;
  };

  const getLayoutForGrid = (gridId, newLayouts: Layout) => {
    const layouts = [];
    for (let i = 0; i < newLayouts.length; i++) {
      const l = newLayouts[i];
      if (l.gridLayoutId === gridId) layouts.push(l);
    }
    return layouts;
  };

  const getChildrenForGrid = (gridId, newChildren) => {
    const gridsChildren = [];
    React.Children.forEach(newChildren, child => {
      if (child.props.grid === gridId) gridsChildren.push(child);
    });
    return gridsChildren;
  };

  const onLayoutsChanged = (layout: Layout) => {
    const newLayouts = tempLayout.map(l => {
      const found = layout.find(l1 => l1.i === l.i);
      if (found) return found;

      return l;
    });

    if (isEqual(tempLayout, newLayouts)) return;

    setTempLayout(newLayouts);
  };

  const onDragStop = (layout, oldItem, newItem, x, e, node) => {
    const targetGrid = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter(
        ele =>
          ele.classList.contains("react-grid-layout") &&
          ele.parentNode.id !== newItem.i
      )
      .map(grid => grid.parentNode.id)[0];

    if (targetGrid && targetGrid !== newItem.gridLayoutId) {
      setMovingItem({
        i: newItem.i,
        fromGrid: newItem.gridLayoutId,
        toGrid: targetGrid
      });
      setChangedItem({ ...newItem, gridLayoutId: targetGrid });
    } else {
      setChangedItem({ ...newItem });
    }
  };

  const onResizeStop = (layout, oldItem, newItem, x, e, node) => {
    setChangedItem({ ...newItem });
  };

  const buildGridsChildren = (newLayouts, newChildren) => {
    const grids = { ...allNestedGrids };

    React.Children.forEach(newChildren, child => {
      const mainChild = React.Children.only(child.props.children);
      if (
        (!changedItem ||
          child.key === changedItem.i ||
          child.key === changedItem.gridLayoutId) &&
        mainChild.type.displayName === "ReactGridLayout"
      ) {
        const gridsLayout = getLayoutForGrid(child.key, newLayouts);
        const gridsDoms = getChildrenForGrid(child.key, newChildren);
        const layoutItem = getLayoutItem(child.key, newLayouts);

        const newOnlyChild = React.cloneElement(mainChild, {
          style: { ...mainChild.props.style, height: "100%" },
          key: `grid-${child.key}`,
          isBounded: true,
          layout: gridsLayout,
          children: gridsDoms,
          onDragStop: onDragStop,
          onResizeStop: onResizeStop,
          width: layoutItem?.width || mainChild.props.width
        });

        grids[child.key] = React.cloneElement(child, {
          children: newOnlyChild
        });
      }
    });
    return grids;
  };

  useEffect(() => {
    let newLayouts = [];
    const newChildren = [];
    newLayouts = tempLayout.map(l => {
      if (l.i === movingItem?.i)
        return { ...l, gridLayoutId: movingItem.toGrid };

      return l;
    });

    React.Children.forEach(allChildren, child => {
      if (child.key === movingItem?.i) {
        newChildren.push(
          React.cloneElement(child, {
            grid: movingItem.toGrid
          })
        );
      } else {
        newChildren.push(child);
      }
    });

    setMovingItem(null);
    setAllLayouts(newLayouts);
    setAllChildren(newChildren);
    setAllNestedGrids(buildGridsChildren(newLayouts, newChildren));
    setChangedItem(null);
    props.onLayoutChange(newLayouts);
  }, [tempLayout]);

  return (
    <ContainerContext.Provider
      value={{
        allGrids: allNestedGrids,
        onContextLayoutChanged: onLayoutsChanged
      }}
    >
      <div id="mainGrid">
        <ReactGridLayout
          {...props}
          id="mainGrid"
          layout={getLayoutForGrid("mainGrid", allLayouts)}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          {getChildrenForGrid("mainGrid", allChildren)}
        </ReactGridLayout>
      </div>
    </ContainerContext.Provider>
  );
}
