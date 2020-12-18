// @flow
import _ from "lodash";
import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { SourceGridItem } from "../../lib/SourceGridItem";
import { TargetGridItem } from "../../lib/TargetGridItem";
import { NestedGridLayoutItem } from "./NestedGridLayout";

const ReactGridLayout = WidthProvider(RGL);

export default class NestedGridLayouts extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    items: 20,
    rowHeight: 30,
    compactType: null,
    onLayoutChange: function () {},
    cols: 12
  };

  constructor(props) {
    super(props);

    const layout = this.generateLayout();
    this.state = { layout, containerWidth: null };
  }
  onMouseOverHandler = i => e => {
    this.setState({
      layout: this.state.layout.map(l =>
        l.i == i ? { ...l, isDraggable: false } : l
      )
    });
  };
  onMouseOutHandler = i => e => {
    this.setState({
      layout: this.state.layout.map(l =>
        l.i == i ? { ...l, isDraggable: true } : l
      )
    });
  };

  generateDOM() {
    return _.map(_.range(this.props.items), i => {
      if (i === 10) {
        return (
          <div key={i}>
            <NestedGridLayoutItem
              containerWidth={this.state.containerWidth}
              width={418}
            />
          </div>
        );
      }
      return (
        <div key={i}>
          <SourceGridItem
            id={i}
            type="item"
            containerId="main"
            onMouseOverHandler={this.onMouseOverHandler(i)}
            onMouseOutHandler={this.onMouseOutHandler(i)}
          >
            {" "}
            <span className="text">{i}</span>
          </SourceGridItem>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;

    return _.map(new Array(p.items), function (item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: i === 10 ? 5 : 2,
        h: i === 10 ? 5 : y,
        i: i.toString(),
        isDraggable: true
      };
    });
  }

  onLayoutChange = (layout, width) => {
    this.setState({ containerWidth: width, layout });
  };

  render() {
    return (
      <TargetGridItem id="main">
        <ReactGridLayout
          {...this.props}
          margin={[0, 0]}
          layout={this.state.layout}
          onLayoutChange={this.onLayoutChange}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </TargetGridItem>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(NestedGridLayouts));
}
