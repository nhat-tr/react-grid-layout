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

export function GridLayoutContainer(props: Props) {
  const { children, layout, ...rest } = props;

  const [allGrids, setAllGrids] = useState({});
  const [allChildren, setAllChildren] = useState(children);
  const [allLayouts, setAllLayouts] = useState(layout);
  const [mainGridLayouts, setMainGridLayouts] = useState([]);
  const [mainGridChildren, setMainGridChildren] = useState([]);

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

  const getChild = id => {
    let foundChild = null;
    React.Children.forEach(allChildren, child => {
      if (child.key === id) foundChild = child;
    });
    return foundChild;
  };

  const onLayoutsChanged = (layout: Layout, layouts: { [string]: Layout }) => {
    const current = [...allLayouts];
    const newLayouts = current.map(l => {
      const found = layout.find(l1 => l1.i === l.i);
      if (found) return found;
      return l;
    });
    if (!isEqual(allLayouts, newLayouts)) {
      console.log("newLayouts", ...newLayouts);
      setAllLayouts(newLayouts);
      props.onLayoutChange(newLayouts);
    }
  };

  useEffect(() => {
    setMainGridLayouts(getLayoutForGrid("mainGrid"));
    setMainGridChildren(getChildrenForGrid("mainGrid"));
  }, [allLayouts]);

  useEffect(() => {
    console.log("effect2");
    const grids = {};

    // init all grids instances
    React.Children.forEach(allChildren, child => {
      const mainChild = React.Children.only(child.props.children);
      if (mainChild.type.displayName === "ReactGridLayout") {
        const gridsLayout = getLayoutForGrid(child.key);
        const gridsDoms = getChildrenForGrid(child.key);
        const layoutItem = getLayoutItem(child.key);

        const newOnlyChild = React.cloneElement(mainChild, {
          layout: gridsLayout,
          children: gridsDoms,
          onLayoutChange: onLayoutsChanged,
          width: layoutItem?.width || mainChild.props.width
        });

        grids[child.key] = React.cloneElement(child, {
          children: newOnlyChild
        });
      }
    });

    setAllGrids(grids);
  }, [allLayouts]);

  const onMoveItemBetweenGrids = (i: string, fromG: string, toG: string) => {
    console.log("move", i, "from", fromG, "to", toG);
    const newLayouts = allLayouts.map(l => {
      if (l.i === i) return { ...l, gridLayoutId: toG };
      return { ...l };
    });
    const newChildren = [];
    React.Children.forEach(allChildren, child => {
      if (child.key === i) {
        console.log("clone", child);
        newChildren.push(React.cloneElement(child, { grid: toG }));
      } else {
        newChildren.push(child);
      }
    });
    setAllLayouts(newLayouts);
    setAllChildren(newChildren);
  };

  return (
    <ContainerContext.Provider value={{ allGrids, onMoveItemBetweenGrids }}>
      <ReactGridLayout
        {...rest}
        id="mainGrid"
        layout={mainGridLayouts}
        onLayoutChange={onLayoutsChanged}
      >
        {mainGridChildren}
      </ReactGridLayout>
    </ContainerContext.Provider>
  );
}
