// @flow
import _ from "lodash";
import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
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
  generateDOM() {
    return this.state.layout.map(l => {
      if (l.i === "10" || l.i === "11") {
        return (
          <div key={l.i} id={l.i}>
            <NestedGridLayoutItem
              id="nested"
              containerWidth={this.state.containerWidth}
              width={418}
              layout={[{ i: "0", x: 0, y: 1, w: 5, h: 5 }]}
            >
              <div key="0" id="0">
                <span className="text">0</span>
              </div>
            </NestedGridLayoutItem>
          </div>
        );
      }
      return (
        <div key={l.i} id={l.i}>
          <span className="text">{l.i}</span>
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
      <NestedGridLayoutItem
        id="main"
        {...this.props}
        margin={[0, 0]}
        layout={this.state.layout}
        onLayoutChange={this.onLayoutChange}
      >
        {this.generateDOM()}
      </NestedGridLayoutItem>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(NestedGridLayouts));
}
