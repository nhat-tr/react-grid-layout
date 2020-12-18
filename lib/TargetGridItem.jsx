//@flow
import React, { useRef } from "react";
import type {
  ChildrenArray as ReactChildrenArray,
  Element as ReactElement
} from "react";
import { useDrop } from "react-dnd";

type Props = {
  children: ReactChildrenArray<ReactElement<any>>,
  onMouseOver: (i: string) => (event: MouseEvent) => void,
  onMouseOut: (i: string) => (event: MouseEvent) => void,
  onDrop: (item: any, offset: any) => void
};

export function TargetGridItem(props: Props) {
  const divRef = useRef(null);
  const [_, drop] = useDrop({
    accept: ["item"],
    drop: (item, monitor) => {
      const currentRef = divRef.current;
      if (props.onDrop && currentRef) {
        const { top, left } = currentRef.getBoundingClientRect();
        const { x, y } = monitor.getSourceClientOffset();
        props.onDrop(item, {
          x: x - left,
          y: y - top,
          containerWidth: currentRef.clientWidth
        });
      }
      return undefined;
    },
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        droppingItem: monitor.getItem(),
        offset: monitor.getClientOffset()
      };
    }
  });
  return (
    <div
      ref={drop}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
    >
      <div ref={divRef}>{props.children}</div>
    </div>
  );
}
