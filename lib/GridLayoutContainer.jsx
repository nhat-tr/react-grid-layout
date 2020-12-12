// @flow
import React, { useState, useEffect } from "react";
import ReactGridLayout from "./ReactGridLayout";
import type { Layout, GridResizeEvent } from "../lib/utils";
import { type Props as GridLayoutProps } from "./ReactGridLayoutPropTypes";
import { get } from "lodash";
import isEqual from "lodash.isequal";

export type Props = GridLayoutProps & {
  allLayouts: Layout
};

export const ContainerContext = React.createContext<any>({});

interface MovingItemData {
  i: string;
  fromGrid: string;
  toGrid: string;
}
export function GridLayoutContainer(props: Props) {
  const { children, layout, ...rest } = props;

  const [movingItem, setMovingItem] = useState(null);
  const [shouldRebuild, setShouldRebuild] = useState(null);
  const [allChildren, setAllChildren] = useState(children);
  const [allLayouts, setAllLayouts] = useState(layout);
  const [allNestedGrids, setAllNestedGrids] = useState({});

  const getLayoutItem = key => {
    for (let i = 0; i < allLayouts.length; i++) {
      const l = allLayouts[i];

      if (l.i === key) return l;
    }
    return null;
  };

  const getLayoutForGrid = gridId => {
    const layouts = [];
    for (let i = 0; i < allLayouts.length; i++) {
      const l = allLayouts[i];
      if (l.gridLayoutId === gridId) layouts.push(l);
    }
    return layouts;
  };

  const getChildrenForGrid = gridId => {
    const gridsChildren = [];
    React.Children.forEach(allChildren, child => {
      if (child.props.grid === gridId) gridsChildren.push(child);
    });
    return gridsChildren;
  };

  const onLayoutsChanged = (layout: Layout, layouts: { [string]: Layout }) => {
    const newLayouts = allLayouts.map(l => {
      const found = layout.find(l1 => l1.i === l.i);
      if (found) return found;

      return l;
    });

    if (isEqual(allLayouts, newLayouts)) return;

    props.onLayoutChange(newLayouts, layouts);
    if (!shouldRebuild) {
      console.log("set all layouts ?", newLayouts);
      setAllLayouts(newLayouts);
      setShouldRebuild(true);
    }
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
    console.log("dragStop", targetGrid);

    if (targetGrid && targetGrid !== newItem.gridLayoutId) {
      setMovingItem({
        i: newItem.i,
        fromGrid: newItem.gridLayoutId,
        toGrid: targetGrid
      });
    }
  };
  const buildGridsChildren = () => {
    const grids = {};

    // init all grids instances
    React.Children.forEach(allChildren, child => {
      const mainChild = React.Children.only(child.props.children);
      if (mainChild.type.displayName === "ReactGridLayout") {
        const gridsLayout = getLayoutForGrid(child.key);
        const gridsDoms = getChildrenForGrid(child.key);
        const layoutItem = getLayoutItem(child.key);

        console.log(child.key, ...gridsLayout);
        const newOnlyChild = React.cloneElement(mainChild, {
          layout: gridsLayout,
          children: gridsDoms,
          onLayoutChange: onLayoutsChanged,
          onDragStop: onDragStop,
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
    console.log("shouldRebuild", shouldRebuild);
    if (shouldRebuild) {
      setAllNestedGrids(buildGridsChildren());
      setShouldRebuild(false);
    }
  }, [shouldRebuild]);

  useEffect(() => {
    if (!movingItem) return;

    console.log("effect");
    const newLayouts = allLayouts.map(l => {
      if (l.i === movingItem.i) {
        return { ...l, gridLayoutId: movingItem.toGrid };
      }
      return { ...l };
    });

    const newChildren = [];
    React.Children.forEach(allChildren, child => {
      if (child.key === movingItem.i) {
        const updatedChild = React.cloneElement(child, {
          grid: movingItem.toGrid
        });
        newChildren.push(updatedChild);
      } else {
        newChildren.push(child);
      }
    });
    setAllLayouts(newLayouts);
    setAllChildren(newChildren);
    setMovingItem(null);
    console.log("here");
    setShouldRebuild(true);
  }, [movingItem]);

  return (
    <ContainerContext.Provider
      value={{
        allGrids: allNestedGrids
      }}
    >
      <div id="mainGrid">
        <ReactGridLayout
          {...rest}
          id="mainGrid"
          layout={getLayoutForGrid("mainGrid")}
          onLayoutChange={onLayoutsChanged}
        >
          {getChildrenForGrid("mainGrid")}
        </ReactGridLayout>
      </div>
    </ContainerContext.Provider>
  );
}
