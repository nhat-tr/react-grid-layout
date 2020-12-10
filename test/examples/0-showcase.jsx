// @flow
import React from "react";
import _ from "lodash";
import Responsive from '../../lib/ResponsiveReactGridLayout';
import WidthProvider from '../../lib/components/WidthProvider';
import type {CompactType, Layout} from '../../lib/utils';
import { GridLayoutContainer } from "../../lib/GridLayoutContainer";
import ReactGridLayout from "../../lib/ReactGridLayout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

type Props = {|
  className: string,
  cols: {[string]: number},
  onLayoutChange: Function,
  rowHeight: number,
|};
type State = {|
  currentBreakpoint: string,
  compactType: CompactType,
  mounted: boolean,
  layouts: {[string]: Layout},
|};

export default class ShowcaseLayout extends React.Component<Props, State> {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  };

  state = {
    currentBreakpoint: "lg",
    compactType: null,
    mounted: false,
    layouts: { lg: generateLayout() },
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM() {
    return _.map(this.state.layouts?.lg, (l, i) => {
      return (
        <div id={i} key={i+""} grid={l.gridLayoutId}>
          {l.isGridLayout ? (
            <ReactGridLayout
            id={i+""}
            {...this.props}
            cols={30}
            width={200}
            onBreakpointChange={this.onBreakpointChange}
            measureBeforeMount={false}
            useCSSTransforms={this.state.mounted}
            compactType={this.state.compactType}
            preventCollision={!this.state.compactType}
          />
          ) : (
          <span className="text">{i}-{l.gridLayoutId}</span>
          )}
        </div>
      );
    });
  }

  onActivateDrag = (i) => () =>{
    const newLayouts = this.state.layouts.lg.map(l => ({...l, isDraggable: l.i === i ? true : l.isDraggable}));
    this.setState({ layouts: {lg: newLayouts }});
  }

  onDeactivateDrag = (i) => () =>{
    const newLayouts = this.state.layouts.lg.map(l => ({...l, isDraggable: l.i === i ? false : l.isDraggable}));
    this.setState({ layouts: {lg: newLayouts }});
  }

  onBreakpointChange = (breakpoint: string) => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    this.setState({ compactType });
  };

  onLayoutChange = (layout: Layout, layouts: {[string]: Layout}) => {
    this.setState({layouts: {lg: layout}});
    this.props.onLayoutChange(layout, {lg: layout});
  };

  onNewLayout = () => {
    this.setState({
      layouts: { lg: generateLayout() }
    });
  };

  onDrop = (elemParams: Object) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} (
          {this.props.cols[this.state.currentBreakpoint]} columns)
        </div>
        <div>
          Compaction type:{" "}
          {_.capitalize(this.state.compactType) || "No Compaction"}
        </div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onCompactTypeChange}>
          Change Compaction Type
        </button>
        <GridLayoutContainer
          {...this.props}
          layout={this.state.layouts?.lg || []}
          cols={30}
          width={window.innerWidth-10}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          onDrop={this.onDrop}
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
        >
          {this.generateDOM()}
        </GridLayoutContainer>
      </div>
    );
  }
}

function generateLayout() {
  return _.map(_.range(0, 10), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      gridLayoutId: i < 6 || i=== 8 ? "mainGrid" : '8',
      isGridLayout: i === 8,
      isDraggable: true
    };
  });
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ShowcaseLayout));
}
