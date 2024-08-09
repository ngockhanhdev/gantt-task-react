import React, { useRef, useEffect } from "react";
import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import styles from "./gantt.module.css";
import { Task } from "../../types/public-types";

export type TaskGanttProps = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
  scrollY: number;
  scrollX: number;
  ItemGanttContent?: React.FC<{
    rowHeight?: number;
    rowWidth?: string;
    fontFamily?: string;
    fontSize?: string;
    task: Task;
  }>;
};
export const TaskGantt: React.FC<TaskGanttProps> = ({
                                                      gridProps,
                                                      calendarProps,
                                                      barProps,
                                                      ganttHeight,
                                                      scrollY,
                                                      scrollX,
                                                      ItemGanttContent,
                                                    }) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);
  const newBarProps = { ...barProps, svg: ganttSVGRef };

  useEffect(() => {
    if (horizontalContainerRef.current) {
      // console.log("scrollY", scrollY);
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);

  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? { height: ganttHeight, width: gridProps.svgWidth }
            : { width: gridProps.svgWidth }
        }
      >
        <div style={{
          height: gridProps?.ganttFullHeight,
        }}>
          <div
            style={{
              marginTop: barProps?.offsetY || 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={gridProps.svgWidth}
              height={ganttHeight + barProps.rowHeight}
              // height={barProps.rowHeight * barProps.tasks.length}
              fontFamily={barProps.fontFamily}
              ref={ganttSVGRef}
            >
              <Grid {...gridProps} />
              <TaskGanttContent
                {...newBarProps}
                ItemGanttContent={ItemGanttContent}
              />
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
};
