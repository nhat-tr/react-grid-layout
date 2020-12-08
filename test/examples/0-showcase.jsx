// @flow
import React from "react";
import _ from "lodash";
import Responsive from '../../lib/ResponsiveReactGridLayout';
import WidthProvider from '../../lib/components/WidthProvider';
import type {CompactType, Layout} from '../../lib/utils';
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
  disabledItems: {[string]: boolean}
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
    disabledItems: {}
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM() {
    const { disabledItems } = this.state;
    return _.map(this.state.layouts.lg, (l, i) => {
      const tail = l.gridLayoutId ? `${i} in grid ${l.gridLayoutId}`: i;
      return (
        <div id={i} key={i} className={l.static ? "static" : ""}>
          {l.isGridLayout ? (
            <ResponsiveReactGridLayout
            name={i+""}
            key={`g-${i}`}  
            {...this.props}

            layout={[{i: 'c', x: 4, y: 0, w: 1, h: 2, gridLayoutId: i+""},{i: 'd', x: 6, y: 2, w: 1, h: 1, gridLayoutId: i+""}]}
            onBreakpointChange={this.onBreakpointChange}
            // WidthProvider option
            measureBeforeMount={false}
            // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
            // and set `measureBeforeMount={true}`.
            useCSSTransforms={this.state.mounted}
            compactType={this.state.compactType}
            preventCollision={!this.state.compactType}
            activateDrag={this.onActivateDrag(i+"")}
            deactivateDrag={this.onDeactivateDrag(i+"")}
          >
            <div key="c"> <span className="text" >item-c-{tail}</span> </div>
            <div key="d"> <span className="text" >item-d-{tail}</span> </div>
          </ResponsiveReactGridLayout>
          ) : (
            <span className="text">{tail}</span>
          )}
        </div>
      );
    });
  }

  onActivateDrag = (i) => () =>{
    const newLayouts = this.state.layouts.lg.map(l => ({...l, isDraggable: l.i === i ? true : l.isDraggable}));
    console.log('act', i, newLayouts)
    this.setState({ layouts: {lg: newLayouts }});
  }

  onDeactivateDrag = (i) => () =>{
    const newLayouts = this.state.layouts.lg.map(l => ({...l, isDraggable: l.i === i ? false : l.isDraggable}));
    console.log('deact', i, newLayouts)
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
    this.setState({layouts});
    this.props.onLayoutChange(layout, layouts);
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
        <ResponsiveReactGridLayout
          key="mainn"
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          onDrop={this.onDrop}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
        >
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
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
      isGridLayout: Math.random() < 0.2,
      isDraggable: true
    };
  });
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ShowcaseLayout));
}
