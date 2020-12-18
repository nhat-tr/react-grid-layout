//@flow
import React, { useRef } from "react";
import type {
  ChildrenArray as ReactChildrenArray,
  Element as ReactElement
} from "react";
import { useDrop } from "react-dnd";

type Props = {
  children: ReactChildrenArray<ReactElement<any>>,
  onDrop: (item: any, offset: any) => void
};

export function TargetGridItem(props: Props) {
  const divRef = useRef(null);
  const [_, drop] = useDrop({
    accept: ["item"],
    drop: (item, monitor) => {
      const currentRef = divRef.current;
      const offset = monitor.getSourceClientOffset();
      if (props.onDrop && currentRef && offset) {
        console.log("target", props.id);
        const { top, left } = currentRef.getBoundingClientRect();
        const { x, y } = offset;
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
    <div ref={drop}>
      <div ref={divRef}>{props.children}</div>
    </div>
  );
}
