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
            margin={[0,0]}
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

  onLayoutChange = (layout: Layout) => {
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
       <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onCompactTypeChange}>
          Change Compaction Type
        </button>
     <h1>second</h1>
         <GridLayoutContainer
          {...this.props}
      key="second"
          layout={this.state.layouts?.lg || []}
          cols={30}
          margin={[0,0]}
          width={window.innerWidth-10}
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
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
  return _.map(_.range(0, 10), function(i, index) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      gridLayoutId: i < 4 || i == 9 ? "mainGrid" :( i  ===  6  || i === 8 ? '9' : '8'),
      isGridLayout: i === 8 || i === 9,
      isDraggable: true
    };
  });
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ShowcaseLayout));
}
