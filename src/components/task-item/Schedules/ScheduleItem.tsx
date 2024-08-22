import React, { useEffect, useRef, useState } from "react";
import { Bar } from "../bar/bar";
import style from "../task-list.module.css";
import { TaskItemProps } from "../task-item";

export const ScheduleItem: React.FC<TaskItemProps> = props => {
  const {
    task,
    arrowIndent,
    isDelete,
    taskHeight,
    isSelected,
    rtl,
    onEventStart,
    ItemGanttContent,
  } = {
    ...props,
  };
  const textRef = useRef<SVGTextElement>(null);
  const [taskItem, setTaskItem] = useState<JSX.Element>(<div />);
  const [isTextInside, setIsTextInside] = useState(true);

  useEffect(() => {
    setTaskItem(<Bar {...props} />);
  }, [task, isSelected]);

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;
    if (isTextInside) {
      return task.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        task.x1 -
        textRef.current.getBBox().width -
        arrowIndent * +hasChild -
        arrowIndent * 0.2
      );
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };
  // console.log("TaskItem",ItemGanttContent);
  return (
    <g
      onKeyDown={e => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) onEventStart("delete", task, e);
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        onEventStart("mouseenter", task, e);
      }}
      onMouseLeave={e => {
        onEventStart("mouseleave", task, e);
      }}
      onDoubleClick={e => {
        onEventStart("dblclick", task, e);
      }}
      onClick={e => {
        onEventStart("click", task, e);
      }}
      onFocus={() => {
        onEventStart("select", task);
      }}
    >
      {taskItem}
      {
        !!ItemGanttContent ?
          <foreignObject x={task.x1 + 10}
                         y={task.y + taskHeight * 0.5}
                         height={taskHeight}
                         width={task.x2 - task.x1 - 20}
          >
            {
              <ItemGanttContent task={task} rowHeight={taskHeight}></ItemGanttContent>
            }
          </foreignObject>
          :
          <text
            x={getX()}
            y={task.y + taskHeight * 0.5}
            className={
              // isTextInside
              //   ?
                style.barLabel
                // : style.barLabel && style.barLabelOutside
            }
            ref={textRef}
          >
            {task.name}
          </text>
      }
    </g>
  );
};
