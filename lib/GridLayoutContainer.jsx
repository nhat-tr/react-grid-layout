// @flow
import React, { useState, useEffect } from "react";
import ReactGridLayout from "./ReactGridLayout";
import type { Layout } from "../lib/utils";
import { type Props as GridLayoutProps } from "./ReactGridLayoutPropTypes";

export type Props = GridLayoutProps & {
  allLayouts: Layout,

  onMoveItemBetweenGrids?: (i: string, fromG: string, toG: string) => void
};

export const ContainerContext = React.createContext<any>({});

export function GridLayoutContainer(props: Props) {
  const { children, layout, ...rest } = props;

  const [allGrids, setAllGrids] = useState({});
  const [allChildren, setAllChildren] = useState([]);
  const [allLayouts, setAllLayouts] = useState([]);
  const [mainGridLayouts, setMainGridLayouts] = useState([]);

  const getLayoutForGrid = gridId => {
    const layouts = [];
    for (let i = 0; i < allLayouts.length; i++) {
      const l = layout[i];
      if (l.gridLayoutId === gridId) layouts.push(l);
    }

    return layouts;
  };

  const getChildrenForGrid = gridId => {
    const grids = [];
    React.Children.forEach(children, child => {
      if (child.props.grid == gridId) grids.push(child);
    });
    return grids;
  };

  useEffect(() => {
    const grids = {};

    // init all grids instances
    React.Children.forEach(allChildren, child => {
      const mainChild = React.Children.only(child.props.children);
      if (mainChild.displayName === "ReactGridLayout") {
        const gridsLayout = getLayoutForGrid(child.key);
        const gridsDoms = getChildrenForGrid(child.key);

        const newOnlyChild = React.cloneElement(mainChild, {
          layout: gridsLayout,
          children: [...mainChild.props.children, ...gridsDoms]
        });

        grids[child.key] = React.cloneElement(child, {
          children: newOnlyChild
        });
      }
    });

    setAllGrids(grids);
  }, []);

  useEffect(() => {
    setAllChildren(children);
    setAllLayouts(layout);
    setMainGridLayouts(layout.filter(l => l.gridLayoutId === "mainGrid"));
  }, []);

  return (
    <ContainerContext.Provider value={allGrids}>
      <ReactGridLayout {...rest} id="mainGrid" layout={mainGridLayouts}>
        {allGrids["mainGrid"]}
      </ReactGridLayout>
    </ContainerContext.Provider>
  );
}

export function Test() {
  return (
    <GridLayoutContainer
      className="layout"
      rowHeight={30}
      cols={30}
      autoSize={true}
      onLayoutChange={function () {}}
      allLayouts={[]}
      compactType={null}
    >
      <div key="a" grid="mainGrid">
        <span className="test">a</span>
      </div>
      <div key="b" grid="mainGrid">
        <span className="test">b</span>
      </div>
      <div key="grid-1" grid="mainGrid">
        <ReactGridLayout
          id="grid-1"
          className="layout"
          rowHeight={15}
          cols={30}
          width={300}
        />
      </div>
      <div key="c" grid="grid-1">
        <span className="test">c</span>
      </div>
      <div key="d" grid="grid-2">
        <span className="test">d</span>
      </div>
    </GridLayoutContainer>
  );
}
