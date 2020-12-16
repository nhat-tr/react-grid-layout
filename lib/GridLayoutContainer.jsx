// @flow import isEqual from "lodash.isequal";
import React, { useEffect, useState } from "react";
import type { Layout, LayoutItem } from "../lib/utils";
import ReactGridLayout from "./ReactGridLayout";
import { Props as GridLayoutProps } from "./ReactGridLayoutPropTypes";
import isEqual from "lodash.isequal";

export type Props = GridLayoutProps;

export const ContainerContext = React.createContext<any>({});

export function GridLayoutContainer(props: Props) {
  const [changedItem, setChangedItem] = useState({ tempLayout: props.layout });
  // const [tempLayout, setTempLayout] = useState(props.layout);
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
    const newLayouts = changedItem?.tempLayout.map(l => {
      const found = layout.find(l1 => l1.i === l.i);
      if (found) return found;

      return l;
    });

    // if (isEqual(tempLayout, newLayouts)) return;

    setChangedItem({ tempLayout: newLayouts });
  };

  const onDrag = (layout, oldItem, newItem, x, e, node) => {
    if (changedItem.i) return;
    const targetGrid = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter(
        ele =>
          ele.classList.contains("react-grid-layout") &&
          ele.parentNode.id !== newItem.i
      )
      .map(grid => grid.parentNode.id)[0];

    if (targetGrid && targetGrid !== newItem.gridLayoutId) {
      setChangedItem({
        i: newItem.i,
        draggingItem: { ...newItem, i: `dragging-${newItem.i}` },
        fromGrid: newItem.gridLayoutId,
        toGrid: targetGrid,
        tempLayout: changedItem.tempLayout.map(tl =>
          tl.i === newItem.i ? { ...tl, gridLayoutId: targetGrid } : tl
        )
      });
    }
  };

  const onDragStop = (layout, oldItem, newItem, x, e, node) => {
    setChangedItem({ ...changedItem, i: undefined });
    const targetGrid = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter(
        ele =>
          ele.classList.contains("react-grid-layout") &&
          ele.parentNode.id !== newItem.i
      )
      .map(grid => grid.parentNode.id)[0];

    // if (targetGrid && targetGrid !== newItem.gridLayoutId) {
    //   setMovingItem({
    //     i: newItem.i,
    //     fromGrid: newItem.gridLayoutId,
    //     toGrid: targetGrid
    //   });
    //   setChangedItem({ ...newItem, gridLayoutId: targetGrid });
    // } else {
    //   setChangedItem({ ...newItem });
    // }
  };

  const onResizeStop = (layout, oldItem, newItem, x, e, node) => {
    // setChangedItem({ ...newItem });
  };

  const buildGridsChildren = (newLayouts, newChildren) => {
    const grids = { ...allNestedGrids };

    React.Children.forEach(newChildren, child => {
      const mainChild = React.Children.only(child.props.children);
      if (
        (!changedItem ||
          !changedItem.i ||
          child.key === changedItem.i ||
          child.key === changedItem.fromGrid ||
          child.key === changedItem.toGrid) &&
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
          onDrag: onDrag,
          onDragStop: onDragStop,
          onResizeStop: onResizeStop,
          width: layoutItem?.width || mainChild.props.width
        });

        grids[child.key] = React.cloneElement(child, {
          children: newOnlyChild
        });
        console.log(newOnlyChild);
      }
    });
    return grids;
  };

  useEffect(() => {
    if (!changedItem || !changedItem.tempLayout) return;
    const newLayouts = changedItem.tempLayout;
    if (
      changedItem.draggingItem &&
      newLayouts.findIndex(nl => nl.i === changedItem.draggingItem.i) === -1
    ) {
      newLayouts.push({
        ...changedItem.draggingItem,
        gridLayoutId: changedItem.toGrid
      });
    }

    const newChildren = [];
    React.Children.forEach(allChildren, child => {
      if (child.key === changedItem?.i) {
        newChildren.push(child);
        if (
          changedItem.draggingItem &&
          allChildren.findIndex(c => c.key === changedItem.draggingItem.i) ===
            -1
        ) {
          newChildren.push(
            React.cloneElement(child, {
              key: changedItem.draggingItem.i,
              id: changedItem.draggingItem.i,
              grid: changedItem.toGrid
            })
          );
        }
      } else {
        newChildren.push(child);
      }
    });

    setAllLayouts(newLayouts);
    setAllChildren(newChildren);
    setAllNestedGrids(buildGridsChildren(newLayouts, newChildren));
    props.onLayoutChange(newLayouts);

    console.log(
      "effect",
      changedItem,
      newLayouts,
      newChildren,
      newChildren[8],
      newChildren[9]
    );
  }, [changedItem]);

  // console.log('moving', changedItem)
  // console.log('render', Date.now(), allLayouts[5].gridLayoutId, allChildren[5].props.grid)
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
          gridLayoutId="mainGrid"
          layout={getLayoutForGrid("mainGrid", allLayouts)}
          onDrag={onDrag}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          {getChildrenForGrid("mainGrid", allChildren)}
        </ReactGridLayout>
      </div>
    </ContainerContext.Provider>
  );
}
